import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedContext } from "@/lib/auth/server";

interface RouteContext { params: Promise<{ clusterId: string }> }

export async function DELETE(_request: Request, { params }: RouteContext) {
  const auth = await getAuthenticatedContext();
  if (!auth.supabase) return NextResponse.json({ error: "Authentication required" }, { status: auth.status });
  const { clusterId } = await params;
  const parsed = z.string().uuid().safeParse(clusterId);
  if (!parsed.success) return NextResponse.json({ error: "Invalid community scenario" }, { status: 400 });
  const { error } = await auth.supabase.from("scam_cluster_lesson_additions").delete().eq("cluster_id", parsed.data).eq("user_id", auth.user.id);
  if (error) return NextResponse.json({ error: "Unable to remove lesson" }, { status: 500 });
  return NextResponse.json({ saved: false });
}