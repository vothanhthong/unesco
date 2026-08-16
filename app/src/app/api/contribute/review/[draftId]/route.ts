import { NextResponse } from "next/server";
import { getAuthenticatedContext } from "@/lib/auth/server";
import { reviewActionSchema } from "@/lib/validation";

interface DraftSnapshot {
  title?: string;
  summary?: string;
  category?: string;
  locale?: string;
  context?: string | null;
}

interface RouteContext {
  params: Promise<{ draftId: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  const auth = await getAuthenticatedContext();
  if (!auth.supabase) return NextResponse.json({ error: "Authentication required" }, { status: auth.status });

  const { data: profile, error: profileError } = await auth.supabase
    .from("profiles")
    .select("role")
    .eq("id", auth.user.id)
    .maybeSingle();

  if (profileError) return NextResponse.json({ error: "Unable to load review access" }, { status: 500 });
  if (profile?.role !== "reviewer" && profile?.role !== "admin") {
    return NextResponse.json({ error: "Reviewer access required" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = reviewActionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "A valid review action is required" }, { status: 400 });

  const { draftId } = await context.params;
  const { data: draft, error: draftError } = await auth.supabase
    .from("scenario_drafts")
    .select("id,report_id,status,source_snapshot")
    .eq("id", draftId)
    .in("status", ["draft", "in_review"])
    .maybeSingle();

  if (draftError) return NextResponse.json({ error: "Unable to load the review draft" }, { status: 500 });
  if (!draft) return NextResponse.json({ error: "Review draft not found" }, { status: 404 });

  const snapshot = (draft.source_snapshot ?? {}) as DraftSnapshot;
  const reviewAction = parsed.data.action === "approve" ? "approve" : "outdated";

  if (parsed.data.action === "reject") {
    const { error: draftUpdateError } = await auth.supabase
      .from("scenario_drafts")
      .update({ status: "rejected", updated_at: new Date().toISOString() })
      .eq("id", draft.id);
    if (draftUpdateError) return NextResponse.json({ error: "Unable to reject the draft" }, { status: 500 });

    await auth.supabase.from("scam_reports").update({ status: "rejected", updated_at: new Date().toISOString() }).eq("id", draft.report_id);
    await auth.supabase.from("scenario_reviews").insert({ draft_id: draft.id, reviewer_id: auth.user.id, action: reviewAction, reason: parsed.data.reason ?? null });
    return NextResponse.json({ status: "rejected" });
  }

  const title = snapshot.title?.trim();
  const summary = snapshot.summary?.trim();
  if (!title || !summary) return NextResponse.json({ error: "The draft is missing report content" }, { status: 422 });

  const fingerprint = `report-${draft.report_id}`;
  const { data: existingCluster, error: existingClusterError } = await auth.supabase
    .from("scam_clusters")
    .select("id")
    .eq("fingerprint", fingerprint)
    .maybeSingle();
  if (existingClusterError) return NextResponse.json({ error: "Unable to check the community pattern" }, { status: 500 });

  const locale = snapshot.locale?.toLowerCase().startsWith("en") ? "en-US" : "vi-VN";
  const cluster = existingCluster ?? (await auth.supabase.from("scam_clusters").insert({
    fingerprint,
    category: snapshot.category ?? "message",
    locale,
    title,
    summary,
    title_en: locale === "en-US" ? title : null,
    summary_en: locale === "en-US" ? summary : null,
    report_count: 1,
    contributor_count: 1,
    reviewer_count: 1,
    is_verified: true,
    is_trending: false,
  }).select("id").single()).data;

  if (!cluster) return NextResponse.json({ error: "Unable to publish the community pattern" }, { status: 500 });

  const now = new Date().toISOString();
  const { error: draftUpdateError } = await auth.supabase
    .from("scenario_drafts")
    .update({ status: "approved", generated_content: { cluster_id: cluster.id }, updated_at: now })
    .eq("id", draft.id);
  if (draftUpdateError) return NextResponse.json({ error: "Unable to complete the review" }, { status: 500 });

  await auth.supabase.from("scam_reports").update({ status: "approved", updated_at: now }).eq("id", draft.report_id);
  await auth.supabase.from("scenario_reviews").insert({ draft_id: draft.id, reviewer_id: auth.user.id, action: reviewAction, reason: parsed.data.reason ?? null });

  return NextResponse.json({ status: "approved", cluster_id: cluster.id });
}
