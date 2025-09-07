import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { RecipeProvider } from "../contexts/RecipeContext";
import Sidebar from "../components/sidebar";
import "../App.css";

export const Route = createRootRoute({
  component: () => (
    <RecipeProvider>
      <div className="main">
        <Sidebar />
        <main className="content">
          <Outlet />
        </main>
      </div>
      <TanStackRouterDevtools />
    </RecipeProvider>
  ),
});
