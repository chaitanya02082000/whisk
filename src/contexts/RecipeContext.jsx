import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";

const RecipeContext = createContext();

export function RecipeProvider({ children }) {
  const { getToken, isLoaded, userId } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // API helper with authentication
  const apiCall = async (url, options = {}) => {
    if (!isLoaded) {
      throw new Error("Auth not loaded yet");
    }

    const token = await getToken();

    return fetch(`http://localhost:3001${url}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
  };

  const fetchRecipes = async () => {
    if (!isLoaded || !userId) return;

    try {
      setIsLoading(true);
      const response = await apiCall("/api/recipes");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setRecipes(data);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      setRecipes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addRecipe = async (recipeData) => {
    try {
      const response = await apiCall("/api/recipes/parse", {
        method: "POST",
        body: JSON.stringify(recipeData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add recipe");
      }

      const newRecipe = await response.json();
      setRecipes((prev) => [newRecipe, ...prev]);
      return newRecipe;
    } catch (error) {
      console.error("Error adding recipe:", error);
      throw error;
    }
  };

  const deleteRecipe = async (recipeId) => {
    try {
      const response = await apiCall(`/api/recipes/${recipeId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete recipe");
      }

      setRecipes((prev) => prev.filter((recipe) => recipe._id !== recipeId));
    } catch (error) {
      console.error("Error deleting recipe:", error);
      throw error;
    }
  };

  // Fetch recipes when auth is loaded and user is available
  useEffect(() => {
    if (isLoaded && userId) {
      fetchRecipes();
    }
  }, [isLoaded, userId]);

  const value = {
    recipes,
    isLoading,
    fetchRecipes,
    addRecipe,
    deleteRecipe,
    apiCall, // Expose for other components
  };

  return (
    <RecipeContext.Provider value={value}>{children}</RecipeContext.Provider>
  );
}

export const useRecipes = () => {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error("useRecipes must be used within RecipeProvider");
  }
  return context;
};
