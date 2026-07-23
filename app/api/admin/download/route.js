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
    const { submissionId, adminEmail, filePath } = body;

    if (!submissionId || !adminEmail || !isAdminEmail(adminEmail)) {
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
      .select("file_url")
      .eq("id", submissionId)
      .maybeSingle();

    if (lookupError || !submissionData?.file_url) {
      return NextResponse.json({ error: "Submission file was not found." }, { status: 404 });
    }

    const resolvedPath = filePath || submissionData.file_url;

    if (!resolvedPath) {
      return NextResponse.json({ error: "Submission file was not found." }, { status: 404 });
    }

    if (resolvedPath.startsWith("http://") || resolvedPath.startsWith("https://")) {
      return NextResponse.json({ url: resolvedPath });
    }

    const { data: signedData, error: signedError } = await adminClient.storage
      .from("plugin-files")
      .createSignedUrl(resolvedPath, 60 * 60);

    if (signedError) {
      throw signedError;
    }

    return NextResponse.json({ url: signedData?.signedUrl });
  } catch (error) {
    console.error("Signed download URL generation failed", error);
    return NextResponse.json(
      {
        error: "Could not prepare the download link.",
        details: error?.message ?? error,
      },
      { status: 500 }
    );
  }
}
