import { randomInt } from "node:crypto";
import type { ScamPayloadInput } from "@/lib/validation";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { buildDebrief } from "@/lib/train/debrief";

export interface ScamPayload {
  type: string;
  sender: string;
  content: string;
}

export interface Session {
  session_id: string;
  paired: boolean;
  status: "waiting" | "paired" | "triggered" | "passed" | "failed" | "closed";
  scam?: ScamPayload;
  pushSubscription?: PushSubscriptionJSON;
  family_member_id?: string;
  scenario_slug?: string;
  created_at: number;
}

export interface CreateSessionOptions {
  facilitatorId?: string;
  familyMemberId?: string;
  scenarioSlug?: string;
}

export interface PairSessionOptions {
  facilitatorId?: string;
  familyMemberId?: string;
  scenarioSlug?: string;
}

interface SessionRow {
  pairing_code: string;
  status: Session["status"];
  scam: ScamPayload | null;
  push_subscription: PushSubscriptionJSON | null;
  created_at: string;
}

const localSessions = new Map<string, Session>();

function createPairingCode(): string {
  return String(randomInt(1000, 10_000));
}

function mapSession(row: SessionRow): Session {
  return {
    session_id: row.pairing_code,
    paired: row.status !== "waiting",
    status: row.status,
    ...(row.scam ? { scam: row.scam } : {}),
    ...(row.push_subscription ? { pushSubscription: row.push_subscription } : {}),
    created_at: new Date(row.created_at).getTime(),
  };
}

function mapLocalSession(session: Session): Session {
  return {
    ...session,
    ...(session.scam ? { scam: { ...session.scam } } : {}),
    ...(session.pushSubscription ? { pushSubscription: { ...session.pushSubscription } } : {}),
  };
}

export async function createSession(options: CreateSessionOptions = {}): Promise<Session> {
  const db = getSupabaseAdminClient();

  if (!db) {
    if (options.facilitatorId) {
      throw new Error("Persistent session storage is unavailable");
    }
    let code = createPairingCode();
    while (localSessions.has(code)) code = createPairingCode();

    const session: Session = {
      session_id: code,
      paired: false,
      status: "waiting",
      ...(options.familyMemberId ? { family_member_id: options.familyMemberId } : {}),
      ...(options.scenarioSlug ? { scenario_slug: options.scenarioSlug } : {}),
      created_at: Date.now(),
    };
    localSessions.set(code, session);
    return mapLocalSession(session);
  }

  let scenarioId: string | null = null;
  if (options.scenarioSlug) {
    let scenarioQuery = db
      .from("scenarios")
      .select("id")
      .eq("slug", options.scenarioSlug);
    scenarioQuery = options.facilitatorId
      ? scenarioQuery.or(`is_published.eq.true,created_by.eq.${options.facilitatorId}`)
      : scenarioQuery.eq("is_published", true);
    const { data, error } = await scenarioQuery.maybeSingle();
    if (error) throw new Error(`Failed to find scenario: ${error.message}`);
    if (!data) throw new Error("Scenario not found");
    scenarioId = data.id as string;
  }

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const { data, error } = await db
      .from("practice_sessions")
      .insert({
        pairing_code: createPairingCode(),
        facilitator_id: options.facilitatorId ?? null,
        family_member_id: options.familyMemberId ?? null,
        scenario_id: scenarioId,
      })
      .select("pairing_code,status,scam,push_subscription,created_at")
      .single();

    if (!error && data) return mapSession(data as SessionRow);
    if (error?.code !== "23505") {
      throw new Error(`Failed to create practice session: ${error?.message ?? "unknown error"}`);
    }
  }

  throw new Error("Failed to allocate a unique pairing code");
}

export async function getSession(sessionId: string): Promise<Session | undefined> {
  const db = getSupabaseAdminClient();

  if (!db) {
    const session = localSessions.get(sessionId);
    return session ? mapLocalSession(session) : undefined;
  }

  const { data, error } = await db
    .from("practice_sessions")
    .select("pairing_code,status,scam,push_subscription,created_at")
    .eq("pairing_code", sessionId)
    .maybeSingle();

  if (error) throw new Error(`Failed to read practice session: ${error.message}`);
  return data ? mapSession(data as SessionRow) : undefined;
}

