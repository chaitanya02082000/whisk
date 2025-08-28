const Card = ({ heading, summary, time }) => {
  return (
    <>
      <h2>{heading}</h2>
      <p>{summary}</p>
      <div className="time" style={{ display: "flex", flexDirection: "row" }}>
        {time.map((x, index) => (
          <div
            key={index}
            style={{ display: "flex", alignItems: "center", gap: "1rem" }}
          >
            {x.min}
            {x.servings}
          </div>
        ))}
      </div>
    </>
  );
};
export default Card;
