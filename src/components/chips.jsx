import { useState, useEffect } from "react";
import { useRecipes } from "../contexts/RecipeContext";
import "./chips.css";

const Chips = ({ onChipsChange }) => {
  const [text, setText] = useState("");
  const [chips, setChips] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);

  const { recipes } = useRecipes();

  useEffect(() => {
    if (recipes.length > 0) {
      const categories = recipes.flatMap((recipe) => recipe.category || []);
      const cuisines = recipes.flatMap((recipe) => recipe.cuisine || []);
      const allTags = [...new Set([...categories, ...cuisines])];
      setAvailableTags(allTags);
    }
  }, [recipes]);

  useEffect(() => {
    if (onChipsChange) {
      onChipsChange(chips);
    }
  }, [chips, onChipsChange]);

  const handleKey = (e) => {
    if (e.key === "Enter" && text.trim()) {
      e.preventDefault();
      if (!chips.includes(text.trim())) {
        setChips((prev) => [...prev, text.trim()]);
      }
      setText("");
    }
  };

  const removeChip = (indexToRemove) => {
    setChips(chips.filter((_, index) => index !== indexToRemove));
  };

  const addTagChip = (tag) => {
    if (!chips.includes(tag)) {
      setChips((prev) => [...prev, tag]);
    }
  };

  const clearAllChips = () => {
    setChips([]);
  };

  return (
    <div className="chips-container">
      <input
        className="chips-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKey}
        placeholder="Add custom tags... (Press Enter)"
      />

      {availableTags.length > 0 && (
        <div className="chips-section">
          <div className="chips-section-header">
            <h4 className="chips-section-title">
              Available from your recipes:
            </h4>
            {chips.length > 0 && (
              <button className="chips-clear-button" onClick={clearAllChips}>
                Clear all
              </button>
            )}
          </div>
          <div className="chips-available">
            {availableTags.map((tag, index) => (
              <button
                key={index}
                className="chip-available"
                onClick={() => addTagChip(tag)}
                disabled={chips.includes(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {chips.length > 0 && (
        <div className="chips-section">
          <h4 className="chips-section-title">Active filters:</h4>
          <div className="chips-selected">
            {chips.map((chip, index) => (
              <div key={index} className="chip-selected">
                {chip}
                <button
                  className="chip-remove-button"
                  onClick={() => removeChip(index)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Chips;
