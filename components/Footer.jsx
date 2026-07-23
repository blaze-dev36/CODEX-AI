export default function Footer({ onSectionSelect }) {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <p className="footer-copy">© 2026 CODEX AI</p>
        <div className="footer-links">
          <a href="#privacy" data-section="privacy" onClick={(event) => onSectionSelect(event, "privacy")}>
            Privacy Policy
          </a>
          <a href="#license" data-section="license" onClick={(event) => onSectionSelect(event, "license")}>
            License
          </a>
          <a href="#terms" data-section="terms" onClick={(event) => onSectionSelect(event, "terms")}>
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
}
