import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedContext } from "@/lib/auth/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { closeSessionSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedContext();
  if (!auth.supabase) return NextResponse.json({ error: "Authentication required" }, { status: auth.status });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = closeSessionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "A valid session_id is required" }, { status: 400 });

  const db = getSupabaseAdminClient() ?? auth.supabase;
  const { data: session, error: lookupError } = await db
    .from("practice_sessions")
    .select("pairing_code,status,facilitator_id")
    .eq("pairing_code", parsed.data.session_id)
    .maybeSingle();

  if (lookupError) {
    console.error("[Session] Failed to find practice session for closing", lookupError);
    return NextResponse.json({ error: "Unable to find the session" }, { status: 500 });
  }
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
  if (session.facilitator_id && session.facilitator_id !== auth.user.id) {
    return NextResponse.json({ error: "You cannot close this session" }, { status: 403 });
  }
  if (session.status === "closed") {
    return NextResponse.json({ success: true, session_id: session.pairing_code, status: session.status });
  }

  const { data, error } = await db
    .from("practice_sessions")
    .update({ status: "closed", completed_at: new Date().toISOString() })
    .eq("pairing_code", parsed.data.session_id)
    .select("pairing_code,status")
    .maybeSingle();

  if (error) {
    console.error("[Session] Failed to close practice session", error);
    return NextResponse.json({ error: "Unable to close the session" }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: "Session could not be closed" }, { status: 409 });

  return NextResponse.json({ success: true, session_id: data.pairing_code, status: data.status });
}
