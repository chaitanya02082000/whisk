import { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const SidebarContext = createContext();

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  // Auto-hide sidebar on recipe detail pages
  useEffect(() => {
    const isRecipeDetailPage = location.pathname.startsWith("/recipe/");
    setIsCollapsed(isRecipeDetailPage);
  }, [location.pathname]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const showSidebar = () => {
    setIsCollapsed(false);
  };

  const hideSidebar = () => {
    setIsCollapsed(true);
  };

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        toggleSidebar,
        showSidebar,
        hideSidebar,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};
