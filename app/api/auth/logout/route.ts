import { NextResponse } from "next/server"
import { incrementSessionVersion } from "@/lib/auth/db"
import { clearSessionCookie, readSession } from "@/lib/auth/session"

export const runtime = "nodejs"

export async function POST() {
  const session = await readSession()
  if (session) await incrementSessionVersion(session.sub)
  await clearSessionCookie()
  return NextResponse.json({ ok: true })
}
