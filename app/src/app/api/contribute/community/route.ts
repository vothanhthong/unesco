import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  const searchParams = new URL(request.url).searchParams;
  const sort = searchParams.get("sort") === "trending" ? "trending" : "latest";
  const locale = searchParams.get("locale") === "en" ? "en" : "vi";
  const { data: clusters, error } = await supabase.rpc("get_community_clusters", { p_sort: sort, p_locale: locale });

  if (error) {
    console.error("[CONTRIBUTE] Failed to load community trends", error);
    return NextResponse.json({ error: "Unable to load community trends" }, { status: 500 });
  }

  return NextResponse.json({ clusters: clusters ?? [] });
}
