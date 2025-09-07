import { findLDJSON, extractRecipeHTML } from './fetch.js';
import { parseRecipeWithAI } from './ai-recipe-parser.js';
import dotenv from 'dotenv';

dotenv.config();

async function debugRecipe(url) {
  console.log("🧪 Debugging recipe parsing for:", url);
  
  try {
    const { jsonLd, html, $ } = await findLDJSON(url);
    
    if (jsonLd) {
      console.log("✅ JSON-LD found:", Object.keys(jsonLd));
    } else {
      console.log("❌ No JSON-LD found");
      
      const cleanHTML = extractRecipeHTML($);
      console.log("📄 HTML length:", cleanHTML.length);
      console.log("📄 First 200 chars:", cleanHTML.substring(0, 200));
      
      const aiResult = await parseRecipeWithAI(cleanHTML, url);
      console.log("🤖 AI Result:", {
        name: aiResult.name,
        nameLength: aiResult.name?.length,
        hasIngredients: aiResult.ingredients?.length > 0,
        hasInstructions: aiResult.instructions?.length > 0
      });
    }
    
  } catch (error) {
    console.error("❌ Debug failed:", error);
  }
}

// Test with a recipe URL
debugRecipe('https://www.recipetineats.com/chicken-breast-recipe/');
