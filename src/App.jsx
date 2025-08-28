import { useState } from "react";
import Hero from "./components/hero";
import "./App.css";
import Sidebar from "./components/sidebar";

function App() {
  return (
    <>
      <div className="main">
        <Sidebar />
        <main className="content">
          <Hero />
        </main>
      </div>
    </>
  );
}
export default App;
