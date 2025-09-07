import { createFileRoute } from "@tanstack/react-router";
import { useRecipes } from "../contexts/RecipeContext";
import Card from "../components/card";

export const Route = createFileRoute("/favorites")({
  component: Favorites,
});

function Favorites() {
  const { recipes } = useRecipes();

  // You'll need to add favorites functionality to your context
  const favoriteRecipes = recipes.filter((recipe) => recipe.isFavorite);

  return (
    <div>
      <h1>Your Favorite Recipes</h1>
      <div className="recipes-grid">
        {favoriteRecipes.length > 0 ? (
          favoriteRecipes.map((recipe) => (
            <Card
              key={recipe._id}
              heading={recipe.name}
              summary={recipe.description}
              recipe={recipe}
            />
          ))
        ) : (
          <div className="no-recipes">
            <h3>No favorite recipes yet</h3>
            <p>Start adding recipes to your favorites!</p>
          </div>
        )}
      </div>
    </div>
  );
}
