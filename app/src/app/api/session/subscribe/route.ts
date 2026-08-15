import { NextRequest, NextResponse } from "next/server";
import { saveSubscription } from "@/lib/store";
import { subscribeSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = subscribeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "A valid session_id and push subscription are required" }, { status: 400 });
  }

  try {
    const success = await saveSubscription(parsed.data.session_id, parsed.data.subscription);

    if (!success) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Session] Failed to save subscription", error);
    return NextResponse.json({ error: "Unable to save the subscription" }, { status: 500 });
  }
}
