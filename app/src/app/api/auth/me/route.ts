import { NextResponse } from "next/server";
import { getAuthenticatedContext } from "@/lib/auth/server";

export async function GET() {
  const auth = await getAuthenticatedContext();
  if (!auth.supabase) return NextResponse.json({ error: "Authentication required" }, { status: auth.status });

  const { data: profile } = await auth.supabase
    .from("profiles")
    .select("role,display_name,locale")
    .eq("id", auth.user.id)
    .maybeSingle();

  return NextResponse.json({
    user: {
      id: auth.user.id,
      email: auth.user.email ?? null,
      role: profile?.role ?? "facilitator",
      display_name: profile?.display_name ?? null,
      locale: profile?.locale ?? "vi-VN",
    },
  });
}
