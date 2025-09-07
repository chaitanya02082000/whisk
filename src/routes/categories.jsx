import { createFileRoute } from "@tanstack/react-router";
import { useRecipes } from "../contexts/RecipeContext";
import Card from "../components/card";

export const Route = createFileRoute("/categories")({
  component: Categories,
});

function Categories() {
  const { recipes } = useRecipes();

  // Group recipes by category
  const recipesByCategory = recipes.reduce((acc, recipe) => {
    recipe.category?.forEach((cat) => {
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(recipe);
    });
    return acc;
  }, {});

  return (
    <div>
      <h1>Browse by Categories</h1>
      {Object.entries(recipesByCategory).map(([category, categoryRecipes]) => (
        <div key={category} className="category-section">
          <h2>{category}</h2>
          <div className="recipes-grid">
            {categoryRecipes.map((recipe) => (
              <Card
                key={recipe._id}
                heading={recipe.name}
                summary={recipe.description}
                recipe={recipe}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
