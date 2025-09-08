import React, { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";

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
  const { getToken } = useAuth(); // Add Clerk auth hook
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chatHistory, setChatHistory] = useState({});

  // Helper function to get auth headers
  const getAuthHeaders = useCallback(async () => {
    try {
      const token = await getToken();
      return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
    } catch (error) {
      console.error("Failed to get auth token:", error);
      throw new Error("Authentication failed");
    }
  }, [getToken]);

  // Clear chat history for a recipe
  const clearChatHistory = async (recipeId) => {
    try {
      setError(null);
      setLoading(true);

      const headers = await getAuthHeaders();
      const apiUrl = `${CHAT_URL}/recipes/${recipeId}/chat`;
      const response = await axios.delete(apiUrl, { headers });

      // Remove chat messages from local state (keep notes)
      setNotes((prev) =>
        prev.filter(
          (note) => !(note.recipeId === recipeId && note.type === "chat"),
        ),
      );

      console.log(
        `✅ Cleared chat history: ${response.data.deletedCount} messages`,
      );
      return response.data;
    } catch (error) {
      console.error("Error clearing chat history:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to clear chat history";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Clear all notes and chats for a recipe
  const clearAllNotes = async (recipeId) => {
    try {
      setError(null);
      setLoading(true);

      const headers = await getAuthHeaders();
      const apiUrl = `${CHAT_URL}/recipes/${recipeId}/all-notes`;
      const response = await axios.delete(apiUrl, { headers });

      // Remove all notes for this recipe from local state
      setNotes((prev) => prev.filter((note) => note.recipeId !== recipeId));

      console.log(`✅ Cleared all notes: ${response.data.deletedCount} items`);
      return response.data;
    } catch (error) {
      console.error("Error clearing all notes:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to clear all notes";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced error handling
  const handleError = useCallback((error, defaultMessage) => {
    console.error("API Error:", error);
    const errorMessage =
      error.response?.data?.error || error.message || defaultMessage;
    setError(errorMessage);
    return errorMessage;
  }, []);

  // Fetch notes for a recipe with authentication
  const fetchNotes = useCallback(
    async (recipeId) => {
      try {
        setLoading(true);
        setError(null);

        const headers = await getAuthHeaders();
        const apiUrl = `${CHAT_URL}/recipes/${recipeId}/notes`;
        const response = await axios.get(apiUrl, { headers });

        setNotes(response.data);
        setChatHistory((prev) => ({
          ...prev,
          [recipeId]: response.data.filter((note) => note.type === "chat"),
        }));

        return response.data;
      } catch (error) {
        throw new Error(handleError(error, "Failed to fetch notes"));
      } finally {
        setLoading(false);
      }
    },
    [handleError, getAuthHeaders],
  );

  // Enhanced chat message sending with optimistic updates
  const sendChatMessage = useCallback(
    async (recipeId, message) => {
      try {
        setLoading(true);
        setError(null);

        // Optimistic update - add user message immediately
        const tempUserMessage = {
          _id: `temp-${Date.now()}`,
          content: message,
          type: "chat",
          isFromAI: false,
          timestamp: new Date().toISOString(),
          recipeId,
        };

        setNotes((prev) => [...prev, tempUserMessage]);

        const headers = await getAuthHeaders();
        const apiUrl = `${CHAT_URL}/recipes/${recipeId}/chat`;
        const response = await axios.post(apiUrl, { message }, { headers });

        // Remove temp message and add real messages
        setNotes((prev) => [
          ...prev.filter((note) => note._id !== tempUserMessage._id),
          response.data.userMessage,
          response.data.aiResponse,
        ]);

        // Update chat history
        setChatHistory((prev) => ({
          ...prev,
          [recipeId]: [
            ...(prev[recipeId] || []),
            response.data.userMessage,
            response.data.aiResponse,
          ],
        }));

        return response.data;
      } catch (error) {
        // Remove optimistic update on error
        setNotes((prev) =>
          prev.filter((note) => note._id !== tempUserMessage._id),
        );
        throw new Error(handleError(error, "Failed to send message"));
      } finally {
        setLoading(false);
      }
    },
    [handleError, getAuthHeaders],
  );

  // Enhanced note saving with validation
  const saveNote = useCallback(
    async (recipeId, content, type = "note") => {
      if (!content?.trim()) {
        throw new Error("Note content cannot be empty");
      }

      try {
        setError(null);
        const headers = await getAuthHeaders();
        const apiUrl = `${CHAT_URL}/recipes/${recipeId}/notes`;
        const response = await axios.post(
          apiUrl,
          {
            content: content.trim(),
            type,
          },
          { headers },
        );

        setNotes((prev) => [...prev, response.data]);
        return response.data;
      } catch (error) {
        throw new Error(handleError(error, "Failed to save note"));
      }
    },
    [handleError, getAuthHeaders],
  );

  // Fixed delete note function
  const deleteNote = useCallback(
    async (noteId) => {
      try {
        setError(null);
        const headers = await getAuthHeaders();
        const apiUrl = `${CHAT_URL}/notes/${noteId}`;

        await axios.delete(apiUrl, { headers });
        setNotes((prev) => prev.filter((note) => note._id !== noteId));

        // Update chat history
        setChatHistory((prev) => {
          const updated = { ...prev };
          Object.keys(updated).forEach((recipeId) => {
            updated[recipeId] = updated[recipeId].filter(
              (note) => note._id !== noteId,
            );
          });
          return updated;
        });
      } catch (error) {
        handleError(error, "Failed to delete note");
      }
    },
    [handleError, getAuthHeaders],
  );

  // Get chat history for a specific recipe
  const getChatHistory = useCallback(
    (recipeId) => {
      return chatHistory[recipeId] || [];
    },
    [chatHistory],
  );

  const value = {
    notes,
    loading,
    error,
    chatHistory,
    fetchNotes,
    sendChatMessage,
    saveNote,
    deleteNote,
    getChatHistory,
    clearChatHistory,
    clearAllNotes,
    clearError: () => setError(null),
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
