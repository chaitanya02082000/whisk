import { useState } from "react";
import { useRecipes } from "../contexts/RecipeContext";

import "./sidebar.css";
const Button = ({ children, onSuccess, onError }) => {
  const [recipeUrl, setRecipeUrl] = useState("");
  const [loading, setLoading] = useState(false);

  // Use the parseAndAddRecipe function from context
  const { parseAndAddRecipe } = useRecipes();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!recipeUrl) {
      alert("Please enter a recipe URL");
      return;
    }

    setLoading(true);
    try {
      const recipe = await parseAndAddRecipe(recipeUrl);
      setLoading(false);
      setRecipeUrl("");

      if (onSuccess) {
        onSuccess(recipe);
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
      <button className="sidebar-button" type="submit" disabled={loading}>
        {loading ? "Processing..." : children || "Parse Recipe"}
      </button>
    </form>
  );
};

export default Button;
