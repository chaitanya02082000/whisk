import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const URL = import.meta.env.VITE_URL;
const RecipeContext = createContext();

export const useRecipes = () => {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error("useRecipes must be used within a RecipeProvider");
  }
  return context;
};

export const RecipeProvider = ({ children }) => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Clear error after some time
  const clearError = () => {
    setTimeout(() => setError(null), 5000);
  };

  // Fetch all recipes
  const fetchRecipes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(URL);
      setRecipes(response.data);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      setError("Failed to fetch recipes");
      clearError();
    } finally {
      setLoading(false);
    }
  };

  // Parse recipe from URL and add it
  const parseAndAddRecipe = async (url) => {
    console.log("Parsing URL:", url);
    try {
      const response = await axios.post(`${URL}/parse`, { url });
      console.log("API response:", response.data);

      // Immediately update the local state
      setRecipes((prevRecipes) => [...prevRecipes, response.data]);

      // Clear any previous errors
      setError(null);

      return response.data;
    } catch (error) {
      console.error("Error parsing recipe:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to parse recipe";
      setError(errorMessage);
      clearError();
      throw error;
    }
  };

  // Update an existing recipe
  const updateRecipe = async (id, updatedRecipe) => {
    try {
      const response = await axios.put(`${URL}/${id}`, updatedRecipe);
      setRecipes((prevRecipes) =>
        prevRecipes.map((recipe) =>
          recipe._id === id ? response.data : recipe,
        ),
      );
      setError(null);
      return response.data;
    } catch (error) {
      console.error("Error updating recipe:", error);
      setError("Failed to update recipe");
      clearError();
      throw error;
    }
  };

  // Delete a recipe
  const deleteRecipe = async (id) => {
    try {
      await axios.delete(`${URL}/${id}`);
      setRecipes((prevRecipes) =>
        prevRecipes.filter((recipe) => recipe._id !== id),
      );
      setError(null);
    } catch (error) {
      console.error("Error deleting recipe:", error);
      setError("Failed to delete recipe");
      clearError();
      throw error;
    }
  };

  // Refresh recipes
  const refreshRecipes = () => {
    fetchRecipes();
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchRecipes();
  }, []);

  const value = {
    recipes,
    loading,
    error,
    fetchRecipes,
    parseAndAddRecipe,
    updateRecipe,
    deleteRecipe,
    refreshRecipes,
    clearError: () => setError(null),
  };

  return (
    <RecipeContext.Provider value={value}>{children}</RecipeContext.Provider>
  );
};
