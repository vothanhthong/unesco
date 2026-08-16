import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedContext } from "@/lib/auth/server";

interface RouteContext {
  params: Promise<{ clusterId: string }>;
}

export async function POST(_request: Request, { params }: RouteContext) {
  const auth = await getAuthenticatedContext();
  if (!auth.supabase) return NextResponse.json({ error: "Authentication required" }, { status: auth.status });

  const { clusterId } = await params;
  const parsedId = z.string().uuid().safeParse(clusterId);
  if (!parsedId.success) return NextResponse.json({ error: "Invalid community scenario" }, { status: 400 });

  const { data: cluster, error: clusterError } = await auth.supabase
    .from("scam_clusters")
    .select("id,is_verified")
    .eq("id", parsedId.data)
    .eq("is_verified", true)
    .maybeSingle();

  if (clusterError || !cluster) return NextResponse.json({ error: "Community scenario not found" }, { status: 404 });

  const { data: existing, error: existingError } = await auth.supabase
    .from("scam_cluster_votes")
    .select("id")
    .eq("cluster_id", cluster.id)
    .eq("voter_id", auth.user.id)
    .maybeSingle();
  if (existingError) return NextResponse.json({ error: "Unable to check helpful vote" }, { status: 500 });
  const { error } = existing
    ? await auth.supabase.from("scam_cluster_votes").delete().eq("id", existing.id)
    : await auth.supabase.from("scam_cluster_votes").insert({ cluster_id: cluster.id, voter_id: auth.user.id });
  if (error) return NextResponse.json({ error: "Unable to update helpful vote" }, { status: 500 });
  return NextResponse.json({ voted: !existing });
}
