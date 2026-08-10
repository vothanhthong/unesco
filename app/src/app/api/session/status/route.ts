import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/store";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json(
      { error: "session_id query param is required" },
      { status: 400 }
    );
  }

  const session = getSession(sessionId);

  if (!session) {
    return NextResponse.json(
      { error: "Session not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    session_id: session.session_id,
    paired: session.paired,
    status: session.status,
    scam: session.scam || null,
  });
}
