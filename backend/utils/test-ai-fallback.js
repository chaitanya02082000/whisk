import { findLDJSON, findRecipe, extractRecipeHTML } from './fetch.js';
import { parseRecipeWithAI } from './ai-recipe-parser.js';
import dotenv from 'dotenv';

dotenv.config();

// Test URLs - one with JSON-LD and one without
const testUrls = [
  'https://www.allrecipes.com/recipe/10275/classic-peanut-butter-cookies/', // Has JSON-LD
  'https://www.food.com/recipe/simple-chocolate-chip-cookies-16589', // May not have JSON-LD
];

async function testBothMethods() {
  for (const url of testUrls) {
    console.log(`\n🧪 Testing: ${url}`);
    
    try {
      // Try JSON-LD first
      const { jsonLd, html, $ } = await findLDJSON(url);
      
      if (jsonLd) {
        console.log("✅ JSON-LD found");
        const recipe = await findRecipe(jsonLd);
        if (recipe) {
          console.log("✅ JSON-LD parsing successful:", recipe.name);
        }
      } else {
        console.log("⚠️ No JSON-LD found, trying AI...");
        const cleanHTML = extractRecipeHTML($);
        const aiRecipe = await parseRecipeWithAI(cleanHTML, url);
        console.log("✅ AI parsing successful:", aiRecipe.name);
      }
      
    } catch (error) {
      console.error("❌ Error:", error.message);
    }
  }
}

testBothMethods();
