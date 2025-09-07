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
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            response: {
              type: "string",
              description: "The main response to the user's question",
            },
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  ingredient: { type: "string" },
                  substitutes: {
                    type: "array",
                    items: { type: "string" },
                  },
                  notes: { type: "string" },
                },
              },
            },
            tips: {
              type: "array",
              items: { type: "string" },
            },
          },
        },
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

Please provide a structured response with:
1. A main response answering their question
2. If they're asking about substitutions, provide an array of ingredient substitution suggestions
3. Any relevant cooking tips

Format your response as JSON with the specified schema. Be helpful, friendly, and concise.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    try {
      const jsonResponse = JSON.parse(response.text());

      // IMPORTANT: Return only the string response for your current backend
      // Your backend expects a string, not an object
      return jsonResponse.response || "I couldn't generate a proper response.";
    } catch (parseError) {
      // Fallback to plain text if JSON parsing fails
      console.warn("Failed to parse JSON response, falling back to plain text");
      return response.text().trim();
    }
  } catch (error) {
    console.error("❌ Error in recipe chat AI:", error);
    return "I'm sorry, I couldn't process your question right now. Please try again later.";
  }
};

export { chatWithRecipeAI };
