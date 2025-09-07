import { enhanceRecipeWithAI } from './gemini.js';
import dotenv from 'dotenv';

dotenv.config();

const testRecipe = {
  name: "Chocolate Chip Cookies",
  description: "Classic homemade cookies",
  category: ["Cookies"],
  cuisine: ["American"],
  ingredients: [
    "2 cups all-purpose flour",
    "1 cup butter",
    "1 cup brown sugar",
    "2 eggs",
    "1 tsp vanilla",
    "1 cup chocolate chips"
  ],
  instructions: [
    "Preheat oven to 375°F",
    "Mix butter and sugar",
    "Add eggs and vanilla",
    "Mix in flour",
    "Fold in chocolate chips",
    "Bake for 12 minutes"
  ]
};

async function testAI() {
  console.log("🧪 Testing AI enhancement...");
  console.log("📋 Original recipe:", testRecipe);
  
  try {
    const enhanced = await enhanceRecipeWithAI(testRecipe);
    console.log("✅ Enhanced recipe:", enhanced);
    
    // Check if categories changed
    const categoriesChanged = JSON.stringify(enhanced.category) !== JSON.stringify(testRecipe.category);
    const cuisineChanged = JSON.stringify(enhanced.cuisine) !== JSON.stringify(testRecipe.cuisine);
    
    console.log("📊 Changes detected:");
    console.log(`  Categories changed: ${categoriesChanged}`);
    console.log(`  Cuisine changed: ${cuisineChanged}`);
    
    if (categoriesChanged || cuisineChanged) {
      console.log("🎉 AI is working! Data was enhanced.");
    } else {
      console.log("⚠️ No changes detected. Check AI prompt or API connection.");
    }
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

testAI();
