import { NextResponse } from "next/server";
import { getAuthenticatedContext } from "@/lib/auth/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { scamReportSchema } from "@/lib/validation";

const MAX_ATTACHMENTS = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "audio/mpeg",
  "audio/mp4",
  "audio/wav",
  "audio/webm",
  "image/jpeg",
  "image/png",
  "application/pdf",
  "text/plain",
]);
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".pdf", ".txt", ".mp3", ".mp4", ".wav", ".webm"]);

function isLikelyPii(value: string): boolean {
  return [
    /[\w.+-]+@[\w-]+\.[\w.-]+/i,
    /(?:\+?84|0)(?:3|5|7|8|9)\d{8}\b/,
    /\b\d{9,16}\b/,
  ].some((pattern) => pattern.test(value));
}

function safeFileName(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-100) || "evidence";
}

function hasAllowedExtension(value: string): boolean {
  const extension = value.slice(value.lastIndexOf(".")).toLowerCase();
  return ALLOWED_EXTENSIONS.has(extension);
}

function parseFormValue(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === "string" ? value : "";
}

export async function GET() {
  const auth = await getAuthenticatedContext();
  if (!auth.supabase) return NextResponse.json({ error: "Authentication required" }, { status: auth.status });

  const { data, error } = await auth.supabase
    .from("scam_reports")
    .select("id,source_type,description,locale,context,status,pii_status,created_at,updated_at,report_attachments(id,file_name,mime_type,byte_size)")
    .eq("owner_id", auth.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[CONTRIBUTE] Failed to load reports", error);
    return NextResponse.json({ error: "Unable to load reports" }, { status: 500 });
  }

  return NextResponse.json({ reports: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await getAuthenticatedContext();
  if (!auth.supabase) return NextResponse.json({ error: "Authentication required" }, { status: auth.status });

  const form = await request.formData();
  const parsed = scamReportSchema.safeParse({
    source_type: parseFormValue(form, "source_type"),
    description: parseFormValue(form, "description"),
    locale: parseFormValue(form, "locale") || "vi-VN",
    context: parseFormValue(form, "context") || undefined,
    privacy_consent: parseFormValue(form, "privacy_consent") === "true",
    redaction_confirmed: parseFormValue(form, "redaction_confirmed") === "true",
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Please complete the required report fields", issues: parsed.error.flatten() }, { status: 400 });
  }

  const files = form.getAll("attachments").filter((value): value is File => value instanceof File && value.size > 0);
  if (files.length > MAX_ATTACHMENTS) {
    return NextResponse.json({ error: `You can attach up to ${MAX_ATTACHMENTS} files` }, { status: 400 });
  }

  const invalidFile = files.find((file) => file.size > MAX_FILE_SIZE || !ALLOWED_MIME_TYPES.has(file.type) || !hasAllowedExtension(file.name));
  if (invalidFile) {
    return NextResponse.json({ error: "Attachments must use a supported file type and stay under 10 MB each" }, { status: 400 });
  }

  const piiStatus = isLikelyPii(`${parsed.data.description}\n${parsed.data.context ?? ""}`) ? "needs_redaction" : "unknown";
  const { data: report, error: reportError } = await auth.supabase
    .from("scam_reports")
    .insert({
      owner_id: auth.user.id,
      source_type: parsed.data.source_type,
      description: parsed.data.description,
      locale: parsed.data.locale,
      context: parsed.data.context ?? null,
      pii_status: piiStatus,
    })
    .select("id,status,pii_status,created_at")
    .single();

  if (reportError || !report) {
    console.error("[CONTRIBUTE] Failed to create report", reportError);
    return NextResponse.json({ error: "Unable to submit the report" }, { status: 500 });
  }

  const uploadedPaths: string[] = [];
  for (const file of files) {
    const storagePath = `${auth.user.id}/${report.id}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
    const upload = await auth.supabase.storage.from("scam-evidence").upload(storagePath, Buffer.from(await file.arrayBuffer()), {
      contentType: file.type,
      upsert: false,
    });

    if (upload.error) {
      await auth.supabase.storage.from("scam-evidence").remove(uploadedPaths);
      await auth.supabase.from("scam_reports").delete().eq("id", report.id).eq("owner_id", auth.user.id);
      console.error("[CONTRIBUTE] Failed to upload evidence", upload.error);
      return NextResponse.json({ error: "Unable to store private evidence" }, { status: 500 });
    }

    uploadedPaths.push(storagePath);
    const { error: attachmentError } = await auth.supabase.from("report_attachments").insert({
      report_id: report.id,
      storage_path: storagePath,
      file_name: file.name,
      mime_type: file.type,
      byte_size: file.size,
    });

    if (attachmentError) {
      await auth.supabase.storage.from("scam-evidence").remove(uploadedPaths);
      await auth.supabase.from("scam_reports").delete().eq("id", report.id).eq("owner_id", auth.user.id);
      console.error("[CONTRIBUTE] Failed to record evidence", attachmentError);
      return NextResponse.json({ error: "Unable to record private evidence" }, { status: 500 });
    }
  }

  const description = parsed.data.description.trim();
  const title = description.split(/[.!?\n]/, 1)[0].trim().slice(0, 160) || "Community report";
  const isEnglish = parsed.data.locale.toLowerCase().startsWith("en");
  const publisher = getSupabaseAdminClient();
  if (!publisher) {
    await auth.supabase.storage.from("scam-evidence").remove(uploadedPaths);
    await auth.supabase.from("scam_reports").delete().eq("id", report.id).eq("owner_id", auth.user.id);
    return NextResponse.json({ error: "Community publishing is not configured" }, { status: 503 });
  }

  const { error: clusterError } = await publisher.from("scam_clusters").insert({
    fingerprint: `report-${report.id}`,
    category: parsed.data.source_type,
    locale: parsed.data.locale,
    title,
    summary: description,
    title_en: isEnglish ? title : null,
    summary_en: isEnglish ? description : null,
    report_count: 1,
    contributor_count: 1,
    reviewer_count: 0,
    upvote_count: 0,
    is_verified: true,
    is_trending: false,
  });

  if (clusterError) {
    await auth.supabase.storage.from("scam-evidence").remove(uploadedPaths);
    await auth.supabase.from("scam_reports").delete().eq("id", report.id).eq("owner_id", auth.user.id);
    console.error("[CONTRIBUTE] Failed to publish community report", clusterError);
    return NextResponse.json({ error: "Unable to publish the community report" }, { status: 500 });
  }

  return NextResponse.json({ report }, { status: 201 });
}
