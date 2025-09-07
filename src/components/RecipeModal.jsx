import React from "react";
import "./recipemodal.css";

const RecipeModal = ({ recipe, isOpen, onClose }) => {
  if (!isOpen || !recipe) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{recipe.name}</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {recipe.image && (
            <img
              src={recipe.image}
              alt={recipe.name}
              className="recipe-detail-image"
            />
          )}

          <div className="recipe-meta">
            <div className="time-info">
              {recipe.prepTime && <span>Prep: {recipe.prepTime}</span>}
              {recipe.cookTime && <span>Cook: {recipe.cookTime}</span>}
              {recipe.totalTime && <span>Total: {recipe.totalTime}</span>}
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

          {recipe.description && (
            <div className="recipe-description">
              <h3>Description</h3>
              <p>{recipe.description}</p>
            </div>
          )}

          <div className="recipe-details">
            <div className="ingredients-section">
              <h3>Ingredients</h3>
              <ul className="ingredients-list">
                {recipe.ingredients?.map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))}
              </ul>
            </div>

            <div className="instructions-section">
              <h3>Instructions</h3>
              <ol className="instructions-list">
                {recipe.instructions?.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ol>
            </div>
          </div>

          {recipe.yield && (
            <div className="recipe-yield">
              <strong>Serves: {recipe.yield}</strong>
            </div>
          )}

          {recipe.sourceUrl && (
            <div className="recipe-source">
              <a
                href={recipe.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="source-link"
              >
                View Original Recipe
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeModal;
