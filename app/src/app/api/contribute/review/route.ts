import { NextResponse } from "next/server";
import { getAuthenticatedContext } from "@/lib/auth/server";

interface DraftSnapshot {
  title?: string;
  summary?: string;
  category?: string;
}

export async function GET() {
  const auth = await getAuthenticatedContext();
  if (!auth.supabase) return NextResponse.json({ error: "Authentication required" }, { status: auth.status });

  const { data: profile, error: profileError } = await auth.supabase
    .from("profiles")
    .select("role")
    .eq("id", auth.user.id)
    .maybeSingle();

  if (profileError) {
    console.error("[REVIEW] Failed to load reviewer profile", profileError);
    return NextResponse.json({ error: "Unable to load review access" }, { status: 500 });
  }

  const authorized = profile?.role === "reviewer" || profile?.role === "admin";
  if (!authorized) return NextResponse.json({ authorized: false, drafts: [] });

  const { data, error } = await auth.supabase
    .from("scenario_drafts")
    .select("id,status,source_snapshot,created_at,updated_at")
    .in("status", ["draft", "in_review"])
    .order("updated_at", { ascending: false })
    .limit(25);

  if (error) {
    console.error("[REVIEW] Failed to load review queue", error);
    return NextResponse.json({ error: "Unable to load review queue" }, { status: 500 });
  }

  return NextResponse.json({
    authorized: true,
    drafts: (data ?? []).map((draft) => ({
      id: draft.id,
      status: draft.status,
      created_at: draft.created_at,
      updated_at: draft.updated_at,
      snapshot: (draft.source_snapshot ?? {}) as DraftSnapshot,
    })),
  });
}
