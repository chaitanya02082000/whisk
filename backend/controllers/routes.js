import { response, Router } from "express";
import { Recipe } from "../models/recipe.js";
import { requireAuth } from "../utils/clerkAuth.js";
import { findLDJSON, findRecipe, extractRecipeHTML } from "../utils/fetch.js";
import {
  parseRecipeWithAI,
  enhanceRecipeWithAI,
} from "../utils/ai-recipe-parser.js";

const recipeRouter = Router();

// Apply authentication middleware to all routes
recipeRouter.use(requireAuth);

const sanitizeRecipeData = (data) => {
  return {
    ...data,
    image: typeof data.image === "string" ? data.image : data.image?.url || "",
    name: typeof data.name === "string" ? data.name.trim() : "",
    description:
      typeof data.description === "string" ? data.description.trim() : "",
    cookTime: typeof data.cookTime === "string" ? data.cookTime : "",
    prepTime: typeof data.prepTime === "string" ? data.prepTime : "",
    totalTime: typeof data.totalTime === "string" ? data.totalTime : "",
    yield:
      typeof data.yield === "string"
        ? data.yield
        : Array.isArray(data.yield)
          ? data.yield[0]
          : "",
    category: Array.isArray(data.category)
      ? data.category
      : data.category
        ? [data.category]
        : [],
    cuisine: Array.isArray(data.cuisine)
      ? data.cuisine
      : data.cuisine
        ? [data.cuisine]
        : [],
    ingredients: Array.isArray(data.ingredients) ? data.ingredients : [],
    instructions: Array.isArray(data.instructions) ? data.instructions : [],
  };
};

// Validation function
const validateRecipeData = (data) => {
  const errors = [];

  if (!data.name || data.name.trim() === "") {
    errors.push("Recipe name is required");
  }

  // More lenient validation - allow placeholder content
  if (!Array.isArray(data.ingredients) || data.ingredients.length === 0) {
    errors.push("Recipe must have ingredients information");
  }

  if (!Array.isArray(data.instructions) || data.instructions.length === 0) {
    errors.push("Recipe must have instructions information");
  }

  return errors;
};

