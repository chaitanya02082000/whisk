import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const chatWithRecipeAI = async (recipe, userMessage) => {
  console.log("🤖 Processing chat about recipe:", recipe.name);

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    });

    const recipeContext = `
Recipe: ${recipe.name}
Description: ${recipe.description}
Prep Time: ${recipe.prepTime}
Cook Time: ${recipe.cookTime}
Total Time: ${recipe.totalTime}
Serves: ${recipe.yield}
Category: ${recipe.category?.join(", ")}
Cuisine: ${recipe.cuisine?.join(", ")}

Ingredients:
${recipe.ingredients?.map((ing, i) => `${i + 1}. ${ing}`).join("\n")}

Instructions:
${recipe.instructions?.map((inst, i) => `${i + 1}. ${inst}`).join("\n")}
`;

    const prompt = `
You are a helpful cooking assistant. A user is asking about this specific recipe:

${recipeContext}

User question: ${userMessage}

Please provide a helpful, friendly response about this recipe. You can:
- Answer questions about ingredients, cooking techniques, or substitutions
- Provide cooking tips and tricks
- Suggest variations or modifications
- Help with timing and preparation
- Explain cooking terms or techniques
- Give nutritional insights
- Suggest serving ideas or pairings

Keep your response concise but informative, and always relate it back to this specific recipe.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("✅ AI chat response generated");
    return text.trim();
  } catch (error) {
    console.error("❌ Error in recipe chat AI:", error);
    return "I'm sorry, I couldn't process your question right now. Please try again later.";
  }
};

export { chatWithRecipeAI };
