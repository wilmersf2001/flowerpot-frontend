import { NextResponse } from "next/server";

/** BFF liveness probe. Real proxy route handlers land in M1. */
export function GET() {
  return NextResponse.json({ ok: true, service: "dashboard", ts: Date.now() });
}
