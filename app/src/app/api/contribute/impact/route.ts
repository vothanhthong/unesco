import { NextResponse } from "next/server";
import { getAuthenticatedContext } from "@/lib/auth/server";

export async function GET() {
  const auth = await getAuthenticatedContext();
  if (!auth.supabase) return NextResponse.json({ error: "Authentication required" }, { status: auth.status });
  const { data, error } = await auth.supabase.rpc("get_my_community_impact");
  if (error) return NextResponse.json({ error: "Unable to load community impact" }, { status: 500 });
  return NextResponse.json({ impact: data?.[0] ?? { scenarios_shared: 0, votes_received: 0, lesson_additions_received: 0 } });
}