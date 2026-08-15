import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  const searchParams = new URL(request.url).searchParams;
  const sort = searchParams.get("sort") === "trending" ? "trending" : "latest";
  const requestedLocale = searchParams.get("locale") === "en" ? "en" : "vi";

  const { data: userData } = await supabase.auth.getUser();
  const { data: clusters, error } = await supabase
    .from("scam_clusters")
    .select("id,title,summary,title_en,summary_en,category,locale,report_count,contributor_count,upvote_count,is_trending,updated_at")
    .eq("is_verified", true)
    .not("title", "is", null)
    .not("summary", "is", null)
    .order(sort === "trending" ? "is_trending" : "updated_at", { ascending: false })
    .order(sort === "trending" ? "upvote_count" : "updated_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("[CONTRIBUTE] Failed to load community trends", error);
    return NextResponse.json({ error: "Unable to load community trends" }, { status: 500 });
  }

  const clusterIds = (clusters ?? []).map((cluster) => cluster.id);
  const { data: votes, error: voteError } = userData.user && clusterIds.length
    ? await supabase.from("scam_cluster_votes").select("cluster_id").eq("voter_id", userData.user.id).in("cluster_id", clusterIds)
    : { data: [], error: null };

  if (voteError) {
    console.error("[CONTRIBUTE] Failed to load community votes", voteError);
    return NextResponse.json({ error: "Unable to load community votes" }, { status: 500 });
  }

  const votedIds = new Set((votes ?? []).map((vote) => vote.cluster_id));
  const { data: savedLessons, error: savedLessonsError } = userData.user && clusterIds.length
    ? await supabase
        .from("scenarios")
        .select("community_cluster_id")
        .eq("created_by", userData.user.id)
        .in("community_cluster_id", clusterIds)
    : { data: [], error: null };

  if (savedLessonsError) {
    console.error("[CONTRIBUTE] Failed to load saved community lessons", savedLessonsError);
    return NextResponse.json({ error: "Unable to load saved community lessons" }, { status: 500 });
  }

  const savedClusterIds = new Set((savedLessons ?? []).map((lesson) => lesson.community_cluster_id));
  return NextResponse.json({
    clusters: (clusters ?? []).map((cluster) => ({
      ...cluster,
      title: requestedLocale === "en" && cluster.title_en ? cluster.title_en : cluster.title,
      summary: requestedLocale === "en" && cluster.summary_en ? cluster.summary_en : cluster.summary,
      has_voted: votedIds.has(cluster.id),
      is_saved: savedClusterIds.has(cluster.id),
    })),
  });
}
