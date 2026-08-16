import { NextResponse } from "next/server";
import { getAuthenticatedContext } from "@/lib/auth/server";
import { communityLessonCreateSchema } from "@/lib/validation";

const scenarioSelect = "id,slug,category,title,sender,content,link_hint,locale,is_verified,is_published,community_cluster_id,title_en,content_en";

export async function POST(request: Request) {
  const auth = await getAuthenticatedContext();
  if (!auth.supabase) return NextResponse.json({ error: "Authentication required" }, { status: auth.status });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = communityLessonCreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "A valid community report is required" }, { status: 400 });

  const { cluster_id: clusterId, locale } = parsed.data;
  const { data: cluster, error: clusterError } = await auth.supabase
    .from("scam_clusters")
    .select("id,category,title,summary,title_en,summary_en,is_verified")
    .eq("id", clusterId)
    .eq("is_verified", true)
    .maybeSingle();

  if (clusterError) {
    console.error("[TRAIN] Failed to load community lesson source", clusterError);
    return NextResponse.json({ error: "Unable to load community report" }, { status: 500 });
  }
  if (!cluster) return NextResponse.json({ error: "Community report not found" }, { status: 404 });

  const { data: existing, error: existingError } = await auth.supabase
    .from("scenarios")
    .select(scenarioSelect)
    .eq("created_by", auth.user.id)
    .eq("community_cluster_id", cluster.id)
    .maybeSingle();

  if (existingError) {
    console.error("[TRAIN] Failed to check saved community lesson", existingError);
    return NextResponse.json({ error: "Unable to check saved lesson" }, { status: 500 });
  }
  if (existing) return NextResponse.json({ data: existing, saved: true });

  const isEnglish = locale === "en";
  const { data: scenario, error: scenarioError } = await auth.supabase
    .from("scenarios")
    .insert({
      slug: `community-${cluster.id}-${auth.user.id}`,
      category: cluster.category,
      title: isEnglish && cluster.title_en ? cluster.title_en : cluster.title,
      sender: isEnglish ? "COMMUNITY REPORT" : "BÁO CÁO CỘNG ĐỒNG",
      content: isEnglish && cluster.summary_en ? cluster.summary_en : cluster.summary,
      title_en: cluster.title_en,
      content_en: cluster.summary_en,
      locale: isEnglish ? "en-US" : "vi-VN",
      is_verified: true,
      is_published: false,
      created_by: auth.user.id,
      community_cluster_id: cluster.id,
    })
    .select(scenarioSelect)
    .single();

  if (scenarioError || !scenario) {
    console.error("[TRAIN] Failed to save community lesson", scenarioError);
    return NextResponse.json({ error: "Unable to save community lesson" }, { status: 500 });
  }

  return NextResponse.json({ data: scenario, saved: true }, { status: 201 });
}
