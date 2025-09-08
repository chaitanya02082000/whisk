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
        maxOutputTokens: 2048, // Increased from 1024
        responseMimeType: "text/plain", // Changed from JSON
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
You are a helpful cooking assistant chatting with someone about a recipe. Keep your response conversational, friendly, and well-formatted.

Recipe Context:
${recipeContext}

User Question: "${userMessage}"

Guidelines for your response:
- Write in a friendly, conversational tone
- Use proper paragraphs and line breaks for readability
- If suggesting substitutions, format them clearly with bullet points
- Keep cooking tips organized and easy to read
- End with an encouraging note or follow-up question if appropriate
- Maximum 3-4 paragraphs unless they ask for detailed instructions
- Use emojis sparingly and appropriately

Provide a helpful response:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    const cleanResponse = response.text().trim();

    // Add some basic formatting if the response is too long or poorly structured
    const formattedResponse = formatChatResponse(cleanResponse);

    console.log("✅ Generated response length:", formattedResponse.length);

    return formattedResponse;
  } catch (error) {
    console.error("❌ Error in recipe chat AI:", error);
    return "I'm sorry, I couldn't process your question right now. Please try again later.";
  }
};

// Helper function to format the AI response
const formatChatResponse = (response) => {
  // Remove any JSON artifacts that might have leaked through
  let formatted = response.replace(/^```json\s*/, "").replace(/```$/, "");
  formatted = formatted
    .replace(/^\{[\s\S]*?"response":\s*"/, "")
    .replace(/"[\s\S]*\}$/, "");

  // Clean up common formatting issues
  formatted = formatted
    .replace(/\*\*/g, "") // Remove markdown bold
    .replace(/\* /g, "\n• ") // Convert asterisk lists to bullet points
    .replace(/\n\n\n+/g, "\n\n") // Remove excessive line breaks
    .replace(/^\n+/, "") // Remove leading newlines
    .replace(/\n+$/, ""); // Remove trailing newlines

  // Ensure proper paragraph breaks
  formatted = formatted.replace(/([.!?])\s*([A-Z])/g, "$1\n\n$2");

  return formatted;
};

export { chatWithRecipeAI };
