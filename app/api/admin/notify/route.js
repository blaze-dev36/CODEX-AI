import { createTransport } from "nodemailer";

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim())
  .filter(Boolean);

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const SMTP_FROM = process.env.SMTP_FROM || process.env.SMTP_USER;

const transport = SMTP_HOST && SMTP_USER && SMTP_PASSWORD ? createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  },
}) : null;

export async function POST(request) {
  try {
    if (!ADMIN_EMAILS.length) {
      return new Response(JSON.stringify({ error: "Admin email configuration is missing." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!transport || !SMTP_FROM) {
      return new Response(JSON.stringify({ error: "SMTP configuration is incomplete." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await request.json();
    const submission = body?.submission;

    if (!submission || !submission.name || !submission.title || !submission.description) {
      return new Response(JSON.stringify({ error: "Invalid submission payload." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const html = `
      <h2>New plugin submission</h2>
      <p><strong>Name:</strong> ${submission.name}</p>
      <p><strong>Title:</strong> ${submission.title}</p>
      <p><strong>Description:</strong><br/>${submission.description}</p>
      <p><strong>Phone:</strong> ${submission.phone || "Not provided"}</p>
      <p><strong>User ID:</strong> ${submission.userId || "Unknown"}</p>
      <pre style="white-space: pre-wrap; background: #f4f4f4; padding: 12px; border-radius: 8px;">${submission.code || "No code provided."}</pre>
      ${submission.fileUrl ? `<p><strong>File path:</strong> ${submission.fileUrl}</p>` : ""}
    `;

    await transport.sendMail({
      to: ADMIN_EMAILS,
      from: SMTP_FROM,
      subject: `New plugin submission: ${submission.title}`,
      text: `New plugin submission from ${submission.name}. Title: ${submission.title}. Description: ${submission.description}`,
      html,
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Plugin submission notification failed", error);
    return new Response(JSON.stringify({ error: "Could not send notification." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
