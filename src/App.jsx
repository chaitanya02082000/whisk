import { Routes, Route } from "react-router-dom";
import { RecipeProvider } from "./contexts/RecipeContext";
import { SidebarProvider } from "./contexts/SidebarContext";
import Sidebar from "./components/sidebar";
import Hero from "./components/hero";
import RecipeDetail from "./components/RecipeDetail";
import { useSidebar } from "./contexts/SidebarContext";
import "./App.css";

// Create a Layout component within App.jsx
const Layout = () => {
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <div className="main">
      {/* Sidebar Toggle Button */}
      <button
        className={`sidebar-toggle ${!isCollapsed ? "hidden" : ""}`}
        onClick={toggleSidebar}
        title="Show sidebar"
      >
        ☰
      </button>

      {/* Sidebar */}
      <Sidebar className={isCollapsed ? "collapsed" : ""} />

      {/* Main Content */}
      <main className={`content ${isCollapsed ? "sidebar-collapsed" : ""}`}>
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/recipe/:id" element={<RecipeDetail />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <RecipeProvider>
      <SidebarProvider>
        <Layout />
      </SidebarProvider>
    </RecipeProvider>
  );
}

export default App;
