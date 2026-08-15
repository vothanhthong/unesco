import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedContext } from "@/lib/auth/server";
import { createSession } from "@/lib/store";
import { trainSessionCreateSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedContext();
  if (!auth.supabase) return NextResponse.json({ error: "Authentication required" }, { status: auth.status });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = trainSessionCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "A valid scenario is required" }, { status: 400 });
  }

  let familyMember: { id: string } | null = null;
  if (parsed.data.family_member_id) {
    const { data, error: familyError } = await auth.supabase
      .from("family_members")
      .select("id")
      .eq("id", parsed.data.family_member_id)
      .eq("owner_id", auth.user.id)
      .maybeSingle();

    if (familyError) {
      console.error("[TRAIN] Failed to verify family member", familyError);
      return NextResponse.json({ error: "Unable to verify family member" }, { status: 500 });
    }
    if (!data) return NextResponse.json({ error: "Family member not found" }, { status: 404 });
    familyMember = data;
  }

  try {
    const session = await createSession({
      facilitatorId: auth.user.id,
      familyMemberId: familyMember?.id,
      scenarioSlug: parsed.data.scenario_slug,
    });
    return NextResponse.json({ data: { session_id: session.session_id, status: session.status } }, { status: 201 });
  } catch (error) {
    console.error("[TRAIN] Failed to create practice session", error);
    return NextResponse.json({ error: "Unable to create practice session" }, { status: 500 });
  }
}
