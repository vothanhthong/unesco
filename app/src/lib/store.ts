// In-memory session store for the anti-scam demo

export interface ScamPayload {
  type: string;
  sender: string;
  content: string;
}

export interface Session {
  session_id: string;
  paired: boolean;
  status: "waiting" | "paired" | "triggered" | "passed" | "failed";
  scam?: ScamPayload;
  pushSubscription?: PushSubscriptionJSON;
  created_at: number;
}

// Simple in-memory map
const sessions = new Map<string, Session>();

export function createSession(): Session {
  let code: string;
  do {
    code = String(Math.floor(1000 + Math.random() * 9000));
  } while (sessions.has(code));

  const session: Session = {
    session_id: code,
    paired: false,
    status: "waiting",
    created_at: Date.now(),
  };

  sessions.set(code, session);
  return session;
}

export function getSession(sessionId: string): Session | undefined {
  return sessions.get(sessionId);
}

export function pairSession(sessionId: string): boolean {
  const session = sessions.get(sessionId);
  if (!session) return false;
  session.paired = true;
  session.status = "paired";
  return true;
}

export function saveSubscription(
  sessionId: string,
  subscription: PushSubscriptionJSON
): boolean {
  const session = sessions.get(sessionId);
  if (!session) return false;
  session.pushSubscription = subscription;
  return true;
}

export function triggerScam(
  sessionId: string,
  payload: ScamPayload
): boolean {
  const session = sessions.get(sessionId);
  if (!session || !session.paired) return false;
  session.scam = payload;
  session.status = "triggered";
  return true;
}

export function reportResult(
  sessionId: string,
  result: "passed" | "failed"
): boolean {
  const session = sessions.get(sessionId);
  if (!session) return false;
  session.status = result;
  return true;
}
