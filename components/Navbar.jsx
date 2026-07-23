"use client";

import Link from "next/link";

const navItems = [
  { label: "Deploy", href: "#deploy", section: "deploy", icon: "rocket" },
  { label: "Plugins", href: "/plugins", section: "plugins", icon: "puzzle-piece" },
  { label: "Support", href: "#support", section: "support", icon: "headset" },
  { label: "Repo", href: "https://github.com/CODEX-SPACEX/CODEX-AI/tree/main", section: "repo", icon: "github" },
  { label: "Suggest", href: "#suggest", section: "suggest", icon: "lightbulb" },
];

export default function Navbar({
  theme,
  onToggleTheme,
  isMenuOpen,
  onToggleMenu,
  onNavSelect,
  activeSection,
}) {
  const renderNavItem = (item) => {
    const iconClassName = item.icon === "github" ? "fab fa-github" : `fas fa-${item.icon}`;
    const isActive = Boolean(activeSection && item.section === activeSection);
    const content = (
      <>
        <i className={iconClassName} />
        <span>{item.label}</span>
      </>
    );

    if (item.href.startsWith("http")) {
      return (
        <li key={item.label}>
          <a href={item.href} target="_blank" rel="noreferrer" title={item.label} data-section={item.section}>
            {content}
          </a>
        </li>
      );
    }

    return (
      <li key={item.label}>
        <Link
          href={item.href}
          data-section={item.section}
          className={isActive ? "active" : ""}
          aria-current={isActive ? "page" : undefined}
          onClick={(event) => onNavSelect(event, item.section, item.href)}
        >
          {content}
        </Link>
      </li>
    );
  };

  return (
    <>
      <nav className="navbar">
        <div className="brand">
          <span className="brand-mark">
            <i className="fas fa-robot" />
          </span>
          <div>
            <p className="brand-label">CODEX</p>
            <p className="brand-sub">AI</p>
          </div>
        </div>

        <div className="navbar-right">
          <ul className={`nav-links ${isMenuOpen ? "mobile-open" : ""}`}>
            {navItems.map(renderNavItem)}
          </ul>

          <div className="sidebar-snow" />

          <button className="theme-toggle" id="themeToggle" aria-label="Toggle dark mode" onClick={onToggleTheme}>
            <span className="theme-icon">{theme === "light" ? <i className="fas fa-sun" /> : <i className="fas fa-moon" />}</span>
          </button>

          <button className={`hamburger ${isMenuOpen ? "open" : ""}`} id="hamburger" aria-label="Toggle menu" aria-expanded={isMenuOpen} onClick={onToggleMenu}>
            <span className="line" />
            <span className="line" />
            <span className="line" />
          </button>
        </div>
      </nav>

      <div className={`nav-overlay ${isMenuOpen ? "active" : ""}`} onClick={onToggleMenu} />
    </>
  );
}
