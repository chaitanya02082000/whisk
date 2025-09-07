import axios from "axios";
import { useState } from "react";

const Button = ({ children, onSuccess, onError }) => {
  const [recipeUrl, setRecipeUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!recipeUrl) {
      alert("Please enter a recipe URL");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:3001/api/recipes/parse",
        {
          url: recipeUrl,
        },
      );
      setLoading(false);
      setRecipeUrl("");
      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error parsing recipe:", error);
      if (onError) {
        onError(error);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={recipeUrl}
        onChange={(e) => setRecipeUrl(e.target.value)}
        placeholder="Paste recipe URL here"
        className="recipe-input"
      />
      <button type="submit" disabled={loading}>
        {loading ? "Processing..." : children || "Parse Recipe"}
      </button>
    </form>
  );
};

export default Button;
