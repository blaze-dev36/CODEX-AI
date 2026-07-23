"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDownWideNarrow, ArrowUpWideNarrow } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { modalContentMap } from "@/lib/modalContent";
import { pluginCatalog } from "@/lib/pluginCatalog";
import { getSupabase } from "@/lib/supabase";

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

const sortOptions = ["newest", "oldest"];
const sortLabelMap = {
  newest: "",
  oldest: "",
};
const ADMIN_EMAILS = [
  "dangogodspower@gmail.com",
  ...(process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
].filter((email, index, items) => email && items.indexOf(email) === index);

const isAdminEmail = (email) => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
};

const isAdminSession = async (client, email, userId) => {
  if (!client || !email) return false;

  if (isAdminEmail(email)) {
    return true;
  }

  if (!userId) return false;

  const { data, error } = await client.from("profiles").select("role").eq("id", userId).maybeSingle();

  return !error && data?.role === "admin";
};

const getSiteUrl = () => {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configuredUrl) {
    return configuredUrl;
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "https://codex-ai-site.vercel.app";
};

export default function PluginsPage() {
  const [theme, setTheme] = useState("dark");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sortMode, setSortMode] = useState("newest");
  const [isCreateAuthOpen, setIsCreateAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authStep, setAuthStep] = useState("auth");
  const [pluginForm, setPluginForm] = useState({
    name: "",
    phone: "",
    title: "",
    description: "",
    code: "",
    file: null,
  });
  const [pluginSubmitting, setPluginSubmitting] = useState(false);
  const [pluginSubmitMessage, setPluginSubmitMessage] = useState("");
  const [selectedPlugin, setSelectedPlugin] = useState(null);
  const [detailCopyMessage, setDetailCopyMessage] = useState("");
  const [approvedPlugins, setApprovedPlugins] = useState([]);
  const [passwordResetMessage, setPasswordResetMessage] = useState("");

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

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedQuery(searchQuery.trim().toLowerCase());
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    const loadApprovedPlugins = async () => {
      const client = getSupabase();
      if (!client) {
        return;
      }

      const { data, error } = await client
        .from("plugins")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Could not load approved plugins", error);
        return;
      }

      setApprovedPlugins(
        (data || []).map((plugin) => ({
          name: plugin.name,
          author: plugin.author,
          description: plugin.description,
          repository: plugin.repository,
          publishedAt: plugin.published_at,
          sourceCode: plugin.code,
        }))
      );
    };

    void loadApprovedPlugins();
  }, []);

  useEffect(() => {
    const syncSignedInState = async () => {
      const client = getSupabase();
      if (!client) {
        return;
      }

      const urlParams = new URLSearchParams(window.location.search);
      const shouldOpenCreateModal = urlParams.get("create") === "true";

      const {
        data: { user },
        error,
      } = await client.auth.getUser();

      if (shouldOpenCreateModal) {
        window.history.replaceState({}, "", window.location.pathname);

        if (!error && user?.email) {
          const adminMatch = await isAdminSession(client, user.email, user?.id);
          if (adminMatch) {
            window.location.assign("/admin");
            return;
          }

          setIsCreateAuthOpen(true);
          setAuthStep("create-plugin");
          setAuthMessage("You are ready to continue.");
          return;
        }

        setIsCreateAuthOpen(true);
        setAuthStep("auth");
        setAuthMessage("Please sign in to continue creating your plugin.");
      }
    };

    void syncSignedInState();
  }, []);

  const modalContent = useMemo(() => {
    if (!activeModal) return null;
    return modalContentMap[activeModal] || null;
  }, [activeModal]);

  const filteredPlugins = useMemo(() => {
    const query = debouncedQuery.trim().toLowerCase();
    const combinedPlugins = [...pluginCatalog, ...approvedPlugins];
    const sortedPlugins = [...combinedPlugins].sort((left, right) => {
      const comparison = left.name.localeCompare(right.name);
      return sortMode === "oldest" ? comparison * -1 : comparison;
    });

    if (!query) {
      return sortedPlugins;
    }

    return sortedPlugins
      .map((plugin) => {
        const searchableFields = [plugin.name, plugin.author];
        const score = searchableFields.reduce((total, value) => {
          const text = String(value ?? "").toLowerCase();
          if (!text) return total;

          if (text.startsWith(query)) {
            return total + 3;
          }

          if (text.includes(query)) {
            return total + 1;
          }

          return total;
        }, 0);

        return { plugin, score };
      })
      .filter(({ score }) => score > 0)
      .sort((left, right) => right.score - left.score || left.plugin.name.localeCompare(right.plugin.name))
      .map(({ plugin }) => plugin);
  }, [debouncedQuery, sortMode, approvedPlugins]);

  const handleToggleTheme = () => {
    setTheme((current) => (current === "light" ? "dark" : "light"));
  };

  const handleSortToggle = () => {
    setSortMode((current) => {
      const currentIndex = sortOptions.indexOf(current);
      const nextIndex = (currentIndex + 1) % sortOptions.length;
      return sortOptions[nextIndex];
    });
  };

  const handleOpenCreateModal = () => {
    setAuthMode("login");
    setAuthEmail("");
    setAuthPassword("");
    setAuthName("");
    setAuthMessage("");
    setShowPassword(false);
    setAuthStep("auth");
    setIsCreateAuthOpen(true);
  };

  const SortIcon = sortMode === "oldest" ? ArrowDownWideNarrow : ArrowUpWideNarrow;

  const handleNavSelect = (event, section, href) => {
    if (href.startsWith("http")) {
      setIsMenuOpen(false);
      return;
    }

    if (section === "plugins") {
      event.preventDefault();
      setIsMenuOpen(false);
      return;
    }

    if (section && section !== "home") {
      event.preventDefault();
      setIsMenuOpen(false);
      window.location.assign(`/?section=${section}`);
      return;
    }

    setIsMenuOpen(false);
  };

  const handleFooterSelect = (event, section) => {
    event.preventDefault();
    setActiveModal(section);
    setIsMenuOpen(false);
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setAuthLoading(true);
    setAuthMessage("");
    setPasswordResetMessage("");

    const client = getSupabase();
    if (!client) {
      setAuthMessage("Authentication is temporarily unavailable. Please try again shortly.");
      setAuthLoading(false);
      return;
    }

    const email = authEmail.trim();
    const password = authPassword.trim();

    if (!email || !password) {
      setAuthMessage("Please enter your email and password to continue.");
      setAuthLoading(false);
      return;
    }

    try {
      const { data: signInData, error: signInError } = await client.auth.signInWithPassword({ email, password });

      if (signInError) {
        const signUpResult = await client.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${getSiteUrl()}/plugins?create=true`,
          },
        });

        if (signUpResult.error) {
          setAuthMessage("Sign-in failed. Check your credentials and try again.");
          return;
        }

        if (!signUpResult.data?.session) {
          setAuthMessage("Account created. Confirm your email and sign in again.");
          return;
        }

        if (isAdminEmail(email)) {
          setAuthMessage("Admin access confirmed. Redirecting to admin...");
          window.location.assign("/admin");
          return;
        }

        setAuthMessage("You may now continue to submit your plugin.");
        setAuthStep("create-plugin");
        setAuthEmail("");
        setAuthPassword("");
        setAuthName("");
        return;
      }

      if (!signInData?.session) {
        setAuthMessage("Could not establish a session. Please try again.");
        return;
      }

      const {
        data: { user },
        error: sessionError,
      } = await client.auth.getUser();

      if (sessionError || !user?.email) {
        setAuthMessage("Could not establish a session. Please try again.");
        return;
      }

      const adminMatch = await isAdminSession(client, user.email, user.id);
      if (adminMatch) {
        setAuthMessage("Admin access confirmed. Redirecting to admin...");
        window.location.assign("/admin");
        return;
      }

      setAuthMessage("You may now continue to submit your plugin.");
      setAuthStep("create-plugin");
      setAuthEmail("");
      setAuthPassword("");
      setAuthName("");
    } catch {
      setAuthMessage("Could not complete your request. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleResetSubmit = async (event) => {
    event.preventDefault();
    setAuthLoading(true);
    setPasswordResetMessage("");
    setAuthMessage("");

    const client = getSupabase();
    if (!client) {
      setPasswordResetMessage("Password reset is temporarily unavailable. Please try again shortly.");
      setAuthLoading(false);
      return;
    }

    const email = authEmail.trim();
    if (!email) {
      setPasswordResetMessage("Enter your email address to receive a reset link.");
      setAuthLoading(false);
      return;
    }

    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: `${getSiteUrl()}/reset-password`,
    });

    if (error) {
      setPasswordResetMessage("Unable to send reset link. Please check your email and try again.");
      setAuthLoading(false);
      return;
    }

    setPasswordResetMessage("Good news — we sent the reset link. Check your inbox and follow the email link.");
    setAuthLoading(false);
  };

  const handleSocialAuth = async (provider) => {
    setAuthLoading(true);
    setAuthMessage("");

    const client = getSupabase();
    if (!client) {
      setAuthMessage("Authentication is temporarily unavailable. Please try again shortly.");
      setAuthLoading(false);
      return;
    }

    try {
      const { data, error } = await client.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${getSiteUrl()}/plugins?create=true`,
        },
      });

      if (error) {
        setAuthMessage("We could not start the sign-in process right now. Please try again shortly.");
        setAuthLoading(false);
        return;
      }

      if (data?.url) {
        setAuthMessage("Redirecting to GitHub for authentication...");
        window.location.assign(data.url);
      }
    } catch {
      setAuthMessage("We could not start the sign-in process right now. Please try again shortly.");
      setAuthLoading(false);
    }
  };

  const handlePluginSubmit = async (event) => {
    event.preventDefault();
    setPluginSubmitting(true);
    setPluginSubmitMessage("");

    const client = getSupabase();
    if (!client) {
      setPluginSubmitMessage("Submission is temporarily unavailable. Please try again shortly.");
      setPluginSubmitting(false);
      return;
    }

    const requiredFields = [pluginForm.name, pluginForm.phone, pluginForm.title, pluginForm.description];
    if (requiredFields.some((value) => value.trim() === "")) {
      setPluginSubmitMessage("Please complete all required fields before submitting.");
      setPluginSubmitting(false);
      return;
    }

    if (!pluginForm.code.trim() && !pluginForm.file) {
      setPluginSubmitMessage("Please paste your source code or upload a file before submitting.");
      setPluginSubmitting(false);
      return;
    }

    if (pluginForm.file && pluginForm.file.size > 5 * 1024 * 1024) {
      setPluginSubmitMessage("The uploaded file must be 5MB or smaller.");
      setPluginSubmitting(false);
      return;
    }

    try {
      const {
        data: { user },
        error: userError,
      } = await client.auth.getUser();

      if (userError || !user?.id) {
        setAuthMessage("Please sign in again before submitting your plugin.");
        setAuthStep("auth");
        setPluginSubmitting(false);
        return;
      }

      let fileUrl = null;
      if (pluginForm.file) {
        const safeFileName = pluginForm.file.name.replace(/\s+/g, "-");
        const storagePath = `${user.id}/${Date.now()}-${safeFileName}`;
        const { error: uploadError } = await client.storage.from("plugin-files").upload(storagePath, pluginForm.file, {
          upsert: false,
        });

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicUrlData } = client.storage.from("plugin-files").getPublicUrl(storagePath);
        fileUrl = publicUrlData?.publicUrl || storagePath;
      }

      const { error: insertError } = await client.from("plugin_submissions").insert({
        user_id: user.id,
        name: pluginForm.name.trim(),
        phone: pluginForm.phone.trim(),
        title: pluginForm.title.trim(),
        description: pluginForm.description.trim(),
        code: pluginForm.code.trim(),
        file_url: fileUrl,
        status: "pending",
      });

      if (insertError) {
        throw insertError;
      }

      try {
        await fetch("/api/admin/notify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            submission: {
              name: pluginForm.name.trim(),
              title: pluginForm.title.trim(),
              description: pluginForm.description.trim(),
              code: pluginForm.code.trim(),
              phone: pluginForm.phone.trim(),
              fileUrl,
              userId: user.id,
            },
          }),
        });
      } catch (notifyError) {
        console.warn("Plugin notification failed", notifyError);
      }

      setPluginSubmitMessage("Thank you. Your plugin request has been received and will be reviewed shortly.");
      setPluginForm({
        name: "",
        phone: "",
        title: "",
        description: "",
        code: "",
        file: null,
      });
    } catch (error) {
      console.error("Plugin submission failed", error);
      setPluginSubmitMessage("We could not submit your plugin request right now. Please try again shortly.");
    } finally {
      setPluginSubmitting(false);
    }
  };

  const handleBackToPlugins = () => {
    setIsCreateAuthOpen(false);
    setAuthStep("auth");
    setAuthMessage("");
    setPluginSubmitMessage("");
    setShowPassword(false);
  };

  const handleOpenPluginDetails = (plugin) => {
    setDetailCopyMessage("");
    setSelectedPlugin(plugin);
  };

  const handleClosePluginDetails = () => {
    setSelectedPlugin(null);
    setDetailCopyMessage("");
  };

  const handleCopyPluginUrl = async () => {
    if (!selectedPlugin) return;

    const shareUrl = `${getSiteUrl()}/plugins?plugin=${encodeURIComponent(selectedPlugin.name)}`;
    const copyText = `.plugin+${shareUrl}`;

    try {
      await navigator.clipboard.writeText(copyText);
      setDetailCopyMessage("Command copied.");
    } catch {
      setDetailCopyMessage("Copy is unavailable right now.");
    }
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
        activeSection="plugins"
      />

      <main className="main-content plugin-main-content">
        <div className="plugin-page-shell">
          <div className="plugin-header-row">
            <div className="plugin-header-copy">
              <h1>Plugins</h1>
            </div>

            <Link href="/" className="back-home-link" aria-label="Back to home">
              <i className="fas fa-home" />
            </Link>
          </div>

          <section className="plugin-board" aria-label="Plugin command board">
            <div className="plugin-toolbar">
              <label className="plugin-search-wrapper" aria-label="Search plugins">
                <i className="fas fa-search" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search by name or author..."
                />
              </label>

              <button type="button" className="plugin-sort-button" onClick={handleSortToggle} aria-label={`Sort by ${sortLabelMap[sortMode]}`}>
                <span className="plugin-sort-icon">
                  <SortIcon size={18} />
                </span>
                <span>{sortLabelMap[sortMode]}</span>
              </button>

              <button type="button" className="plugin-create-btn" onClick={() => void handleOpenCreateModal()}>
                <i className="fas fa-plus" />
                <span>Create Plugin</span>
              </button>
            </div>

            {filteredPlugins.length > 0 ? (
              <div className="plugin-board-grid">
                {filteredPlugins.map((plugin) => (
                  <article
                    className="plugin-command-card"
                    key={plugin.name}
                    onClick={() => handleOpenPluginDetails(plugin)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleOpenPluginDetails(plugin);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Open details for ${plugin.name}`}
                  >
                    <div className="plugin-card-meta-row">
                      <span className="status-pill">Public</span>
                      <span className="plugin-date-label">
                        <i className="fas fa-puzzle-piece" />
                      </span>
                    </div>

                    <h3>{plugin.name}</h3>
                    <div className="plugin-meta-line">
                      <span>by</span>
                      <strong>{plugin.author}</strong>
                    </div>

                    <p>{plugin.description}</p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="plugin-empty-state">
                <h3>No plugins found</h3>
                <p>Try another search term.</p>
              </div>
            )}
          </section>
        </div>
      </main>

      {modalContent ? (
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
              {modalContent.body}
            </div>
          </div>
        </div>
      ) : null}

      {selectedPlugin ? (
        <div
          className="modal-overlay active"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              handleClosePluginDetails();
            }
          }}
        >
          <div className="modal-content plugin-detail-modal">
            <button className="modal-close-btn" onClick={handleClosePluginDetails} aria-label="Close plugin details">
              ×
            </button>

            <div id="modal-body" className="plugin-detail-body">
              <div className="plugin-detail-badge-row">
                <span className="status-pill">Public</span>
                <span className="plugin-detail-date">{selectedPlugin.publishedAt}</span>
              </div>

              <h2>
                <i className="fas fa-puzzle-piece" /> {selectedPlugin.name}
              </h2>

              <div className="plugin-detail-meta-grid">
                <div>
                  <span className="plugin-detail-label">Created by</span>
                  <strong>{selectedPlugin.author}</strong>
                </div>
                <div>
                  <span className="plugin-detail-label">Publication date</span>
                  <strong>{selectedPlugin.publishedAt}</strong>
                </div>
              </div>

              <p className="plugin-detail-description">{selectedPlugin.description}</p>

              <div className="plugin-code-viewer">
                <div className="plugin-code-viewer-header">
                  <span>Source code</span>
                  <span className="plugin-code-viewer-status">Read-only</span>
                </div>
                <pre className="plugin-code-block">
                  <code>{selectedPlugin.sourceCode || selectedPlugin.code || "No source code available."}</code>
                </pre>
              </div>

              <div className="plugin-detail-actions">
                <button type="button" className="plugin-auth-btn" onClick={handleCopyPluginUrl}>
                  Copy URL
                </button>
                {detailCopyMessage ? <p className="plugin-form-status">{detailCopyMessage}</p> : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isCreateAuthOpen ? (
        <div
          className="modal-overlay active"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setIsCreateAuthOpen(false);
            }
          }}
        >
          <div className="modal-content plugin-auth-modal">
            <button className="modal-close-btn" onClick={() => setIsCreateAuthOpen(false)} aria-label="Close modal">
              ×
            </button>

            <div id="modal-body">
              <div className="plugin-auth-hero">
                <div className="plugin-auth-icon">
                  <i className="fas fa-shield-alt" />
                </div>
                <div>
                  <p className="plugin-auth-copy">Login or create an account to create plugins.</p>
                </div>
              </div>

              {authStep === "auth" ? (
                <form className="plugin-auth-form" onSubmit={handleAuthSubmit}>
                  {authMode === "signup" ? (
                    <label className="plugin-field">
                      <span>Full name</span>
                      <input type="text" value={authName} onChange={(event) => setAuthName(event.target.value)} placeholder="Your full name" />
                    </label>
                  ) : null}

                  <label className="plugin-field">
                    <span>Email address</span>
                    <input type="email" value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} placeholder="you@gmail.com" />
                  </label>

                  <label className="plugin-field">
                    <span>Password</span>
                    <div className="plugin-password-row">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={authPassword}
                        onChange={(event) => setAuthPassword(event.target.value)}
                        placeholder="Enter your password"
                      />
                      <button type="button" className="plugin-password-toggle" onClick={() => setShowPassword((current) => !current)}>
                        <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`} />
                      </button>
                    </div>
                  </label>

                  <div className="plugin-auth-row">
                    <button
                      type="button"
                      className="text-link-btn"
                      onClick={() => {
                        setPasswordResetMessage("");
                        setAuthMessage("");
                        setShowPassword(false);
                        setAuthStep("reset-password");
                      }}
                    >
                      Forgot password?
                    </button>
                  </div>

                  {passwordResetMessage ? <p className="plugin-form-status">{passwordResetMessage}</p> : null}
                  {authMessage ? <p className="plugin-form-status">{authMessage}</p> : null}

                  <div className="plugin-auth-actions">
                    <button type="submit" className="plugin-auth-btn" disabled={authLoading}>
                      {authLoading ? "Working..." : authMode === "login" ? "Continue" : "Create account"}
                    </button>
                  </div>

                  <div className="plugin-auth-divider">
                    <span>or continue with</span>
                  </div>

                  <div className="plugin-social-stack">
                    <button type="button" className="plugin-social-btn secondary" onClick={() => void handleSocialAuth("github")}>
                      <i className="fab fa-github" />
                      GitHub
                    </button>
                  </div>
                </form>
              ) : authStep === "reset-password" ? (
                <div className="plugin-reset-panel">
                  <p className="plugin-auth-copy">Enter your email and we will send a secure reset link to complete your password update.</p>
                  <form className="plugin-auth-form" onSubmit={handleResetSubmit}>
                    <label className="plugin-field">
                      <span>Email address</span>
                      <input type="email" value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} placeholder="you@gmail.com" required />
                    </label>

                    {passwordResetMessage ? <p className="plugin-form-status">{passwordResetMessage}</p> : null}

                    <div className="plugin-auth-actions">
                      <button type="submit" className="plugin-auth-btn" disabled={authLoading}>
                        {authLoading ? "Sending..." : "Send reset link"}
                      </button>
                    </div>
                  </form>

                  <button type="button" className="text-link-btn" onClick={() => {
                    setAuthStep("auth");
                    setPasswordResetMessage("");
                  }}>
                    Back to sign in
                  </button>
                </div>
              ) : (
                <div className="plugin-create-panel">
                  <div className="plugin-create-header">
                    <button type="button" className="plugin-back-link" onClick={handleBackToPlugins}>
                      <i className="fas fa-arrow-left" /> Back to plugins
                    </button>
                  </div>

                  <h1>Create plugin</h1>

                  <form className="plugin-auth-form" onSubmit={handlePluginSubmit}>
                    <label className="plugin-field">
                      <span>Your name</span>
                      <input
                        type="text"
                        value={pluginForm.name}
                        onChange={(event) => setPluginForm((current) => ({ ...current, name: event.target.value }))}
                        placeholder="Enter your name"
                      />
                    </label>

                    <label className="plugin-field">
                      <span>Phone number</span>
                      <input
                        type="tel"
                        value={pluginForm.phone}
                        onChange={(event) => setPluginForm((current) => ({ ...current, phone: event.target.value }))}
                        placeholder="Enter your phone number"
                      />
                    </label>

                    <label className="plugin-field">
                      <span>Plugin title</span>
                      <input
                        type="text"
                        value={pluginForm.title}
                        onChange={(event) => setPluginForm((current) => ({ ...current, title: event.target.value }))}
                        placeholder="What should this plugin be called?"
                      />
                    </label>

                    <label className="plugin-field">
                      <span>Description</span>
                      <textarea
                        rows={4}
                        value={pluginForm.description}
                        onChange={(event) => setPluginForm((current) => ({ ...current, description: event.target.value }))}
                        placeholder="Describe what your plugin does"
                      />
                    </label>

                    <label className="plugin-field">
                      <span>Code</span>
                      <textarea
                        rows={8}
                        value={pluginForm.code}
                        onChange={(event) => setPluginForm((current) => ({ ...current, code: event.target.value }))}
                        placeholder="Paste your plugin code here"
                      />
                    </label>

                    <label className="plugin-field">
                      <span>Upload file</span>
                      <input
                        className="plugin-file-input"
                        type="file"
                        onChange={(event) => {
                          const selectedFile = event.target.files?.[0] || null;
                          setPluginForm((current) => ({ ...current, file: selectedFile }));
                        }}
                      />
                      <small className="plugin-form-hint">Maximum file size: 5MB</small>
                    </label>

                    {pluginSubmitMessage ? <p className={pluginSubmitMessage.includes("received") ? "plugin-form-success" : "plugin-form-error"}>{pluginSubmitMessage}</p> : null}

                    <div className="plugin-auth-actions">
                      <button type="submit" className="plugin-auth-btn" disabled={pluginSubmitting}>
                        {pluginSubmitting ? "Submitting..." : "Submit plugin"}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      <Footer onSectionSelect={handleFooterSelect} />
    </div>
  );
}
