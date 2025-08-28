import { useState } from "react";
import "./hero.css";
const Hero = () => {
  const [search, setSearch] = useState("");
  const inputWidth = `${Math.max(30, search.length + 2)}ch`;
  const handleSearch = (event) => {
    return setSearch(event.target.value);
  };
  return (
    <>
      <div className="header">
        <h1>Whisk</h1>
        <h2>Discover, Organize, and cook your favourite recipes.</h2>
      </div>
      <div className="search">
        <input
          value={search}
          onChange={handleSearch}
          placeholder="Search recipes or ask questions(eg., 'Show me a quick dinner recipe.'"
          style={{ width: inputWidth, height: "3em" }}
        ></input>
      </div>
    </>
  );
};
export default Hero;
