import { NextRequest, NextResponse } from "next/server";
import { pairSession } from "@/lib/store";
import { pairSessionSchema } from "@/lib/validation";
import { getAuthenticatedContext } from "@/lib/auth/server";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = pairSessionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "A valid four-digit session_id is required" }, { status: 400 });
  }

  try {
    let facilitatorId: string | undefined;
    if (parsed.data.family_member_id || parsed.data.scenario_slug) {
      const auth = await getAuthenticatedContext();
      if (!auth.supabase) return NextResponse.json({ error: "Authentication required" }, { status: auth.status });
      if (parsed.data.family_member_id) {
        const { data: familyMember, error: familyError } = await auth.supabase
          .from("family_members")
          .select("id")
          .eq("id", parsed.data.family_member_id)
          .eq("owner_id", auth.user.id)
          .maybeSingle();
        if (familyError) throw new Error(`Failed to verify family member: ${familyError.message}`);
        if (!familyMember) return NextResponse.json({ error: "Family member not found" }, { status: 404 });
      }
      facilitatorId = auth.user.id;
    }

    const success = await pairSession(parsed.data.session_id, {
      facilitatorId,
      familyMemberId: parsed.data.family_member_id,
      scenarioSlug: parsed.data.scenario_slug,
    });

    if (!success) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, session_id: parsed.data.session_id });
  } catch (error) {
    console.error("[Session] Failed to pair session", error);
    return NextResponse.json({ error: "Unable to pair the session" }, { status: 500 });
  }
}
