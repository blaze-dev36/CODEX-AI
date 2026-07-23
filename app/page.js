"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import { lockedSections, modalContentMap } from "@/lib/modalContent";

const createSnowflakes = (container, count = 50, isInitialLoad = false) => {
  if (!container) return;

  const isMobile = window.innerWidth <= 768;
  const effectiveCount = isMobile && !isInitialLoad ? Math.ceil(count * 0.3) : count;

  for (let index = 0; index < effectiveCount; index += 1) {
    const snowflake = document.createElement("div");
    const isRealFlake = Math.random() < 0.25;
    snowflake.classList.add("snowflake");
    if (isRealFlake) snowflake.classList.add("flake");

    snowflake.style.left = `${Math.random() * 100}%`;
    const size = isRealFlake ? Math.random() * 8 + 8 : Math.random() * 5 + 3;
    snowflake.style.width = `${size}px`;
    snowflake.style.height = `${size}px`;
    snowflake.style.animationDuration = `${Math.random() * 10 + 10}s`;
    snowflake.style.animationDelay = isInitialLoad ? `${Math.random() * -20}s` : "0s";

    container.appendChild(snowflake);
    snowflake.addEventListener("animationend", () => snowflake.remove());
  }
};


export default function HomePage() {
  const [theme, setTheme] = useState("dark");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [suggestionEmail, setSuggestionEmail] = useState("");
  const [suggestionIdea, setSuggestionIdea] = useState("");
  const [suggestionStatus, setSuggestionStatus] = useState("");
  const router = useRouter();

  useEffect(() => {
    const syncModalFromQuery = () => {
      const section = new URLSearchParams(window.location.search).get("section");
      setActiveModal(section && modalContentMap[section] ? section : null);
    };

    const frameId = window.requestAnimationFrame(syncModalFromQuery);
    const handlePopState = () => {
      window.requestAnimationFrame(syncModalFromQuery);
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    const snowContainer = document.querySelector(".snow");
    if (snowContainer) {
      createSnowflakes(snowContainer, window.innerWidth <= 768 ? 30 : 70, true);
      const interval = window.setInterval(() => {
        if (window.innerWidth > 768) {
          createSnowflakes(snowContainer, 10);
        } else {
          createSnowflakes(snowContainer, 3);
        }
      }, 3000);

      const handleDocumentClick = (event) => {
        const clickedOutside = !event.target.closest(".navbar") && !event.target.closest(".card") && !event.target.closest(".modal-content");
        if (clickedOutside) {
          if (window.innerWidth > 768) {
            createSnowflakes(snowContainer, 12);
          } else {
            createSnowflakes(snowContainer, 4);
          }
        }
      };

      document.addEventListener("click", handleDocumentClick);
      return () => {
        window.clearInterval(interval);
        document.removeEventListener("click", handleDocumentClick);
      };
    }
  }, []);

  useEffect(() => {
    document.body.classList.toggle("light", theme === "light");
  }, [theme]);

  const modalContent = useMemo(() => {
    if (!activeModal) return null;
    return modalContentMap[activeModal] || null;
  }, [activeModal]);

  const modalBodyContent = useMemo(() => {
    if (!activeModal || !modalContent) return null;

    if (lockedSections.includes(activeModal)) {
      return (
        <>
          <div className="modal-lock-notice">
            <i className="fas fa-lock" />
            <div>
              <strong>Note:</strong> <b>This section was locked by the developer.</b>
            </div>
          </div>
          <div className="locked-content" style={{ display: "none" }}>
            {/* Editable content space */}
          </div>
        </>
      );
    }

    if (activeModal === "suggest") {
      return (
        <>
          <p>Tell us your idea and the email where we can follow up.</p>
          <form
            className="suggest-form"
            onSubmit={async (event) => {
              event.preventDefault();
              setSuggestionStatus("");

              const emailValue = suggestionEmail.trim();
              const ideaValue = suggestionIdea.trim();

              if (!emailValue || !ideaValue) {
                setSuggestionStatus("Please provide your email and idea.");
                return;
              }

              try {
                const response = await fetch("/api/suggest", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email: emailValue, idea: ideaValue }),
                });

                if (!response.ok) {
                  throw new Error("Could not send your suggestion.");
                }

                setSuggestionEmail("");
                setSuggestionIdea("");
                setSuggestionStatus("Suggestion sent. Thank you.");
              } catch (error) {
                setSuggestionStatus("Unable to submit suggestion right now. Please try again.");
              }
            }}
          >
            <label className="plugin-field">
              <span>Your email</span>
              <input
                type="email"
                value={suggestionEmail}
                onChange={(event) => setSuggestionEmail(event.target.value)}
                placeholder="you@example.com"
              />
            </label>
            <label className="plugin-field">
              <span>Your idea</span>
              <textarea
                rows={5}
                value={suggestionIdea}
                onChange={(event) => setSuggestionIdea(event.target.value)}
                placeholder="Describe the feature or improvement you want to suggest"
              />
            </label>
            {suggestionStatus ? <p className="plugin-form-status">{suggestionStatus}</p> : null}
            <button type="submit" className="plugin-auth-btn">
              Send Suggestion
            </button>
          </form>
        </>
      );
    }

    return modalContent.body;
  }, [activeModal, modalContent, suggestionEmail, suggestionIdea, suggestionStatus]);

  const handleToggleTheme = () => {
    setTheme((current) => (current === "light" ? "dark" : "light"));
  };

  const handleCardSelect = (section) => {
    if (section === "plugins") {
      router.push("/plugins");
      return;
    }

    setActiveModal(section);
  };

  const handleNavSelect = (event, section, href) => {
    if (href.startsWith("http")) {
      setIsMenuOpen(false);
      return;
    }

    if (section === "plugins") {
      setIsMenuOpen(false);
      return;
    }

    if (section && section !== "home") {
      event.preventDefault();
      setIsMenuOpen(false);
      setActiveModal(section);
      return;
    }

    if (href.startsWith("/")) {
      setIsMenuOpen(false);
      return;
    }

    setIsMenuOpen(false);
  };

  const handleFooterSelect = (event, section) => {
    event.preventDefault();
    setActiveModal(section);
  };


  return (
    <div className={`page-shell ${theme === "light" ? "light" : ""}`}>
      <div className="background-elements">
        <div className="glow glow-1" />
        <div className="glow glow-2" />
        <div className="glow glow-3" />
        <div className="shape shape-1" />
        <div className="shape shape-2" />
      </div>

      <div className="snow" />

      <Navbar
        theme={theme}
        onToggleTheme={handleToggleTheme}
        isMenuOpen={isMenuOpen}
        onToggleMenu={() => setIsMenuOpen((current) => !current)}
        onNavSelect={handleNavSelect}
        activeSection={activeModal}
      />

      <main className="main-content">
        <Hero onCardSelect={handleCardSelect} />
      </main>

      {modalContent && (
        <div
          className="modal-overlay active"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setActiveModal(null);
            }
          }}
        >
          <div className="modal-content">
            <button className="modal-close-btn" onClick={() => setActiveModal(null)} aria-label="Close modal">
              ×
            </button>
            <div id="modal-body">
              <h2>
                <i className={`fas fa-${modalContent.icon}`} /> {modalContent.title}
              </h2>
              {modalBodyContent}
            </div>
          </div>
        </div>
      )}

      <Footer onSectionSelect={handleFooterSelect} />
    </div>
  );
}
