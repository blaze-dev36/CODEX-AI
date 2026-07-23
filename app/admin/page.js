"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";

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

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
};

export default function AdminPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [adminEmail, setAdminEmail] = useState("");

  const fetchSubmissions = async (client) => {
    const { data, error } = await client
      .from("plugin_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setErrorMessage("We could not load the submissions queue right now.");
      return;
    }

    setSubmissions(data || []);
  };

  useEffect(() => {
    const syncAdminDashboard = async () => {
      const client = getSupabase();
      if (!client) {
        setErrorMessage("Supabase authentication is not configured for this browser session.");
        setLoading(false);
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await client.auth.getUser();

      if (userError || !user?.email) {
        window.location.assign("/plugins");
        return;
      }

      setAdminEmail(user.email);

      const adminMatch = await isAdminSession(client, user.email, user.id);
      if (!adminMatch) {
        window.location.assign("/plugins");
        return;
      }

      await fetchSubmissions(client);
      setLoading(false);
    };

    void syncAdminDashboard();
  }, []);

  const handleSubmissionAction = async (submissionId, nextStatus) => {
    const client = getSupabase();
    if (!client) {
      setErrorMessage("Supabase authentication is not configured for this browser session.");
      return;
    }

    const submission = submissions.find((item) => item.id === submissionId);
    if (!submission) {
      return;
    }

    setActionLoadingId(submissionId);
    setStatusMessage("");
    setErrorMessage("");

    try {
      const response = await fetch("/api/admin/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          submissionId,
          nextStatus,
          adminEmail,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "The review action was not completed.");
      }

      setSubmissions((current) => current.filter((item) => item.id !== submissionId));
      setStatusMessage(`Submission ${nextStatus} successfully.`);
    } catch (error) {
      console.error("Admin review update failed", error);
      setErrorMessage("The review action was not completed. Please try again shortly.");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="page-shell">
      <main className="main-content plugin-main-content">
        <div className="plugin-page-shell">
          <div className="plugin-header-row">
            <div className="plugin-header-copy">
              <h1>Admin Review</h1>
              <p className="plugin-auth-copy">Review submitted plugins, approve the ones you want public, and reject the rest.</p>
            </div>

            <Link href="/plugins" className="back-home-link" aria-label="Back to plugins">
              <i className="fas fa-arrow-left" />
            </Link>
          </div>

          {loading ? (
            <div className="plugin-empty-state">
              <h3>Checking admin access…</h3>
              <p>Please wait while the dashboard loads.</p>
            </div>
          ) : null}

          {errorMessage ? <p className="plugin-form-error">{errorMessage}</p> : null}
          {statusMessage ? <p className="plugin-form-success">{statusMessage}</p> : null}

          {!loading && submissions.length === 0 ? (
            <div className="plugin-empty-state">
              <h3>No pending submissions</h3>
              <p>When users submit plugin requests, they will appear here for review.</p>
            </div>
          ) : null}

          {!loading && submissions.length > 0 ? (
            <section className="plugin-board" aria-label="Admin submissions queue">
              <div className="plugin-board-grid">
                {submissions.map((submission) => (
                  <article className="plugin-command-card" key={submission.id}>
                    <div className="plugin-card-meta-row">
                      <span className="status-pill">{submission.status}</span>
                      <span className="plugin-date-label">
                        <i className="fas fa-clock" />
                      </span>
                    </div>

                    <h3>{submission.title}</h3>
                    <div className="plugin-meta-line">
                      <span>Submitted by</span>
                      <strong>{submission.name}</strong>
                    </div>

                    <p>{submission.description}</p>
                    <p className="plugin-form-hint">Phone: {submission.phone || "Not provided"}</p>
                    <p className="plugin-form-hint">Created: {formatDate(submission.created_at)}</p>

                    <div className="plugin-code-viewer" style={{ marginTop: "1rem" }}>
                      <div className="plugin-code-viewer-header">
                        <span>Submission code</span>
                        <span className="plugin-code-viewer-status">Review</span>
                      </div>
                      <pre className="plugin-code-block">
                        <code>{submission.code}</code>
                      </pre>
                    </div>

                    {submission.file_url ? (
                      <p className="plugin-form-hint">Uploaded file: {submission.file_url}</p>
                    ) : null}

                    <div className="plugin-detail-actions" style={{ marginTop: "1rem" }}>
                      <button
                        type="button"
                        className="plugin-auth-btn"
                        disabled={actionLoadingId === submission.id}
                        onClick={() => void handleSubmissionAction(submission.id, "approved")}
                      >
                        {actionLoadingId === submission.id ? "Working..." : "Approve"}
                      </button>
                      <button
                        type="button"
                        className="plugin-social-btn secondary"
                        disabled={actionLoadingId === submission.id}
                        onClick={() => void handleSubmissionAction(submission.id, "rejected")}
                      >
                        {actionLoadingId === submission.id ? "Working..." : "Reject"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </main>
    </div>
  );
}
