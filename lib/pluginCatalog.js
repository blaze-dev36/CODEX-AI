export const pluginCatalog = [
  {
    name: "Weather Assistant",
    author: "CODEX Labs",
    description: "Delivers real-time weather updates and forecasts for users inside the bot.",
    repository: "https://github.com/CODEX-SPACEX/CODEX-AI",
    publishedAt: "2026-06-14",
    sourceCode: `const weatherResponse = async (city) => {
  const forecast = await fetchWeather(city);
  return formatWeatherSummary(forecast);
};`,
  },
  {
    name: "Lead Capture",
    author: "Bailey Studio",
    description: "Collects new leads from chat conversations and routes them into your CRM.",
    repository: "https://github.com/CODEX-SPACEX/CODEX-AI",
    publishedAt: "2026-05-27",
    sourceCode: `export async function captureLead(payload) {
  await crm.createContact(payload);
  return { ok: true };
}`,
  },
  {
    name: "Booking Bot",
    author: "Northstar Dev",
    description: "Enables appointment scheduling and reminder flows directly from WhatsApp.",
    repository: "https://github.com/CODEX-SPACEX/CODEX-AI",
    publishedAt: "2026-04-03",
    sourceCode: `function confirmSlot(slotId) {
  return messaging.send("Appointment reserved successfully.");
}`,
  },
  {
    name: "Knowledge Base",
    author: "Docs Collective",
    description: "Surface FAQ replies and searchable documentation from a knowledge base.",
    repository: "https://github.com/CODEX-SPACEX/CODEX-AI",
    publishedAt: "2026-03-18",
    sourceCode: `const answers = await kb.search(query);
return answers.map((item) => item.answer);`,
  },
  {
    name: "Testing successfull",
    author: "happiness",
    description :"Bla bla bla.....",
    repository: "https://github.com/my/sassyass",
    publishedAt: "3009-04-23",
    sourceCode :`import { NextResponse } from "next/server";
    import { createClient } from "@supabase/supabase-js";
    
    
    const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);
    
    const isAdminEmail = (email) => {
      if (!email) return false;
      return ADMIN_EMAILS.includes(email.trim().toLowerCase());
    };
    
    export async function POST(request) {
      try {
        const body = await request.json();
        const { submissionId, nextStatus, adminEmail } = body;
    
        if (!submissionId || !nextStatus || !adminEmail || !isAdminEmail(adminEmail)) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
    
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
        if (!supabaseUrl || !serviceRoleKey) {
          return NextResponse.json({ error: "Supabase configuration is missing." }, { status: 500 });
        }
    
        const adminClient = createClient(supabaseUrl, serviceRoleKey, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        });
    
        const { data: submissionData, error: lookupError } = await adminClient
          .from("plugin_submissions")
          .select("*")
          .eq("id", submissionId)
          .maybeSingle();
    
        if (lookupError || !submissionData) {
          return NextResponse.json({ error: "Submission was not found." }, { status: 404 });
        }
    
        const { error: updateError } = await adminClient
          .from("plugin_submissions")
          .update({ status: nextStatus })
          .eq("id", submissionId);
    
        if (updateError) {
          throw updateError;
        }
    
        if (nextStatus === "approved") {
          const { error: insertError } = await adminClient.from("plugins").insert({
            name: submissionData.title.trim(),
            author: submissionData.name.trim(),
            description: submissionData.description.trim(),
            repository: null,
            code: submissionData.code.trim(),
            published_at: new Date().toISOString().slice(0, 10),
            created_by: submissionData.user_id,
          });
    
          if (insertError) {
            throw insertError;
          }
        }
    
        return NextResponse.json({ ok: true });
      } catch (error) {
        console.error("Admin review update failed", error);
        return NextResponse.json(
          {
            error: "Admin review update failed",
            details: error?.message ?? error,
          },
          { status: 500 }
        );
      }
    }
    `
  },
  {
    name: "Analytics Sync",
    author: "Pulse Analytics",
    description: "Pushes interaction metrics and bot events to your analytics dashboards.",
    repository: "https://github.com/CODEX-SPACEX/CODEX-AI",
    publishedAt: "2026-02-08",
    sourceCode: `analytics.track("plugin_used", {
  plugin: "Analytics Sync",
  userId,
});`,
  },
  {
    name: "Automation Queue",
    author: "Flow Labs",
    description: "Manages delayed tasks, retries, and long-running bot workflows with ease.",
    repository: "https://github.com/CODEX-SPACEX/CODEX-AI",
    publishedAt: "2026-01-12",
    sourceCode: `await queue.add({
  type: "retry",
  payload,
});`,
  },
];
