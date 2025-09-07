import React, { useState } from "react";
import { useChat } from "../contexts/ChatContext";

import "./ClearChatButton.css";
const ClearChatButton = ({ recipeId, variant = "chat" }) => {
  const { clearChatHistory, clearAllNotes, loading } = useChat();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClear = async () => {
    try {
      if (variant === "chat") {
        await clearChatHistory(recipeId);
      } else {
        await clearAllNotes(recipeId);
      }
      setShowConfirm(false);
    } catch (error) {
      console.error("Failed to clear:", error);
    }
  };

  const buttonText =
    variant === "chat" ? "Clear Chat History" : "Clear All Notes";
  const confirmText =
    variant === "chat"
      ? "Are you sure you want to clear the chat history? This cannot be undone."
      : "Are you sure you want to clear all notes and chat history? This cannot be undone.";

  if (showConfirm) {
    return (
      <div className="clear-chat-confirm">
        <p className="confirm-text">{confirmText}</p>
        <div className="confirm-buttons">
          <button
            onClick={handleClear}
            disabled={loading}
            className="btn btn-danger"
          >
            {loading ? "Clearing..." : "Yes, Clear"}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="btn btn-outline-danger clear-chat-btn"
      title={buttonText}
    >
      <span className="icon">🗑️</span>
      {buttonText}
    </button>
  );
};

export default ClearChatButton;
