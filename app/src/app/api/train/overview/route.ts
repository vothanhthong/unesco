import { NextResponse } from "next/server";
import { getAuthenticatedContext } from "@/lib/auth/server";

export async function GET() {
  const auth = await getAuthenticatedContext();
  if (!auth.supabase) return NextResponse.json({ error: "Authentication required" }, { status: auth.status });

  const [familyResult, scenarioResult, sessionResult] = await Promise.all([
    auth.supabase
      .from("family_members")
      .select("id,display_name,relationship,locale,notes,created_at,updated_at")
      .eq("owner_id", auth.user.id)
      .order("created_at", { ascending: true }),
      auth.supabase
        .from("scenarios")
        .select("id,slug,category,title,sender,content,link_hint,locale,is_verified,community_cluster_id,title_en,content_en")
        .or(`is_published.eq.true,created_by.eq.${auth.user.id}`)
      .order("category", { ascending: true })
      .order("title", { ascending: true }),
    auth.supabase
      .from("practice_sessions")
      .select("id,pairing_code,status,family_member_id,scenario_id,created_at,completed_at,scam")
      .eq("facilitator_id", auth.user.id)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  if (familyResult.error || scenarioResult.error || sessionResult.error) {
    console.error("[TRAIN] Failed to load overview", familyResult.error ?? scenarioResult.error ?? sessionResult.error);
    return NextResponse.json({ error: "Unable to load TRAIN overview" }, { status: 500 });
  }

  const sessions = sessionResult.data ?? [];
  const sessionIds = sessions.map((session) => session.id);
  const { data: results, error: resultsError } = sessionIds.length
    ? await auth.supabase
        .from("practice_results")
        .select("session_id,result,warning_signs,debrief_notes,created_at")
        .in("session_id", sessionIds)
    : { data: [], error: null };

  if (resultsError) {
    console.error("[TRAIN] Failed to load practice results", resultsError);
    return NextResponse.json({ error: "Unable to load practice history" }, { status: 500 });
  }

  const resultsBySession = new Map((results ?? []).map((result) => [result.session_id, result]));
  const scenariosById = new Map((scenarioResult.data ?? []).map((scenario) => [scenario.id, scenario]));
  const familyById = new Map((familyResult.data ?? []).map((member) => [member.id, member]));

  return NextResponse.json({
    familyMembers: familyResult.data ?? [],
    scenarios: scenarioResult.data ?? [],
    sessions: sessions.map((session) => ({
      ...session,
      familyMember: session.family_member_id ? familyById.get(session.family_member_id) ?? null : null,
      scenario: session.scenario_id ? scenariosById.get(session.scenario_id) ?? null : null,
      result: resultsBySession.get(session.id) ?? null,
    })),
  });
}
