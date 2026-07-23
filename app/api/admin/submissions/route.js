import { NextResponse } from "next/server";
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
