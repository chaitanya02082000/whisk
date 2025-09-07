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
    if (!recipeUrl.trim()) {
      alert("Please enter a recipe URL");
      return;
    }

    // Validate URL format
    try {
      new URL(recipeUrl);
    } catch {
      alert("Please enter a valid URL");
      return;
    }

    setLoading(true);
    console.log("Submitting URL:", recipeUrl);

    try {
      const recipe = await parseAndAddRecipe(recipeUrl);
      console.log("Recipe parsed and added:", recipe);
      setRecipeUrl("");

      if (onSuccess) {
        onSuccess(recipe);
      }
    } catch (error) {
      console.error("Error parsing recipe:", error);

      // Show user-friendly error message
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to parse recipe. Please try again.";
      alert(errorMessage);

      if (onError) {
        onError(error);
      }
    } finally {
      // Always reset loading state
      setLoading(false);
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
        disabled={loading}
      />
      <button className="sidebar-button" type="submit" disabled={loading}>
        {loading ? "Processing..." : children || "Parse Recipe"}
      </button>
    </form>
  );
};

export default Button;
