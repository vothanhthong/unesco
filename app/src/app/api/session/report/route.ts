import { NextRequest, NextResponse } from "next/server";
import { reportResult } from "@/lib/store";
import { reportResultSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = reportResultSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "session_id and result are required; result must be passed or failed" },
      { status: 400 }
    );
  }

  try {
    const success = await reportResult(parsed.data.session_id, parsed.data.result);

    if (!success) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Session] Failed to report result", error);
    return NextResponse.json({ error: "Unable to report the result" }, { status: 500 });
  }
}
