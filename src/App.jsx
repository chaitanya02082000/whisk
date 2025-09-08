import { Routes, Route } from "react-router-dom";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";
import { RecipeProvider } from "./contexts/RecipeContext";
import { SidebarProvider } from "./contexts/SidebarContext";
import Sidebar from "./components/sidebar";
import Hero from "./components/hero";
import RecipeDetail from "./components/RecipeDetail";
import { useSidebar } from "./contexts/SidebarContext";
import "./App.css";

// Welcome screen for unauthenticated users
const WelcomeScreen = () => {
  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        <h1>Welcome to Whisk</h1>
        <p>Your personal recipe collection and AI cooking assistant</p>
        <SignInButton mode="modal">
          <button className="sign-in-btn">Sign In to Get Started</button>
        </SignInButton>
      </div>
    </div>
  );
};

// Create a Layout component within App.jsx
const Layout = () => {
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <div className="main">
      {/* User Button - Top Right */}
      <div className="user-section">
        <UserButton
          appearance={{
            elements: {
              avatarBox: "w-8 h-8",
            },
          }}
        />
      </div>

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
    <>
      <SignedIn>
        <RecipeProvider>
          <SidebarProvider>
            <Layout />
          </SidebarProvider>
        </RecipeProvider>
      </SignedIn>
      <SignedOut>
        <WelcomeScreen />
      </SignedOut>
    </>
  );
}

export default App;
