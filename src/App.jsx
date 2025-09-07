import Hero from "./components/hero";
import "./App.css";
import Sidebar from "./components/sidebar";
import { RecipeProvider } from "./contexts/RecipeContext";

function App() {
  return (
    <>
      <RecipeProvider>
        <div className="main">
          <Sidebar />
          <main className="content">
            <Hero />
          </main>
        </div>
      </RecipeProvider>
    </>
  );
}
export default App;
