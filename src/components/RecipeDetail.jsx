import { useParams, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { useRecipes } from "../contexts/RecipeContext";
import { ChatProvider } from "../contexts/ChatContext";
import RecipeChat from "./RecipeChat";
import "./RecipeDetail.css";

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { recipes, loading, deleteRecipe } = useRecipes();
  const [chatView, setChatView] = useState("chat");

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <h2>Loading recipe...</h2>
      </div>
    );
  }

  const recipe = recipes.find((r) => r._id === id);

  if (!recipe) {
    return (
      <div className="error-container">
        <h2>Recipe not found</h2>
        <p>The recipe you're looking for doesn't exist or has been removed.</p>
        <Link to="/" className="back-button">
          ← Back to Home
        </Link>
      </div>
    );
  }

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this recipe?")) {
      try {
        await deleteRecipe(recipe._id);
        navigate("/");
      } catch (error) {
        console.error("Error deleting recipe:", error);
        alert("Failed to delete recipe");
      }
    }
  };

  return (
    <ChatProvider>
      <div className="recipe-detail-layout">
        {/* Main Recipe Content */}
        <div className="recipe-main-content">
          <div className="recipe-header">
            <Link to="/" className="back-button">
              ← Back to Recipes
            </Link>
            <div className="recipe-actions">
              <button onClick={handleDelete} className="delete-btn">
                🗑️ Delete Recipe
              </button>
            </div>
          </div>

          <div className="recipe-title-section">
            <h1>{recipe.name}</h1>
            {recipe.description && (
              <p className="recipe-description">{recipe.description}</p>
            )}
          </div>

          {recipe.image && (
            <div className="recipe-image-container">
              <img
                src={recipe.image}
                alt={recipe.name}
                className="recipe-detail-image"
              />
            </div>
          )}

          <div className="recipe-meta">
            <div className="time-info">
              {recipe.prepTime && (
                <span className="meta-item">Prep: {recipe.prepTime}</span>
              )}
              {recipe.cookTime && (
                <span className="meta-item">Cook: {recipe.cookTime}</span>
              )}
              {recipe.totalTime && (
                <span className="meta-item">Total: {recipe.totalTime}</span>
              )}
              {recipe.yield && (
                <span className="meta-item">Serves: {recipe.yield}</span>
              )}
            </div>

            <div className="recipe-tags">
              {recipe.category?.map((cat, index) => (
                <span key={index} className="tag category-tag">
                  {cat}
                </span>
              ))}
              {recipe.cuisine?.map((cuisine, index) => (
                <span key={index} className="tag cuisine-tag">
                  {cuisine}
                </span>
              ))}
            </div>
          </div>

          <div className="recipe-content">
            <div className="ingredients-section">
              <h2>Ingredients</h2>
              <ul className="ingredients-list">
                {recipe.ingredients?.map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))}
              </ul>
            </div>

            <div className="instructions-section">
              <h2>Instructions</h2>
              <ol className="instructions-list">
                {recipe.instructions?.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ol>
            </div>
          </div>

          {recipe.sourceUrl && recipe.sourceUrl !== "manual-input" && (
            <div className="recipe-source">
              <a
                href={recipe.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="source-link"
              >
                🔗 View Original Recipe
              </a>
            </div>
          )}
        </div>

        {/* Chat Sidebar */}
        <div className="recipe-chat-sidebar">
          <RecipeChat
            recipe={recipe}
            activeView={chatView}
            onViewChange={setChatView}
          />
        </div>
      </div>
    </ChatProvider>
  );
};

export default RecipeDetail;
