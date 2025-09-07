import React, { createContext, useContext, useState } from "react";
import axios from "axios";

const CHAT_URL = import.meta.env.VITE_CHAT_URL;
const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch notes for a recipe
  const fetchNotes = async (recipeId) => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching notes for recipe:", recipeId);

      // Updated URL to match your backend structure
      const apiUrl = `${CHAT_URL}/recipes/${recipeId}/notes`;
      console.log("API URL:", apiUrl);

      const response = await axios.get(apiUrl);
      setNotes(response.data);
      console.log("Notes fetched successfully:", response.data);
    } catch (error) {
      console.error("Error fetching notes:", error);
      console.error("Error response:", error.response);
      setError("Failed to fetch notes");
    } finally {
      setLoading(false);
    }
  };

  // Send chat message
  const sendChatMessage = async (recipeId, message) => {
    try {
      setLoading(true);
      setError(null);
      console.log("Sending chat message:", message, "for recipe:", recipeId);

      // Updated URL to match your backend structure
      const apiUrl = `${CHAT_URL}/recipes/${recipeId}/chat`;

      const response = await axios.post(apiUrl, { message });

      // Add both user message and AI response to local state
      setNotes((prev) => [
        ...prev,
        response.data.userMessage,
        response.data.aiResponse,
      ]);

      return response.data;
    } catch (error) {
      console.error("Error sending chat message:", error);
      console.error("Error response:", error.response);
      setError("Failed to send message");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Save a note
  const saveNote = async (recipeId, content) => {
    try {
      setError(null);
      // Updated URL to match your backend structure
      const apiUrl = `${URL.replace("/api/recipes", "/api/chat")}/recipes/${recipeId}/notes`;

      const response = await axios.post(apiUrl, {
        content,
        type: "note",
      });

      setNotes((prev) => [...prev, response.data]);
      return response.data;
    } catch (error) {
      console.error("Error saving note:", error);
      setError("Failed to save note");
      throw error;
    }
  };

  // Delete a note
  const deleteNote = async (noteId) => {
    try {
      setError(null);
      // Updated URL to match your backend structure
      const apiUrl = `${URL.replace("/api/recipes", "/api/chat")}/notes/${noteId}`;

      await axios.delete(apiUrl);
      setNotes((prev) => prev.filter((note) => note._id !== noteId));
    } catch (error) {
      console.error("Error deleting note:", error);
      setError("Failed to delete note");
    }
  };

  const value = {
    notes,
    loading,
    error,
    fetchNotes,
    sendChatMessage,
    saveNote,
    deleteNote,
    clearError: () => setError(null),
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
