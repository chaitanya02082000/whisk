import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
  recipeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Recipe",
    required: true,
  },
  userId: {
    type: String,
    required: true,
    index: true, // Index for faster user-specific queries
  },
  content: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["chat", "note"],
    required: true,
  },
  isFromAI: {
    type: Boolean,
    default: false,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Compound indexes for efficient queries
noteSchema.index({ recipeId: 1, userId: 1, timestamp: 1 });
noteSchema.index({ userId: 1, type: 1, timestamp: -1 });

export const Note = mongoose.model("Note", noteSchema);
