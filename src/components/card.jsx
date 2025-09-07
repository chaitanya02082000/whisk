const Card = ({ heading, summary, recipe, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(recipe);
    }
  };

  return (
    <div className="recipe-card" onClick={handleClick}>
      <h2>{heading}</h2>

      {summary && <p>{summary}</p>}

      {/* Time information */}
      {(recipe.prepTime || recipe.cookTime || recipe.totalTime) && (
        <div className="time">
          {recipe.prepTime && (
            <div>
              <span>Prep: {recipe.prepTime}</span>
            </div>
          )}
          {recipe.cookTime && (
            <div>
              <span>Cook: {recipe.cookTime}</span>
            </div>
          )}
          {recipe.totalTime && (
            <div>
              <span>Total: {recipe.totalTime}</span>
            </div>
          )}
        </div>
      )}

      {/* Categories */}
      {(recipe.category?.length > 0 || recipe.cuisine?.length > 0) && (
        <div className="categories">
          {recipe.category?.slice(0, 3).map((cat, index) => (
            <span key={index} className="category-tag">
              {cat}
            </span>
          ))}
          {recipe.cuisine?.slice(0, 2).map((cuisine, index) => (
            <span key={index} className="category-tag">
              {cuisine}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default Card;
