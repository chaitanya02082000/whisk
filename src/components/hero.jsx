import { useState } from "react";
import "./hero.css";
import Chips from "./chips";
import Card from "./card";
const Hero = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const inputWidth = `${Math.max(30, search.length + 2)}ch`;
  const handleSearch = (event) => {
    return setSearch(event.target.value);
  };
  const handleCategory = () => {};

  return (
    <>
      <div className="hero">
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
          <div className="dropdown">
            <select
              className="drowdown-1"
              value={category}
              onChange={handleCategory}
            ></select>
            <select
              className="dropdown-2"
              value={category}
              onChange={handleCategory}
            ></select>
          </div>
          <Chips />
          {/* <Card /> */}
        </div>
      </div>
    </>
  );
};
export default Hero;
