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
    } finally {
      setLoading(false);
    }
  };

  // Parse recipe from URL and add it
  const parseAndAddRecipe = async (url) => {
    try {
      const response = await axios.post(`${URL}parse`, { url });
      // Immediately update the local state
      setRecipes((prevRecipes) => [...prevRecipes, response.data]);
      return response.data;
    } catch (error) {
      console.error("Error parsing recipe:", error);
      setError("Failed to parse recipe");
      throw error;
    }
  };

  // Add a new recipe (manual entry)
  const addRecipe = async (newRecipe) => {
    try {
      const response = await axios.post(URL, newRecipe);
      setRecipes((prevRecipes) => [...prevRecipes, response.data]);
      return response.data;
    } catch (error) {
      console.error("Error adding recipe:", error);
      setError("Failed to add recipe");
      throw error;
    }
  };

  // Update an existing recipe
  const updateRecipe = async (id, updatedRecipe) => {
    try {
      const response = await axios.put(`${URL}${id}`, updatedRecipe);
      setRecipes((prevRecipes) =>
        prevRecipes.map((recipe) =>
          recipe._id === id ? response.data : recipe,
        ),
      );
      return response.data;
    } catch (error) {
      console.error("Error updating recipe:", error);
      setError("Failed to update recipe");
      throw error;
    }
  };

  // Delete a recipe
  const deleteRecipe = async (id) => {
    try {
      await axios.delete(`${URL}${id}`);
      setRecipes((prevRecipes) =>
        prevRecipes.filter((recipe) => recipe._id !== id),
      );
    } catch (error) {
      console.error("Error deleting recipe:", error);
      setError("Failed to delete recipe");
      throw error;
    }
  };

  // Refresh recipes (manual refresh)
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
    parseAndAddRecipe, // Add this new function
    addRecipe,
    updateRecipe,
    deleteRecipe,
    refreshRecipes,
  };

  return (
    <RecipeContext.Provider value={value}>{children}</RecipeContext.Provider>
  );
};
