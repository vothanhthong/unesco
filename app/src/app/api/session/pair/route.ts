import { NextRequest, NextResponse } from "next/server";
import { pairSession } from "@/lib/store";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { session_id } = body;

  if (!session_id) {
    return NextResponse.json(
      { error: "session_id is required" },
      { status: 400 }
    );
  }

  const success = pairSession(session_id);

  if (!success) {
    return NextResponse.json(
      { error: "Session not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, session_id });
}
