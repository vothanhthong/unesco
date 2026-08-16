import { NextResponse } from "next/server";
import { getAuthenticatedContext } from "@/lib/auth/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const auth = await getAuthenticatedContext();
  if (!auth.supabase) return NextResponse.json({ error: "Authentication required" }, { status: auth.status });
  const admin = getSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Supabase server credentials are not configured" }, { status: 503 });
  const { data: reports, error: reportError } = await auth.supabase.from("scam_reports").select("id").eq("owner_id", auth.user.id);
  if (reportError) return NextResponse.json({ error: "Unable to load shared patterns" }, { status: 500 });
  const fingerprints = (reports ?? []).map((report) => `report-${report.id}`);
  if (fingerprints.length === 0) return NextResponse.json({ impact: { scenarios_shared: 0, votes_received: 0, lesson_additions_received: 0 } });
  const { data: clusters, error: clusterError } = await admin.from("scam_clusters").select("id,upvote_count").eq("is_verified", true).in("fingerprint", fingerprints);
  if (clusterError) return NextResponse.json({ error: "Unable to load shared patterns" }, { status: 500 });
  const ids = (clusters ?? []).map((cluster) => cluster.id);
  const { count: additions, error: additionError } = ids.length ? await admin.from("scenarios").select("id", { count: "exact", head: true }).in("community_cluster_id", ids) : { count: 0, error: null };
  if (additionError) return NextResponse.json({ error: "Unable to load lesson impact" }, { status: 500 });
  return NextResponse.json({ impact: { scenarios_shared: ids.length, votes_received: (clusters ?? []).reduce((total, cluster) => total + cluster.upvote_count, 0), lesson_additions_received: additions ?? 0 } });
}