import { useState } from "react";

const Chips = () => {
  const [text, setText] = useState("");
  const [chips, setChips] = useState([]);
  const handleKey = (e) => {
    if (e.key === "Enter") {
      setChips((prev) => [...prev, text]);
    }
  };
  return (
    <>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => handleKey(e)}
      />
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          padding: "1rem",
          maxWidth: "100%",
          gap: "1rem",
        }}
      >
        {chips?.map((x, index) => (
          <div
            style={{
              border: "1px solid black",
              padding: "0.5rem",
              borderRadius: "4px",
              backgroundColor: "#f5f5f5",
              display: "inline-flex",
              alignItems: "center",
            }}
            key={index}
          >
            {x}
          </div>
        ))}
      </div>
    </>
  );
};
export default Chips;
