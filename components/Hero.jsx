"use client";

const heroCards = [
  { section: "deploy", icon: "rocket", title: "Deploy", text: "Launch your bot" },
  { section: "plugins", icon: "puzzle-piece", title: "Plugins", text: "Extend plugins" },
  { section: "support", icon: "headset", title: "Support", text: "24/7 Support" },
  { section: "tools", icon: "wrench", title: "Tools", text: "Explore developer tools" },
  { section: "apis", icon: "network-wired", title: "APIs", text: "View API integrations, endpoints, and docs" },
  { section: "repo", icon: "github", title: "Repository", text: "Access Repository" },
  { section: "suggest", icon: "lightbulb", title: "Suggest", text: "Share ideas and features" },
];

export default function Hero({ onCardSelect }) {
  const getIconClassName = (cardIcon) => (cardIcon === "github" ? "fab fa-github" : `fas fa-${cardIcon}`);

  return (
    <section
      id="home"
      className="section active"
      style={{ userSelect: "none" }}
      onMouseDown={(event) => {
        if (event.detail > 1) event.preventDefault();
      }}
    >
      <div className="hero-section">
        <div className="hero-copy">
          <h1>CODEX AI</h1>
          <p className="tagline">MULTIFUNCTIONAL WHATSAPP BOT BUILT WITH BAILEY&apos;S</p>
        </div>
      </div>

      <div className="description-section">
        <p />
      </div>

      <div className="cards-section">
        {heroCards.map((card) => (
          <button type="button" className="card" key={card.section} data-section={card.section} onClick={() => onCardSelect(card.section)}>
            <div className="card-icon">
              <i className={getIconClassName(card.icon)} />
            </div>
            <h3>{card.title}</h3>
            <p>{card.text}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
