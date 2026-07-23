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
    const email = String(body?.email || "").trim();
    const idea = String(body?.idea || "").trim();

    if (!email || !idea) {
      return new Response(JSON.stringify({ error: "Email and idea are required." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const html = `
      <h2>New suggestion submitted</h2>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Idea:</strong><br/>${idea.replace(/\n/g, "<br/>")}</p>
    `;

    await transport.sendMail({
      to: ADMIN_EMAILS,
      from: SMTP_FROM,
      subject: `New suggestion from ${email}`,
      text: `New suggestion from ${email}: ${idea}`,
      html,
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Suggestion submission failed", error);
    return new Response(JSON.stringify({ error: "Could not submit your suggestion." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
