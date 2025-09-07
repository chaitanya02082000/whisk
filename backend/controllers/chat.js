import { Router } from "express";
import { Note } from "../models/notes.js"; // Fixed import path
import { Recipe } from "../models/recipe.js";
import { chatWithRecipeAI } from "../utils/recipe-chat-ai.js";

const chatRouter = Router();

// Get all notes/chats for a recipe - Updated route
chatRouter.get("/recipes/:recipeId/notes", async (req, res) => {
  try {
    const { recipeId } = req.params;
    const notes = await Note.find({ recipeId }).sort({ timestamp: 1 });
    res.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ error: error.message });
  }
});

// Save a note - Updated route
chatRouter.post("/recipes/:recipeId/notes", async (req, res) => {
  try {
    const { recipeId } = req.params;
    const { content, type } = req.body;

    if (!content || !type) {
      return res.status(400).json({ error: "Content and type are required" });
    }

    const note = new Note({
      recipeId,
      content,
      type,
      isFromAI: false,
    });

    const savedNote = await note.save();
    res.status(201).json(savedNote);
  } catch (error) {
    console.error("Error saving note:", error);
    res.status(500).json({ error: error.message });
  }
});

// Chat with AI about a recipe - Updated route
chatRouter.post("/recipes/:recipeId/chat", async (req, res) => {
  try {
    const { recipeId } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Get the recipe data
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    // Save user message
    const userNote = new Note({
      recipeId,
      content: message,
      type: "chat",
      isFromAI: false,
    });
    await userNote.save();

    // Get AI response
    const aiResponse = await chatWithRecipeAI(recipe, message);

    // Save AI response
    const aiNote = new Note({
      recipeId,
      content: aiResponse,
      type: "chat",
      isFromAI: true,
    });
    await aiNote.save();

    res.json({
      userMessage: userNote,
      aiResponse: aiNote,
    });
  } catch (error) {
    console.error("Error in chat:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a note
chatRouter.delete("/notes/:noteId", async (req, res) => {
  try {
    const { noteId } = req.params;
    await Note.findByIdAndDelete(noteId);
    res.status(204).end();
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ error: error.message });
  }
});

export { chatRouter };
