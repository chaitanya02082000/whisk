import { Link, useNavigate } from "react-router-dom";
import Button from "./importRecipe.jsx";
import { useSidebar } from "../contexts/SidebarContext";
import "./sidebar.css";

const Sidebar = ({ className = "" }) => {
  const navigate = useNavigate();
  const { isCollapsed, toggleSidebar } = useSidebar();

  const handleRecipeAdded = (recipe) => {
    console.log("Recipe added successfully:", recipe);
    // Navigate to the newly added recipe
    navigate(`/recipe/${recipe._id}`);
  };

  const handleRecipeError = (error) => {
    console.error("Error adding recipe:", error);
  };

  return (
    <aside className={`sidebar ${className}`}>
      <div className="sidebar-content">
        {/* Close button for when sidebar is open */}
        {!isCollapsed && (
          <button
            className="sidebar-close"
            onClick={toggleSidebar}
            title="Hide sidebar"
          >
            ✕
          </button>
        )}

        {/* Logo/Title that links to home */}
        <Link to="/" className="sidebar-title">
          <h3>Whisk</h3>
        </Link>

        {/* Add Recipe Section */}
        <div className="add-recipe-section">
          <h4>Add Recipe</h4>
          <Button onSuccess={handleRecipeAdded} onError={handleRecipeError}>
            Import Recipe
          </Button>
        </div>

        {/* Simple stats or info */}
        <div className="sidebar-info">
          <p>Discover and organize your favorite recipes</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
