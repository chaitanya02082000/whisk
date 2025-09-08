import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
    index: true, // Index for faster user-specific queries
  },
  image: {
    type: String, // Changed to handle URL string or object.url
  },
  description: {
    type: String,
  },
  cookTime: {
    type: String,
  },
  prepTime: {
    type: String,
  },
  totalTime: {
    type: String,
  },
  category: {
    type: [String], // Changed to array of strings
  },
  cuisine: {
    type: [String], // Changed to array of strings
  },
  ingredients: {
    type: [String],
    required: true,
  },
  instructions: {
    type: [String],
    required: true,
  },
  yield: {
    type: String,
  },
  sourceUrl: {
    type: String,
  },
  parsingMethod: {
    type: String,
  },
  dateAdded: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for efficient user-specific queries
recipeSchema.index({ userId: 1, dateAdded: -1 });

export const Recipe = mongoose.model("Recipe", recipeSchema);
