import { createFileRoute } from "@tanstack/react-router";
import { useRecipes } from "../contexts/RecipeContext";
import RecipeDetail from "../components/RecipeDetail";

export const Route = createFileRoute("/recipe/$id")({
  component: RecipeDetailPage,
});

function RecipeDetailPage() {
  const { id } = Route.useParams();
  const { recipes } = useRecipes();

  const recipe = recipes.find((r) => r._id === id);

  if (!recipe) {
    return <div>Recipe not found</div>;
  }

  return <RecipeDetail recipe={recipe} />;
}
