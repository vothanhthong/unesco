import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = await getSupabaseServerClient();
  const admin = getSupabaseAdminClient();
  if (!supabase || !admin) return NextResponse.json({ error: "Supabase server credentials are not configured" }, { status: 503 });
  const [{ data: userData }, { data: clusters, error: clusterError }, { data: reports, error: reportError }] = await Promise.all([
    supabase.auth.getUser(),
    admin.from("scam_clusters").select("id,fingerprint,upvote_count,updated_at").eq("is_verified", true),
    admin.from("scam_reports").select("id,owner_id"),
  ]);
  if (clusterError || reportError) return NextResponse.json({ error: "Unable to load top contributors" }, { status: 500 });
  const ownerByFingerprint = new Map((reports ?? []).map((report) => [`report-${report.id}`, report.owner_id]));
  const ownedClusters = (clusters ?? []).flatMap((cluster) => { const owner = ownerByFingerprint.get(cluster.fingerprint); return owner ? [{ ...cluster, owner }] : []; });
  const clusterIds = ownedClusters.map((cluster) => cluster.id);
  const { data: lessons, error: lessonError } = clusterIds.length ? await admin.from("scenarios").select("community_cluster_id").in("community_cluster_id", clusterIds) : { data: [], error: null };
  if (lessonError) return NextResponse.json({ error: "Unable to load lesson usage" }, { status: 500 });
  const additions = (lessons ?? []).reduce((counts, lesson) => counts.set(lesson.community_cluster_id, (counts.get(lesson.community_cluster_id) ?? 0) + 1), new Map<string, number>());
  const stats = new Map<string, { scenarios: number; votes: number; additions: number; latest: string }>();
  for (const cluster of ownedClusters) {
    const stat = stats.get(cluster.owner) ?? { scenarios: 0, votes: 0, additions: 0, latest: cluster.updated_at };
    stat.scenarios += 1; stat.votes += cluster.upvote_count; stat.additions += additions.get(cluster.id) ?? 0;
    if (cluster.updated_at > stat.latest) stat.latest = cluster.updated_at;
    stats.set(cluster.owner, stat);
  }
  const ids = [...stats.keys()];
  const { data: profiles, error: profileError } = ids.length ? await admin.from("profiles").select("id,display_name").in("id", ids) : { data: [], error: null };
  if (profileError) return NextResponse.json({ error: "Unable to load contributor names" }, { status: 500 });
  const names = new Map((profiles ?? []).map((profile) => [profile.id, profile.display_name]));
  const contributors = [...stats.entries()].map(([userId, stat]) => ({ user_id: userId, display_name: names.get(userId)?.trim() || `Community Member ${userId.replaceAll("-", "").slice(-3)}`, verified_scenario_count: stat.scenarios, helpful_votes_received: stat.votes, lesson_additions_received: stat.additions, contributor_score: 5 * stat.scenarios + 2 * stat.votes + 3 * stat.additions, latest: stat.latest })).sort((left, right) => right.contributor_score - left.contributor_score || right.lesson_additions_received - left.lesson_additions_received || right.helpful_votes_received - left.helpful_votes_received || right.verified_scenario_count - left.verified_scenario_count || right.latest.localeCompare(left.latest)).slice(0, 5).map((contributor, index) => ({ ...contributor, rank: index + 1, is_current_user: contributor.user_id === userData.user?.id }));
  return NextResponse.json({ contributors });
}