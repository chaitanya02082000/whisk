import { Routes, Route } from "react-router-dom";
import { RecipeProvider } from "./contexts/RecipeContext";
import Sidebar from "./components/sidebar";
import Hero from "./components/hero";
import RecipeDetail from "./components/RecipeDetail";
import "./App.css";

function App() {
  return (
    <RecipeProvider>
      <div className="main">
        <Sidebar />
        <main className="content">
          <Routes>
            <Route path="/" element={<Hero />} />
            <Route path="/recipe/:id" element={<RecipeDetail />} />
          </Routes>
        </main>
      </div>
    </RecipeProvider>
  );
}

export default App;