// Get user's recipes only
recipeRouter.get("/", async (req, res) => {
  try {
    console.log(`📚 Fetching recipes for user: ${req.userId}`);
    const recipes = await Recipe.find({ userId: req.userId }).sort({
      dateAdded: -1,
    });
    console.log(`✅ Found ${recipes.length} recipes for user`);
    res.json(recipes);
  } catch (error) {
    console.error("Error fetching user recipes:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get specific recipe (verify ownership)
recipeRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Fetching recipe ${id} for user: ${req.userId}`);

    const recipe = await Recipe.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!recipe) {
      return res.status(404).json({
        error: "Recipe not found",
        message: "Recipe doesn't exist or you don't have permission to view it",
      });
    }

    res.json(recipe);
  } catch (error) {
    console.error("Error fetching recipe:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete recipe (verify ownership)
recipeRouter.delete("/:id", async (request, response) => {
  try {
    const { id } = request.params;
    console.log(`🗑️ Deleting recipe ${id} for user: ${request.userId}`);

    const deletedRecipe = await Recipe.findOneAndDelete({
      _id: id,
      userId: request.userId,
    });

    if (!deletedRecipe) {
      return response.status(404).json({
        error: "Recipe not found",
        message:
          "Recipe doesn't exist or you don't have permission to delete it",
      });
    }

    console.log(`✅ Successfully deleted recipe: ${deletedRecipe.name}`);
    response.status(204).end();
  } catch (error) {
    console.error("Error deleting recipe:", error);
    response.status(500).json({ error: error.message });
  }
});

// Parse recipe from URL (associate with user)
recipeRouter.post("/parse", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    console.log(
      `🔍 Starting recipe parsing for user ${req.userId} from URL:`,
      url,
    );

    // Step 1: Try to get data from URL
    const fetchResult = await findLDJSON(url);

    // Handle blocked requests
    if (fetchResult.blocked) {
      console.log("🚫 Website blocked the request");

      // Provide manual input option
      return res.status(403).json({
        error: "Website Access Blocked",
        message: fetchResult.error,
        suggestion:
          "This website uses anti-bot protection. You can manually copy and paste the recipe content, or try a different recipe URL.",
        blockedUrl: url,
        code: "BLOCKED_BY_FIREWALL",
      });
    }

    const { jsonLd, html, $ } = fetchResult;
    let recipeData = null;
    let parsingMethod = "";

    // Step 2: Try JSON-LD first
    if (jsonLd) {
      console.log("📋 Found JSON-LD data, attempting to parse...");
      try {
        recipeData = await findRecipe(jsonLd);
        if (recipeData && recipeData.name && recipeData.name.trim() !== "") {
          parsingMethod = "JSON-LD";
          console.log("✅ Successfully parsed with JSON-LD:", recipeData.name);
        } else {
          console.log("⚠️ JSON-LD data incomplete, trying AI...");
          recipeData = null;
        }
      } catch (error) {
        console.log("⚠️ JSON-LD parsing failed:", error.message);
      }
    }

    // Step 3: Fallback to AI parsing if JSON-LD failed
    if (!recipeData) {
      console.log("🤖 Using AI parsing...");
      try {
        const cleanHTML = extractRecipeHTML($);
        console.log("📄 Extracted HTML length:", cleanHTML.length);

        if (cleanHTML.length < 200) {
          throw new Error("Insufficient content extracted from webpage");
        }

        recipeData = await parseRecipeWithAI(cleanHTML, url);
        parsingMethod = "AI";
        console.log("✅ AI parsing completed:", recipeData.name);
      } catch (error) {
        console.error("❌ AI parsing failed:", error.message);
        return res.status(422).json({
          error: "Recipe Extraction Failed",
          message:
            "Could not extract recipe content from this webpage. The page might not contain a recipe, or the content is not accessible.",
          details: error.message,
          suggestion:
            "Try a different recipe URL or manually input the recipe.",
          code: "EXTRACTION_FAILED",
        });
      }
    }

    // Step 4: Validate the parsed data
    const validationErrors = validateRecipeData(recipeData);
    if (validationErrors.length > 0) {
      console.error("❌ Validation failed:", validationErrors.join(", "));
      return res.status(422).json({
        error: "Incomplete Recipe Data",
        message: "The parsed recipe data is missing required fields.",
        details: validationErrors.join(", "),
        code: "VALIDATION_ERROR",
      });
    }

    // Step 5: Process and structure the data (ADD userId here)
    const processedData = sanitizeRecipeData({
      name: recipeData.name?.trim() || "",
      image: recipeData.image || "",
      description: recipeData.description || `A recipe for ${recipeData.name}`,
      cookTime: recipeData.cookTime || "",
      prepTime: recipeData.prepTime || "",
      totalTime: recipeData.totalTime || "",
      category: recipeData.category,
      cuisine: recipeData.cuisine,
      ingredients: recipeData.ingredients || [],
      instructions: recipeData.instructions || [],
      yield: recipeData.yield || "",
      sourceUrl: url,
      parsingMethod: parsingMethod,
      userId: req.userId, // 🔑 Associate recipe with authenticated user
    });

    // Step 6: Enhance the data with another AI call
    console.log("✨ Enhancing recipe with AI...");
    const enhancedData = await enhanceRecipeWithAI(processedData);

    // Step 7: Save the final recipe to the database
    console.log("💾 Saving recipe to the database...");
    const recipe = new Recipe(enhancedData);
    const savedRecipe = await recipe.save();

    console.log(
      `✅ Recipe saved successfully for user ${req.userId}:`,
      savedRecipe.name,
    );

    res.status(201).json(savedRecipe);
  } catch (error) {
    console.error("❌ Error processing recipe:", error);
    res.status(500).json({
      error: "Server Error",
      message: "An unexpected error occurred while processing the recipe.",
      details: error.message,
    });
  }
});

// Add a new route for manual recipe input (associate with user)
recipeRouter.post("/manual", async (req, res) => {
  try {
    const { recipeText, url } = req.body;

    if (!recipeText) {
      return res.status(400).json({ error: "Recipe text is required" });
    }

    console.log(
      `📝 Processing manually provided recipe text for user: ${req.userId}`,
    );

    // Use AI to parse the manually provided text
    const recipeData = await parseRecipeWithAI(
      recipeText,
      url || "manual-input",
    );

    // Process and save as normal (ADD userId here)
    const processedData = {
      name: recipeData.name.trim(),
      image: recipeData.image || "",
      description: recipeData.description || "Manually added recipe",
      cookTime: recipeData.cookTime || "",
      prepTime: recipeData.prepTime || "",
      totalTime: recipeData.totalTime || "",
      category: Array.isArray(recipeData.category)
        ? recipeData.category
        : [recipeData.category].filter(Boolean),
      cuisine: Array.isArray(recipeData.cuisine)
        ? recipeData.cuisine
        : [recipeData.cuisine].filter(Boolean),
      ingredients: recipeData.ingredients || [],
      instructions: recipeData.instructions || [],
      yield: recipeData.yield || "",
      sourceUrl: url || "manual-input",
      parsingMethod: "Manual + AI",
      userId: req.userId, // 🔑 Associate recipe with authenticated user
    };

    // Enhance and save
    const enhancedData = await enhanceRecipeWithAI(processedData);
    const recipe = new Recipe(enhancedData);
    const savedRecipe = await recipe.save();

    console.log(
      `✅ Manual recipe saved successfully for user ${req.userId}:`,
      savedRecipe.name,
    );

    res.status(201).json(savedRecipe);
  } catch (error) {
    console.error("❌ Error processing manual recipe:", error);
    res.status(500).json({
      error: "Failed to process manual recipe: " + error.message,
    });
  }
});

// Update recipe (verify ownership)
recipeRouter.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    console.log(`✏️ Updating recipe ${id} for user: ${req.userId}`);

    // Remove userId from updates to prevent tampering
    delete updates.userId;

    const updatedRecipe = await Recipe.findOneAndUpdate(
      { _id: id, userId: req.userId }, // Only update if user owns the recipe
      updates,
      { new: true },
    );

    if (!updatedRecipe) {
      return res.status(404).json({
        error: "Recipe not found",
        message:
          "Recipe doesn't exist or you don't have permission to update it",
      });
    }

    console.log(`✅ Successfully updated recipe: ${updatedRecipe.name}`);
    res.json(updatedRecipe);
  } catch (error) {
    console.error("Error updating recipe:", error);
    res.status(500).json({ error: error.message });
  }
});

export { recipeRouter };
