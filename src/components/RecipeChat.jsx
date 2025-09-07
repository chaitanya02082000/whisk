import { useState, useEffect, useRef } from "react";
import { useChat } from "../contexts/ChatContext";
import "./RecipeChat.css";

const RecipeChat = ({ recipe, activeView, onViewChange }) => {
  const [message, setMessage] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const { notes, loading, sendChatMessage, saveNote, deleteNote, fetchNotes } =
    useChat();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (recipe?._id) {
      fetchNotes(recipe._id);
    }
  }, [recipe?._id]);

  useEffect(() => {
    scrollToBottom();
  }, [notes]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      await sendChatMessage(recipe._id, message);
      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleSaveNote = async (e) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    try {
      await saveNote(recipe._id, noteContent);
      setNoteContent("");
    } catch (error) {
      console.error("Failed to save note:", error);
    }
  };

  // New function to save a chat message as a note
  const handleSaveChatAsNote = async (chatMessage) => {
    try {
      const noteText = chatMessage.isFromAI
        ? `💡 AI Tip: ${chatMessage.content}`
        : `💭 My Question: ${chatMessage.content}`;

      await saveNote(recipe._id, noteText);

      // Show a brief success message (you can style this)
      alert("Message saved to notes!");
    } catch (error) {
      console.error("Failed to save chat as note:", error);
      alert("Failed to save message to notes");
    }
  };

  const chatMessages = notes.filter((note) => note.type === "chat");
  const savedNotes = notes.filter((note) => note.type === "note");

  return (
    <div className="recipe-chat">
      <div className="chat-header">
        <h3>Recipe Assistant</h3>
        <div className="view-toggle">
          <button
            className={activeView === "chat" ? "active" : ""}
            onClick={() => onViewChange("chat")}
          >
            💬 Chat ({chatMessages.length})
          </button>
          <button
            className={activeView === "notes" ? "active" : ""}
            onClick={() => onViewChange("notes")}
          >
            📝 Notes ({savedNotes.length})
          </button>
        </div>
      </div>

      {activeView === "chat" && (
        <div className="chat-view">
          <div className="messages-container">
            {chatMessages.length === 0 ? (
              <div className="empty-state">
                <p>Ask me anything about this recipe!</p>
                <div className="suggestion-chips">
                  <button
                    onClick={() =>
                      setMessage("Can I substitute any ingredients?")
                    }
                  >
                    Substitutions?
                  </button>
                  <button
                    onClick={() =>
                      setMessage("Any cooking tips for this recipe?")
                    }
                  >
                    Cooking tips?
                  </button>
                  <button
                    onClick={() => setMessage("How can I make this healthier?")}
                  >
                    Make it healthier?
                  </button>
                </div>
              </div>
            ) : (
              chatMessages.map((note) => (
                <div
                  key={note._id}
                  className={`message ${note.isFromAI ? "ai-message" : "user-message"}`}
                >
                  <div className="message-content">{note.content}</div>
                  <div className="message-footer">
                    <div className="message-time">
                      {new Date(note.timestamp).toLocaleTimeString()}
                    </div>
                    {/* Save to Notes button */}
                    <button
                      className="save-to-notes-btn"
                      onClick={() => handleSaveChatAsNote(note)}
                      title="Save this message to notes"
                    >
                      📝
                    </button>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="message-form">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about ingredients, cooking tips, substitutions..."
              disabled={loading}
            />
            <button type="submit" disabled={loading || !message.trim()}>
              {loading ? "⏳" : "➤"}
            </button>
          </form>
        </div>
      )}

      {activeView === "notes" && (
        <div className="notes-view">
          {/* Manual note input form */}
          <form onSubmit={handleSaveNote} className="note-form">
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Add your personal notes about this recipe..."
              rows="3"
            />
            <button type="submit" disabled={!noteContent.trim()}>
              💾 Save Note
            </button>
          </form>

          <div className="notes-list">
            {savedNotes.length === 0 ? (
              <div className="empty-state">
                <p>No notes yet!</p>
                <p>
                  💡 <strong>Tip:</strong> You can save chat messages as notes
                  by clicking the 📝 button next to any message in the chat.
                </p>
              </div>
            ) : (
              savedNotes.map((note) => (
                <div key={note._id} className="note-item">
                  <div className="note-content">{note.content}</div>
                  <div className="note-footer">
                    <span className="note-time">
                      {new Date(note.timestamp).toLocaleDateString()} at{" "}
                      {new Date(note.timestamp).toLocaleTimeString()}
                    </span>
                    <button
                      onClick={() => deleteNote(note._id)}
                      className="delete-note-btn"
                      title="Delete this note"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeChat;
