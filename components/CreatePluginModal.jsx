"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase";

export default function CreateCommandModal({ isOpen, onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [command, setCommand] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!isOpen) return null;

  const submitCommand = async (event) => {
    event.preventDefault();
    const client = getSupabase();

    if (!client) {
      setError("Supabase browser credentials are missing. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment.");
      return;
    }

    const cleanedTitle = title.trim();
    const cleanedDescription = description.trim();
    const cleanedCommand = command.trim();

    if (!cleanedTitle || !cleanedDescription || !cleanedCommand) {
      setError("Title, description, and command are all required.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const {
        data: { user },
      } = await client.auth.getUser();

      if (!user) {
        throw new Error("Your browser session is not active yet. Sign in again or confirm your email before submitting a plugin.");
      }

      const { error: insertError } = await client.from("commands").insert({
        title: cleanedTitle,
        description: cleanedDescription,
        command: cleanedCommand,
        status: "pending",
        created_by: user.email,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (insertError) {
        const message = insertError?.message?.toLowerCase() || "";
        if (message.includes("row-level security") || message.includes("policy")) {
          throw new Error("Supabase is blocking the insert. Add an insert policy for authenticated users on the public.commands table.");
        }
        throw insertError;
      }

      setSuccess("Submitted, pending for review.");
      setTitle("");
      setDescription("");
      setCommand("");
      onCreated?.();
    } catch (submitError) {
      setError(submitError?.message || "Unable to submit plugins right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-overlay active"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="modal-content plugin-auth-modal">
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          ×
        </button>

        <div id="modal-body">
          <h2>
            <i className="fas fa-plus-circle" /> Create plugin
          </h2>
          <p className="plugin-auth-copy">Submit a plugin title, a concise description, and the command snippet. Admin review is required before it appears on the main plugin board.</p>

          <form className="plugin-auth-form" onSubmit={submitCommand}>
            <label className="plugin-field">
              <span>Title</span>
              <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Command title" required />
            </label>

            <label className="plugin-field">
              <span>Description</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
                placeholder="Short description of what the command does"
                required
              />
            </label>

            <label className="plugin-field">
              <span>Command</span>
              <textarea
                value={command}
                onChange={(event) => setCommand(event.target.value)}
                rows={6}
                placeholder="Paste the command or code snippet"
                required
              />
            </label>

            {error && <p className="plugin-form-error">{error}</p>}
            {success && <p className="plugin-form-success">{success}</p>}

            <div className="plugin-auth-actions">
              <button type="submit" className="plugin-auth-btn" disabled={loading}>
                {loading ? "Submitting..." : "Submit plugin"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
