import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { triggerScam, getSession } from "@/lib/store";
import { scamTriggerSchema } from "@/lib/validation";

const vapidConfig = [
  process.env.VAPID_EMAIL,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY,
];

if (vapidConfig.every(Boolean)) {
  webpush.setVapidDetails(vapidConfig[0]!, vapidConfig[1]!, vapidConfig[2]!);
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = scamTriggerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "session_id, type, sender, and content are required" },
      { status: 400 }
    );
  }

  try {
    const { session_id, type, sender, content } = parsed.data;
    const success = await triggerScam(session_id, { type, sender, content });

    if (!success) {
      return NextResponse.json({ error: "Session not found or not paired" }, { status: 404 });
    }

    // Push is optional for local development and must not block the simulation.
    const session = await getSession(session_id);
    if (session?.pushSubscription && vapidConfig.every(Boolean)) {
      try {
        await webpush.sendNotification(
          session.pushSubscription as webpush.PushSubscription,
          JSON.stringify({ sender, content, sessionId: session_id })
        );
      } catch (error) {
        console.error("[Push] Failed to send notification", error);
      }
    }

    return NextResponse.json({
      success: true,
      pushed: Boolean(session?.pushSubscription && vapidConfig.every(Boolean)),
    });
  } catch (error) {
    console.error("[Session] Failed to trigger scam", error);
    return NextResponse.json({ error: "Unable to trigger the scam simulation" }, { status: 500 });
  }
}
