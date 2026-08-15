import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/store";
import { sessionIdSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");

  const parsedSessionId = sessionIdSchema.safeParse(sessionId);
  if (!parsedSessionId.success) {
    return NextResponse.json(
      { error: "session_id must be four digits" },
      { status: 400 }
    );
  }

  try {
    const session = await getSession(parsedSessionId.data);

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({
      session_id: session.session_id,
      paired: session.paired,
      status: session.status,
      scam: session.scam || null,
    });
  } catch (error) {
    console.error("[Session] Failed to read session", error);
    return NextResponse.json({ error: "Unable to read the session" }, { status: 500 });
  }
}
