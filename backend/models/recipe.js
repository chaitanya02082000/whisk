import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  image: {
    type: String  // Changed to handle URL string or object.url
  },
  description: {
    type: String
  },
  cookTime: {
    type: String
  },
  prepTime: {
    type: String
  },
  totalTime: {
    type: String
  },
  category: {
    type: [String]  // Changed to array of strings
  },
  cuisine: {
    type: [String]  // Changed to array of strings
  },
  ingredients: {
    type: [String],
    required: true
  },
  instructions: {
    type: [String],
    required: true
  },
  yield: {
    type: String
  },
  sourceUrl: {
    type: String
  },
  dateAdded: {
    type: Date,
    default: Date.now
  }
});

export const Recipe = mongoose.model("Recipe", recipeSchema);
