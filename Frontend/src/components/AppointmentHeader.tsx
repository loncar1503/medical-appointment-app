import BurgerMenu from "./BurgerMenu";
import "../style/Header.css";

type AppointmentHeaderProps = {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  title: string;
  subtitle?: string;
};

const AppointmentHeader = ({
  isSidebarOpen,
  onToggleSidebar,
  title,
  subtitle,
}: AppointmentHeaderProps) => {
  return (
    <div className="appointments-header">
      <div className="appointments-header__left">
        <BurgerMenu isOpen={isSidebarOpen} onToggle={onToggleSidebar} />
      </div>

      <div className="appointments-header__center">
        <h2 className="appointments-header__title">{title}</h2>
        {subtitle && (
          <p className="appointments-header__subtitle">{subtitle}</p>
        )}
      </div>

      <div className="appointments-header__right">
        <div className="appointments-header__logo-placeholder">
          <img
            src="/image.png"
            alt="Company logo"
            className="appointments-header__logo"
            onError={() => console.log("Logo se nije učitao")}
          />
        </div>
      </div>
    </div>
  );
};

export default AppointmentHeader;