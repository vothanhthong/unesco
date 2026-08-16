import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  const { data, error } = await supabase.rpc("get_top_contributors");
  if (error) return NextResponse.json({ error: "Unable to load top contributors" }, { status: 500 });
  return NextResponse.json({ contributors: data ?? [] });
}