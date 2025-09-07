import { useEffect, useState } from "react";
import "./hero.css";
import Chips from "./chips";
import Card from "./card";
import RecipeModal from "./RecipeModal"; // Add this import
import { useRecipes } from "../contexts/RecipeContext";

const Hero = () => {
  const [search, setSearch] = useState("");
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [selectedChips, setSelectedChips] = useState([]);
  const [category, setCategory] = useState("");
  const [cuisine, setCuisine] = useState("");

  // Add modal state
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get data and functions from context
  const { recipes, loading, error } = useRecipes();

  const inputWidth = `${Math.max(30, search.length + 2)}ch`;

  // Update filtered recipes when recipes change
  useEffect(() => {
    setFilteredRecipes(recipes);
  }, [recipes]);

  // Filter recipes based on search, category, and cuisine
  useEffect(() => {
    let filtered = recipes;

    if (search) {
      filtered = filtered.filter(
        (recipe) =>
          recipe.name.toLowerCase().includes(search.toLowerCase()) ||
          recipe.description?.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (category) {
      filtered = filtered.filter((recipe) =>
        recipe.category?.includes(category),
      );
    }

    if (cuisine) {
      filtered = filtered.filter((recipe) => recipe.cuisine?.includes(cuisine));
    }

    // Filter by selected chips
    if (selectedChips.length > 0) {
      filtered = filtered.filter((recipe) => {
        const recipeTags = [
          ...(recipe.category || []),
          ...(recipe.cuisine || []),
        ];
        return selectedChips.some((chip) => recipeTags.includes(chip));
      });
    }

    setFilteredRecipes(filtered);
  }, [search, category, cuisine, selectedChips, recipes]);

  // Add modal handlers
  const handleRecipeClick = (recipe) => {
    setSelectedRecipe(recipe);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRecipe(null);
  };

  // Handle keyboard navigation for modal
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        handleCloseModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden"; // Prevent background scroll
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  const handleCuisineChange = (e) => {
    setCuisine(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  // Extract unique categories and cuisines for dropdowns
  const categories = [
    ...new Set(recipes.flatMap((recipe) => recipe.category || [])),
  ];
  const cuisines = [
    ...new Set(recipes.flatMap((recipe) => recipe.cuisine || [])),
  ];

  // Handle loading state
  if (loading) {
    return (
      <div className="hero">
        <div className="header">
          <h1>Whisk</h1>
          <h2>Loading recipes...</h2>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="hero">
        <div className="header">
          <h1>Whisk</h1>
          <h2>Error: {error}</h2>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="hero">
        <div className="header">
          <h1>Whisk</h1>
          <h2>Discover, Organize, and cook your favourite recipes.</h2>
        </div>
        <div className="search">
          <form onSubmit={handleSubmit}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search recipes or ask questions(eg., 'Show me a quick dinner recipe.')"
              style={{ width: inputWidth, height: "3em" }}
            />
          </form>
          <div className="dropdown">
            <select
              className="dropdown-1"
              value={category}
              onChange={handleCategoryChange}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <select
              className="dropdown-2"
              value={cuisine}
              onChange={handleCuisineChange}
            >
              <option value="">All Cuisines</option>
              {cuisines.map((cui) => (
                <option key={cui} value={cui}>
                  {cui}
                </option>
              ))}
            </select>
          </div>
          <Chips onChipsChange={setSelectedChips} />
        </div>
      </div>

      {/* Recipes display section */}
      <div className="recipes-grid">
        {filteredRecipes.length > 0 ? (
          filteredRecipes.map((recipe) => (
            <Card
              key={recipe._id}
              heading={recipe.name}
              summary={recipe.description}
              recipe={recipe}
              onClick={handleRecipeClick} // Pass the click handler to Card
            />
          ))
        ) : (
          <div className="no-recipes">
            <h3>No recipes found</h3>
            <p>Try adjusting your search terms or filters to find recipes.</p>
          </div>
        )}
      </div>

      {/* Add the modal here */}
      <RecipeModal
        recipe={selectedRecipe}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default Hero;