export async function pairSession(sessionId: string, options: PairSessionOptions = {}): Promise<boolean> {
  const db = getSupabaseAdminClient();

  if (!db) {
    const session = localSessions.get(sessionId);
    if (!session) return false;
    session.paired = true;
    session.status = "paired";
    if (options.familyMemberId) session.family_member_id = options.familyMemberId;
    if (options.scenarioSlug) session.scenario_slug = options.scenarioSlug;
    return true;
  }

  let scenarioId: string | null = null;
  if (options.scenarioSlug) {
    let scenarioQuery = db
      .from("scenarios")
      .select("id")
      .eq("slug", options.scenarioSlug)
    scenarioQuery = options.facilitatorId
      ? scenarioQuery.or(`is_published.eq.true,created_by.eq.${options.facilitatorId}`)
      : scenarioQuery.eq("is_published", true);
    const { data: scenario, error: scenarioError } = await scenarioQuery.maybeSingle();
    if (scenarioError) throw new Error(`Failed to find scenario: ${scenarioError.message}`);
    if (!scenario) return false;
    scenarioId = scenario.id as string;
  }

  const { data, error } = await db
    .from("practice_sessions")
    .update({
      status: "paired",
      paired_at: new Date().toISOString(),
      ...(options.facilitatorId ? { facilitator_id: options.facilitatorId } : {}),
      ...(options.familyMemberId ? { family_member_id: options.familyMemberId } : {}),
      ...(scenarioId ? { scenario_id: scenarioId } : {}),
    })
    .eq("pairing_code", sessionId)
    .select("pairing_code")
    .maybeSingle();

  if (error) throw new Error(`Failed to pair practice session: ${error.message}`);
  return Boolean(data);
}

export async function saveSubscription(
  sessionId: string,
  subscription: PushSubscriptionJSON
): Promise<boolean> {
  const db = getSupabaseAdminClient();

  if (!db) {
    const session = localSessions.get(sessionId);
    if (!session) return false;
    session.pushSubscription = subscription;
    return true;
  }

  const { data, error } = await db
    .from("practice_sessions")
    .update({ push_subscription: subscription })
    .eq("pairing_code", sessionId)
    .select("pairing_code")
    .maybeSingle();

  if (error) throw new Error(`Failed to save push subscription: ${error.message}`);
  return Boolean(data);
}

export async function triggerScam(
  sessionId: string,
  payload: ScamPayloadInput
): Promise<boolean> {
  const session = await getSession(sessionId);
  if (!session?.paired) return false;

  const db = getSupabaseAdminClient();
  if (!db) {
    const localSession = localSessions.get(sessionId);
    if (!localSession) return false;
    localSession.scam = payload;
    localSession.status = "triggered";
    return true;
  }

  const { data, error } = await db
    .from("practice_sessions")
    .update({ scam: payload, status: "triggered", triggered_at: new Date().toISOString() })
    .eq("pairing_code", sessionId)
    .select("pairing_code")
    .maybeSingle();

  if (error) throw new Error(`Failed to trigger practice session: ${error.message}`);
  return Boolean(data);
}

export async function reportResult(
  sessionId: string,
  result: "passed" | "failed"
): Promise<boolean> {
  const db = getSupabaseAdminClient();

  if (!db) {
    const session = localSessions.get(sessionId);
    if (!session) return false;
    session.status = result;
    return true;
  }

  const { data: sessionRow, error: sessionError } = await db
    .from("practice_sessions")
    .select("id,scenario_id")
    .eq("pairing_code", sessionId)
    .maybeSingle();

  if (sessionError) throw new Error(`Failed to find practice session: ${sessionError.message}`);
  if (!sessionRow) return false;

  const completedAt = new Date().toISOString();
  const { error: updateError } = await db
    .from("practice_sessions")
    .update({ status: result, completed_at: completedAt })
    .eq("id", sessionRow.id);

  if (updateError) throw new Error(`Failed to report practice result: ${updateError.message}`);

  let debrief: { warning_signs: string[]; debrief_notes: string | null } = {
    warning_signs: [],
    debrief_notes: null,
  };
  if (sessionRow.scenario_id) {
    const { data: scenario, error: scenarioError } = await db
      .from("scenarios")
      .select("category,title,sender,content,link_hint")
      .eq("id", sessionRow.scenario_id)
      .maybeSingle();
    if (scenarioError) throw new Error(`Failed to load scenario debrief: ${scenarioError.message}`);
    if (scenario) {
      const guidance = buildDebrief({
        category: scenario.category,
        title: scenario.title,
        sender: scenario.sender,
        content: scenario.content,
        linkHint: scenario.link_hint,
      }, result);
      debrief = { warning_signs: guidance.warningSigns, debrief_notes: guidance.discussionPrompt };
    }
  }

  const { error: resultError } = await db.from("practice_results").upsert(
    {
      session_id: sessionRow.id,
      result,
      ...debrief,
      created_at: completedAt,
    },
    { onConflict: "session_id" }
  );

  if (resultError) throw new Error(`Failed to persist practice result: ${resultError.message}`);
  return true;
}
