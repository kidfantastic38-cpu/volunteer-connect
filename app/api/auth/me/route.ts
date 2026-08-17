import { NextResponse } from "next/server"
import { findUserById, getProfileSnapshot } from "@/lib/auth/db"
import { defaultProfileSnapshot } from "@/lib/auth/defaults"
import { buildAuthPayload } from "@/lib/auth/payload"
import { sanitizeProfileSnapshot } from "@/lib/auth/sanitize-profile"
import { readSession } from "@/lib/auth/session"
import { ensureBootstrapped } from "@/lib/db/bootstrap"

export const runtime = "nodejs"

export async function GET() {
  await ensureBootstrapped()
  const session = await readSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const user = await findUserById(session.sub)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  let snapshot = await getProfileSnapshot(user.id)
  if (!snapshot) snapshot = defaultProfileSnapshot(user)
  snapshot = await sanitizeProfileSnapshot(user, snapshot)
  return NextResponse.json(await buildAuthPayload(user, snapshot))
}
