import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const parseRecipeWithAI = async (htmlContent, url) => {
  console.log("🤖 Parsing recipe with AI from HTML content...");
  console.log("📏 Content length:", htmlContent.length);

  if (htmlContent.length < 100) {
    throw new Error("Insufficient content to parse recipe");
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2048,
      },
    });

    const contentForAI =
      htmlContent.length > 12000
        ? htmlContent.substring(0, 12000) + "...[content continues]"
        : htmlContent;

    const prompt = `
Analyze this webpage content and extract recipe information. URL: ${url}

Content:
${contentForAI}

Extract recipe details and return a JSON object with this structure:
{
  "name": "Recipe Title",
  "description": "Brief description",
  "image": "image URL as string or empty string",
  "cookTime": "cooking time",
  "prepTime": "prep time", 
  "totalTime": "total time",
  "category": ["category1", "category2"],
  "cuisine": ["cuisine1"],
  "ingredients": ["ingredient 1 with quantity", "ingredient 2"],
  "instructions": ["step 1", "step 2", "step 3"],
  "yield": "servings"
}

IMPORTANT:
- For image field, return ONLY the URL string, not an object
- Extract the actual recipe name from the content
- Find ALL ingredients listed (even if formatting is unclear)
- Extract ALL cooking steps/instructions
- Return valid JSON only, no markdown formatting

JSON:`;

    console.log("📤 Sending to AI...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();

    console.log("📥 Raw response length:", text.length);
    console.log("📥 Response preview:", text.substring(0, 150) + "...");

    text = text
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .replace(/`/g, "")
      .trim();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }

    let aiRecipe;
    try {
      aiRecipe = JSON.parse(text);
    } catch (parseError) {
      console.error("❌ JSON parse error:", parseError);
      console.log("🔍 Cleaned text:", text);
      throw new Error("AI returned invalid JSON format");
    }

    // Helper function to extract image URL
    const extractImageUrl = (imageData) => {
      if (!imageData) return "";
      if (typeof imageData === "string") return imageData;
      if (Array.isArray(imageData)) {
        const firstImage = imageData[0];
        if (typeof firstImage === "string") return firstImage;
        if (firstImage && firstImage.url) return firstImage.url;
        return "";
      }
      if (imageData.url) return imageData.url;
      return "";
    };

    // Validate and enhance the recipe data
    const validatedRecipe = {
      name: aiRecipe.name?.trim() || `Recipe from ${new URL(url).hostname}`,
      description: aiRecipe.description?.trim() || "A delicious recipe",
      image: extractImageUrl(aiRecipe.image), // Fix: Properly extract image URL
      cookTime: aiRecipe.cookTime || "",
      prepTime: aiRecipe.prepTime || "",
      totalTime: aiRecipe.totalTime || "",
      category: Array.isArray(aiRecipe.category)
        ? aiRecipe.category
        : aiRecipe.category
          ? [aiRecipe.category]
          : ["Main Course"],
      cuisine: Array.isArray(aiRecipe.cuisine)
        ? aiRecipe.cuisine
        : aiRecipe.cuisine
          ? [aiRecipe.cuisine]
          : ["Indian"],
      ingredients:
        Array.isArray(aiRecipe.ingredients) && aiRecipe.ingredients.length > 0
          ? aiRecipe.ingredients
          : [
              "Ingredients not clearly specified - please check the original recipe",
            ],
      instructions:
        Array.isArray(aiRecipe.instructions) && aiRecipe.instructions.length > 0
          ? aiRecipe.instructions
          : [
              "Instructions not clearly specified - please check the original recipe",
            ],
      yield: aiRecipe.yield || "4 servings",
    };

    console.log("✅ Validated recipe:", {
      name: validatedRecipe.name,
      image: validatedRecipe.image,
      ingredientsCount: validatedRecipe.ingredients.length,
      instructionsCount: validatedRecipe.instructions.length,
    });

    return validatedRecipe;
  } catch (error) {
    console.error("❌ Error in AI parsing:", error);

    const hostname = new URL(url).hostname;
    return {
      name: `Recipe from ${hostname}`,
      description: `Recipe from ${url} - content could not be fully extracted`,
      image: "", // Fix: Always return string
      cookTime: "",
      prepTime: "",
      totalTime: "",
      category: ["Main Course"],
      cuisine: hostname.includes("indian") ? ["Indian"] : ["Unknown"],
      ingredients: [
        "Ingredients not available - please visit the original recipe",
        `Original URL: ${url}`,
      ],
      instructions: [
        "Instructions not available - please visit the original recipe",
        `Please visit: ${url}`,
      ],
      yield: "4 servings",
    };
  }
};
const enhanceRecipeWithAI = async (recipeData) => {
  console.log("🎯 Enhancing recipe:", recipeData.name);

  // Skip enhancement if the basic data is missing or is a fallback
  if (
    !recipeData.name ||
    recipeData.name.trim() === "" ||
    recipeData.ingredients[0]?.includes("not available") ||
    recipeData.instructions[0]?.includes("not available")
  ) {
    console.log("⚠️ Skipping enhancement - insufficient data");
    return recipeData;
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.1,
      },
    });

    const prompt = `
Improve categorization for this recipe:

Name: ${recipeData.name}
Current categories: ${JSON.stringify(recipeData.category)}
Current cuisines: ${JSON.stringify(recipeData.cuisine)}
First 3 ingredients: ${recipeData.ingredients?.slice(0, 3).join(", ")}

Return only JSON:
{
  "category": ["improved categories"],
  "cuisine": ["improved cuisines"]
}

Categories: Appetizer, Main Course, Dessert, Breakfast, Snack, Side Dish, Soup, Salad
Cuisines: Indian, Italian, Mexican, Asian, American, Mediterranean, Chinese, etc.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();

    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const enhanced = JSON.parse(text);

    return {
      ...recipeData,
      category: enhanced.category || recipeData.category,
      cuisine: enhanced.cuisine || recipeData.cuisine,
    };
  } catch (error) {
    console.error("❌ Enhancement failed:", error);
    return recipeData;
  }
};

export { parseRecipeWithAI, enhanceRecipeWithAI };
