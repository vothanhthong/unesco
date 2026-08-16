import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  const params = new URL(request.url).searchParams;
  const sort = params.get("sort") === "trending" ? "trending" : "latest";
  const locale = params.get("locale") === "en" ? "en" : "vi";
  const { data: clusters, error } = await supabase
    .from("scam_clusters")
    .select("id,fingerprint,title,summary,title_en,summary_en,category,locale,report_count,contributor_count,upvote_count,is_trending,updated_at")
    .eq("is_verified", true)
    .not("title", "is", null)
    .not("summary", "is", null)
    .order("updated_at", { ascending: false });
  if (error) {
    console.error("[CONTRIBUTE] Failed to load community trends", { code: error.code, message: error.message, details: error.details, hint: error.hint });
    return NextResponse.json({ error: "Unable to load community patterns" }, { status: 500 });
  }
  const ids = (clusters ?? []).map((cluster) => cluster.id);
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  const [{ data: ownVotes }, { data: ownLessons }, { data: ownReports }] = userId && ids.length
    ? await Promise.all([
        supabase.from("scam_cluster_votes").select("cluster_id").eq("voter_id", userId).in("cluster_id", ids),
        supabase.from("scenarios").select("community_cluster_id").eq("created_by", userId).in("community_cluster_id", ids),
        supabase.from("scam_reports").select("id").eq("owner_id", userId),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }];
  const voted = new Set((ownVotes ?? []).map((vote) => vote.cluster_id));
  const saved = new Set((ownLessons ?? []).map((lesson) => lesson.community_cluster_id));
  const shared = new Set((ownReports ?? []).map((report) => `report-${report.id}`));
  const admin = getSupabaseAdminClient();
  let additions = new Map<string, number>();
  let recentVotes = new Map<string, number>();
  if (admin && ids.length) {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const [{ data: lessons, error: lessonError }, { data: votes, error: voteError }] = await Promise.all([
      admin.from("scenarios").select("community_cluster_id").in("community_cluster_id", ids),
      admin.from("scam_cluster_votes").select("cluster_id").in("cluster_id", ids).gte("created_at", since),
    ]);
    if (lessonError || voteError) {
      const failure = lessonError ?? voteError;
      console.error("[CONTRIBUTE] Failed to aggregate community statistics", { code: failure?.code, message: failure?.message, details: failure?.details, hint: failure?.hint });
      return NextResponse.json({ error: "Unable to aggregate community patterns" }, { status: 500 });
    }
    additions = (lessons ?? []).reduce((counts, lesson) => counts.set(lesson.community_cluster_id, (counts.get(lesson.community_cluster_id) ?? 0) + 1), new Map<string, number>());
    recentVotes = (votes ?? []).reduce((counts, vote) => counts.set(vote.cluster_id, (counts.get(vote.cluster_id) ?? 0) + 1), new Map<string, number>());
  }
  const response = (clusters ?? []).map((cluster) => {
    const lessonAdditionCount = additions.get(cluster.id) ?? 0;
    const trendingScore = 3 * (recentVotes.get(cluster.id) ?? 0) + 2 * lessonAdditionCount + cluster.report_count;
    return { ...cluster, title: locale === "en" && cluster.title_en ? cluster.title_en : cluster.title, summary: locale === "en" && cluster.summary_en ? cluster.summary_en : cluster.summary, lesson_addition_count: lessonAdditionCount, is_trending: trendingScore > 0, has_voted: voted.has(cluster.id), has_added_to_lesson: saved.has(cluster.id), is_shared_by_current_user: shared.has(cluster.fingerprint), trending_score: trendingScore };
  }).sort((left, right) => sort === "trending" ? right.trending_score - left.trending_score || new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime() : new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime());
  return NextResponse.json({ clusters: response });
}
