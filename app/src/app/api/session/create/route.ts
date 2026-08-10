import { NextResponse } from "next/server";
import { createSession } from "@/lib/store";

export async function POST() {
  const session = createSession();
  return NextResponse.json({
    session_id: session.session_id,
    status: session.status,
  });
}
