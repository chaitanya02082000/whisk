import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const enhanceRecipeWithAI = async (recipeData) => {
  console.log("🤖 Starting AI enhancement for recipe:", recipeData.name);
  console.log("📊 Original data:", {
    category: recipeData.category,
    cuisine: recipeData.cuisine,
    ingredients: recipeData.ingredients?.slice(0, 3) // Just first 3 for logging
  });

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
Please analyze this recipe data and provide better categorization and cataloguing. 
Return ONLY a valid JSON object (no markdown, no code blocks, no additional text).

Expected format:
{
  "category": ["array", "of", "categories"],
  "cuisine": ["array", "of", "cuisines"],
  "name": "improved recipe name if needed",
  "description": "improved description if needed"
}

Recipe data to analyze:
Name: ${recipeData.name}
Description: ${recipeData.description}
Ingredients: ${recipeData.ingredients?.join(', ')}
Instructions: ${recipeData.instructions?.slice(0, 3).join('. ')}
Original Category: ${recipeData.category}
Original Cuisine: ${recipeData.cuisine}

Focus on:
- Better food categories (e.g., "Dessert", "Main Course", "Appetizer", "Breakfast", "Snack")
- More specific cuisine types (e.g., "Italian", "Mexican", "Asian", "Mediterranean")
- Keep the same name and description unless they need minor improvements

IMPORTANT: Return ONLY the JSON object, no other text or formatting.
`;

    console.log("📤 Sending prompt to AI...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    console.log("📥 Raw AI response:", text);
    
    // Clean the response to extract JSON
    text = text.trim();
    
    // Remove markdown code blocks if present
    if (text.startsWith('```json')) {
      text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (text.startsWith('```')) {
      text = text.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    // Remove any remaining backticks
    text = text.replace(/`/g, '');
    
    console.log("🧹 Cleaned response:", text);
    
    // Parse the AI response
    const aiEnhancements = JSON.parse(text.trim());
    console.log("✅ Parsed AI enhancements:", aiEnhancements);
    
    const enhancedData = {
      ...recipeData,
      category: aiEnhancements.category || recipeData.category,
      cuisine: aiEnhancements.cuisine || recipeData.cuisine,
      name: aiEnhancements.name || recipeData.name,
      description: aiEnhancements.description || recipeData.description
    };

    console.log("🎯 Final enhanced data:", {
      category: enhancedData.category,
      cuisine: enhancedData.cuisine,
      nameChanged: enhancedData.name !== recipeData.name,
      descriptionChanged: enhancedData.description !== recipeData.description
    });
    
    return enhancedData;
    
  } catch (error) {
    console.error("❌ Error enhancing recipe with AI:", error);
    console.log("🔄 Falling back to original data");
    // Return original data if AI processing fails
    return recipeData;
  }
};

export { enhanceRecipeWithAI };
