import { useEffect } from "react";
import { Link } from "react-router-dom";
import "../style/Sidebar.css";

type SidebarLink = {
  label: string;
  path?: string;
  icon: string;
  onClick?: () => void;
};

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  activePath?: string;
  onEmergencyClick: () => void;
};

const Sidebar = ({
  isOpen,
  onClose,
  activePath,
  onEmergencyClick,
}: SidebarProps) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const links: SidebarLink[] = [
    { label: "Appointments", path: "/appointments", icon: "🗓️" },
    { label: "Patients", path: "/patients", icon: "👤" },
    { label: "Doctors", path: "/doctors", icon: "👨‍⚕️" },
    {
      label: "Emergency",
      icon: "🚑",
      onClick: onEmergencyClick,
    },
  ];

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? "sidebar-overlay--visible" : ""}`}
        onClick={onClose}
      />

      <div className={`sidebar ${isOpen ? "sidebar--open" : ""}`}>
        <div className="sidebar__header">
          <span className="sidebar__logo-text">MediApp</span>
          <button className="sidebar__close" onClick={onClose}>
            ✕
          </button>
        </div>

        <nav className="sidebar__nav">
          {links.map((link) =>
            link.path ? (
              <Link
                key={link.label}
                to={link.path}
                className={`sidebar__link ${
                  activePath === link.path ? "sidebar__link--active" : ""
                }`}
                onClick={onClose}
              >
                <span className="sidebar__link-icon">{link.icon}</span>
                {link.label}
              </Link>
            ) : (
              <button
                key={link.label}
                className="sidebar__link"
                onClick={() => {
                  link.onClick?.();
                  onClose();
                }}
              >
                <span className="sidebar__link-icon">{link.icon}</span>
                {link.label}
              </button>
            )
          )}
        </nav>

        <div className="sidebar__footer">
          <p className="sidebar__footer-text">v1.0.0</p>
        </div>
      </div>
    </>
  );
};

export default Sidebar;