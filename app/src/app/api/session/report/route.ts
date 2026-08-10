import { NextRequest, NextResponse } from "next/server";
import { reportResult } from "@/lib/store";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { session_id, result } = body;

  if (!session_id || !result) {
    return NextResponse.json(
      { error: "session_id and result are required" },
      { status: 400 }
    );
  }

  if (result !== "passed" && result !== "failed") {
    return NextResponse.json(
      { error: "result must be 'passed' or 'failed'" },
      { status: 400 }
    );
  }

  const success = reportResult(session_id, result);

  if (!success) {
    return NextResponse.json(
      { error: "Session not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}
