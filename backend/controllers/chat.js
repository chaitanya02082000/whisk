import { Router } from "express";
import { Note } from "../models/notes.js";
import { Recipe } from "../models/recipe.js";
import { requireAuth } from "../utils/clerkAuth.js";
import { chatWithRecipeAI } from "../utils/recipe-chat-ai.js";

const chatRouter = Router();

// Apply authentication middleware to all routes
chatRouter.use(requireAuth);

// Helper function to verify recipe ownership
const verifyRecipeOwnership = async (recipeId, userId) => {
  const recipe = await Recipe.findOne({ _id: recipeId, userId });
  return recipe;
};

// Get all notes/chats for a recipe (verify ownership)
chatRouter.get("/recipes/:recipeId/notes", async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.userId;

    console.log(`📝 Fetching notes for recipe ${recipeId} by user ${userId}`);

    // Verify recipe belongs to user
    const recipe = await verifyRecipeOwnership(recipeId, userId);
    if (!recipe) {
      return res.status(404).json({
        error: "Recipe not found",
        message: "Recipe doesn't exist or you don't have permission to view it",
      });
    }

    // Get notes for this recipe and user
    const notes = await Note.find({
      recipeId,
      userId,
    }).sort({ timestamp: 1 });

    console.log(`✅ Found ${notes.length} notes for recipe`);
    res.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ error: error.message });
  }
});

// Save a note (verify recipe ownership)
chatRouter.post("/recipes/:recipeId/notes", async (req, res) => {
  try {
    const { recipeId } = req.params;
    const { content, type } = req.body;
    const userId = req.userId;

    if (!content || !type) {
      return res.status(400).json({ error: "Content and type are required" });
    }

    console.log(`📝 Saving ${type} for recipe ${recipeId} by user ${userId}`);

    // Verify recipe belongs to user
    const recipe = await verifyRecipeOwnership(recipeId, userId);
    if (!recipe) {
      return res.status(404).json({
        error: "Recipe not found",
        message:
          "Recipe doesn't exist or you don't have permission to add notes to it",
      });
    }

    const note = new Note({
      recipeId,
      userId, // Associate note with user
      content,
      type,
      isFromAI: false,
    });

    const savedNote = await note.save();
    console.log(`✅ Saved ${type} successfully`);
    res.status(201).json(savedNote);
  } catch (error) {
    console.error("Error saving note:", error);
    res.status(500).json({ error: error.message });
  }
});

// Clear chat history for a recipe (verify ownership)
chatRouter.delete("/recipes/:recipeId/chat", async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.userId;

    console.log(
      `🗑️ Clearing chat history for recipe ${recipeId} by user ${userId}`,
    );

    // Verify recipe belongs to user
    const recipe = await verifyRecipeOwnership(recipeId, userId);
    if (!recipe) {
      return res.status(404).json({
        error: "Recipe not found",
        message:
          "Recipe doesn't exist or you don't have permission to clear its chat history",
      });
    }

    // Delete only chat messages for this recipe and user (keep notes)
    const result = await Note.deleteMany({
      recipeId,
      userId, // Only delete user's own chat messages
      type: "chat",
    });

    console.log(`✅ Cleared ${result.deletedCount} chat messages`);
    res.json({
      message: `Cleared ${result.deletedCount} chat messages`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error clearing chat history:", error);
    res.status(500).json({ error: error.message });
  }
});

// Chat with AI about a recipe (verify ownership)
chatRouter.post("/recipes/:recipeId/chat", async (req, res) => {
  try {
    const { recipeId } = req.params;
    const { message } = req.body;
    const userId = req.userId;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    console.log(`💬 Starting chat for recipe ${recipeId} by user ${userId}`);

    // Verify recipe belongs to user
    const recipe = await verifyRecipeOwnership(recipeId, userId);
    if (!recipe) {
      return res.status(404).json({
        error: "Recipe not found",
        message:
          "Recipe doesn't exist or you don't have permission to chat about it",
      });
    }

    // Save user message
    const userNote = new Note({
      recipeId,
      userId, // Associate with user
      content: message,
      type: "chat",
      isFromAI: false,
    });
    await userNote.save();
    console.log(`✅ Saved user message`);

    // Get AI response
    console.log(`🤖 Getting AI response for recipe: ${recipe.name}`);
    const aiResponse = await chatWithRecipeAI(recipe, message);

    // Ensure we save a string, not an object
    let aiContent;
    if (typeof aiResponse === "object") {
      // If it's an object, stringify it or extract the main response
      aiContent = aiResponse.response || JSON.stringify(aiResponse);
    } else {
      aiContent = aiResponse;
    }

    // Save AI response
    const aiNote = new Note({
      recipeId,
      userId, // Associate with user
      content: aiContent, // Now guaranteed to be a string
      type: "chat",
      isFromAI: true,
    });
    await aiNote.save();
    console.log(`✅ Saved AI response`);

    res.json({
      userMessage: userNote,
      aiResponse: aiNote,
    });
  } catch (error) {
    console.error("Error in chat:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a specific note (verify ownership)
chatRouter.delete("/notes/:noteId", async (req, res) => {
  try {
    const { noteId } = req.params;
    const userId = req.userId;

    console.log(`🗑️ Deleting note ${noteId} by user ${userId}`);

    // Find and delete note only if it belongs to the user
    const deletedNote = await Note.findOneAndDelete({
      _id: noteId,
      userId,
    });

    if (!deletedNote) {
      return res.status(404).json({
        error: "Note not found",
        message: "Note doesn't exist or you don't have permission to delete it",
      });
    }

    console.log(`✅ Successfully deleted note`);
    res.status(204).end();
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ error: error.message });
  }
});

export { chatRouter };
