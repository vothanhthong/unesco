import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedContext } from "@/lib/auth/server";
import { familyMemberIdSchema, familyMemberUpdateSchema } from "@/lib/validation";

interface RouteContext {
  params: Promise<{ memberId: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = await getAuthenticatedContext();
  if (!auth.supabase) return NextResponse.json({ error: "Authentication required" }, { status: auth.status });

  const { memberId } = await context.params;
  if (!familyMemberIdSchema.safeParse(memberId).success) {
    return NextResponse.json({ error: "Invalid family member id" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = familyMemberUpdateSchema.safeParse(body);
  if (!parsed.success || Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: "At least one valid field is required" }, { status: 400 });
  }

  const { data, error } = await auth.supabase
    .from("family_members")
    .update(parsed.data)
    .eq("id", memberId)
    .eq("owner_id", auth.user.id)
    .select("id,display_name,relationship,locale,notes,created_at,updated_at")
    .maybeSingle();

  if (error) {
    console.error("[Family] Failed to update family member", error);
    return NextResponse.json({ error: "Unable to update family member" }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: "Family member not found" }, { status: 404 });

  return NextResponse.json({ data });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const auth = await getAuthenticatedContext();
  if (!auth.supabase) return NextResponse.json({ error: "Authentication required" }, { status: auth.status });

  const { memberId } = await context.params;
  if (!familyMemberIdSchema.safeParse(memberId).success) {
    return NextResponse.json({ error: "Invalid family member id" }, { status: 400 });
  }

  const { data, error } = await auth.supabase
    .from("family_members")
    .delete()
    .eq("id", memberId)
    .eq("owner_id", auth.user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("[Family] Failed to delete family member", error);
    return NextResponse.json({ error: "Unable to delete family member" }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: "Family member not found" }, { status: 404 });

  return new NextResponse(null, { status: 204 });
}
