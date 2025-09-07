import Button from "./importRecipe";
import "./sidebar.css";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <h3 className="sidebar-title">Whisk</h3>
        <Button />
      </div>
    </aside>
  );
};

export default Sidebar;
