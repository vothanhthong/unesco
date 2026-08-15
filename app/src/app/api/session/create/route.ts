import { NextResponse } from "next/server";
import { createSession } from "@/lib/store";

export async function POST() {
  try {
    const session = await createSession();
    return NextResponse.json({
      session_id: session.session_id,
      status: session.status,
    });
  } catch (error) {
    console.error("[Session] Failed to create session", error);
    return NextResponse.json({ error: "Unable to create a session" }, { status: 500 });
  }
}
