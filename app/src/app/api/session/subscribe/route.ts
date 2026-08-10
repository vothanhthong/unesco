import { NextRequest, NextResponse } from "next/server";
import { saveSubscription } from "@/lib/store";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { session_id, subscription } = body;

  if (!session_id || !subscription) {
    return NextResponse.json(
      { error: "session_id and subscription are required" },
      { status: 400 }
    );
  }

  const success = saveSubscription(session_id, subscription);

  if (!success) {
    return NextResponse.json(
      { error: "Session not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}
