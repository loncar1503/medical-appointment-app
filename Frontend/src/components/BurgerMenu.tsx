type BurgerMenuProps = {
  isOpen: boolean;
  onToggle: () => void;
};

const BurgerMenu = ({ isOpen, onToggle }: BurgerMenuProps) => {
  return (
    <button className={`burger-btn ${isOpen ? "burger-btn--open" : ""}`} onClick={onToggle} aria-label="Toggle menu">
      <span className="burger-line" />
      <span className="burger-line" />
      <span className="burger-line" />
    </button>
  );
};

export default BurgerMenu;