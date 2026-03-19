import "../style/footer.css";

const team = [
  { name: "Milica", photo: "/milica.jpg" },
  { name: "Luka", photo: "/luka.jpg" },
  { name: "Nikola", photo: "/nikola.jpg" },
  { name: "Aleksa", photo: "/aleksa.jpg" },
  { name: "Blagoje", photo: "/blagoje.jpg" },
  { name: "Andjela", photo: "/andjela.jpeg" },
  { name: "Djordje", photo: "/djordje.jpg" },
  { name: "Ime8", photo: "/petar.jpg" },
  { name: "Ime9", photo: "/tamara.jpg" },
  { name: "Ime10", photo: "/petart.png" },
];

const AppFooter = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="app-footer__content">
   <div className="app-footer__left" style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "nowrap" }}>
  <span className="app-footer__text">
    © {year} Internship Group D — Unauthorized copying encouraged (credits appreciated). Powered by Team D.
  </span>
  <div className="app-footer__avatars" style={{ display: "flex", flexWrap: "nowrap", gap: "4px" }}>
    {team.map((member) => (
      <img
        key={member.name}
        src={member.photo}
        alt={member.name}
        title={member.name}
        style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover" }}
      />
    ))}
  </div>
</div>

        <div className="app-footer__links">
          <span>Privacy Policy</span>
          <span className="app-footer__dot">·</span>
          <span>Terms of Use</span>
          <span className="app-footer__dot">·</span>
          <span>Support</span>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;