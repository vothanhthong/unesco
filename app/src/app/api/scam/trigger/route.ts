import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { triggerScam, getSession } from "@/lib/store";

// Configure VAPID details once
webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { session_id, type, sender, content } = body;

  if (!session_id || !type || !sender || !content) {
    return NextResponse.json(
      { error: "session_id, type, sender, and content are required" },
      { status: 400 }
    );
  }

  const success = triggerScam(session_id, { type, sender, content });

  if (!success) {
    return NextResponse.json(
      { error: "Session not found or not paired" },
      { status: 404 }
    );
  }

  // Send Web Push notification if the learner has subscribed
  const session = getSession(session_id);
  if (session?.pushSubscription) {
    try {
      await webpush.sendNotification(
        session.pushSubscription as webpush.PushSubscription,
        JSON.stringify({
          sender,
          content,
          sessionId: session_id,
        })
      );
      console.log(`[Push] Notification sent to session ${session_id}`);
    } catch (err) {
      // Push failed (e.g. subscription expired) — but don't fail the whole request
      console.error("[Push] Failed to send notification:", err);
    }
  } else {
    console.log(`[Push] No push subscription for session ${session_id}, skipping`);
  }

  return NextResponse.json({ success: true, pushed: !!session?.pushSubscription });
}
