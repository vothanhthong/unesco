import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedContext } from "@/lib/auth/server";
import { familyMemberCreateSchema } from "@/lib/validation";

export async function GET() {
  const auth = await getAuthenticatedContext();
  if (!auth.supabase) return NextResponse.json({ error: "Authentication required" }, { status: auth.status });

  const { data, error } = await auth.supabase
    .from("family_members")
    .select("id,display_name,relationship,locale,notes,created_at,updated_at")
    .eq("owner_id", auth.user.id)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[Family] Failed to list family members", error);
    return NextResponse.json({ error: "Unable to load family members" }, { status: 500 });
  }

  return NextResponse.json({ data: data ?? [] });
}

export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedContext();
  if (!auth.supabase) return NextResponse.json({ error: "Authentication required" }, { status: auth.status });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = familyMemberCreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "A valid family member name is required" }, { status: 400 });

  const { data, error } = await auth.supabase
    .from("family_members")
    .insert({ ...parsed.data, owner_id: auth.user.id })
    .select("id,display_name,relationship,locale,notes,created_at,updated_at")
    .single();

  if (error) {
    console.error("[Family] Failed to create family member", error);
    return NextResponse.json({ error: "Unable to create family member" }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
