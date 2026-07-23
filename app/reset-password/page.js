"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const [status, setStatus] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const hash = window.location.hash || "";
    if (!hash) return;
    const params = new URLSearchParams(hash.replace("#", ""));
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");

    if (access_token && refresh_token) {
      (async () => {
        const client = getSupabase();
        if (!client) {
          setStatus("Supabase client not available.");
          return;
        }

        const { error } = await client.auth.setSession({ access_token, refresh_token });
        if (error) {
          setStatus("Invalid or expired reset link.");
          return;
        }

        setReady(true);
        // remove tokens from URL to avoid leakage
        try {
          window.history.replaceState({}, "", window.location.pathname);
        } catch (e) {
          // ignore
        }
      })();
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("");

    if (newPassword.length < 8) {
      setStatus("Password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirm) {
      setStatus("Passwords do not match.");
      return;
    }

    setLoading(true);
    const client = getSupabase();
    if (!client) {
      setStatus("Supabase client not available.");
      setLoading(false);
      return;
    }

    const { error } = await client.auth.updateUser({ password: newPassword });
    if (error) {
      setStatus(error.message || "Could not update password.");
      setLoading(false);
      return;
    }

    await client.auth.signOut();
    setStatus("Password updated. You can now sign in.");
    setLoading(false);
  };

  return (
    <div className="page-shell">
      <main className="main-content">
        <div style={{ maxWidth: 640, margin: "3rem auto" }}>
          <h1>Reset your password</h1>
          {status ? <p className="plugin-form-status">{status}</p> : null}

          {ready ? (
            <form className="plugin-auth-form" onSubmit={handleSubmit}>
              <label className="plugin-field">
                <span>New password</span>
                <div className="plugin-password-row">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <button type="button" className="plugin-password-toggle" onClick={() => setShowPassword((current) => !current)}>
                    <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`} />
                  </button>
                </div>
              </label>

              <label className="plugin-field">
                <span>Confirm password</span>
                <div className="plugin-password-row">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                  />
                  <button type="button" className="plugin-password-toggle" onClick={() => setShowConfirmPassword((current) => !current)}>
                    <i className={`fas ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`} />
                  </button>
                </div>
              </label>

              <div className="plugin-auth-actions">
                <button type="submit" className="plugin-auth-btn" disabled={loading}>
                  {loading ? "Updating..." : "Set new password"}
                </button>
              </div>
            </form>
          ) : (
            <div>
              <p>
                Open the link from the password reset email and you will be able to set a new password here. If you clicked the link already,
                reload this page after following the email link.
              </p>
              <Link href="/plugins" className="text-link-btn">
                Back to plugins
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
