import { NextResponse } from "next/server"
import { findUserById, getProfileSnapshot, saveProfileSnapshot } from "@/lib/auth/db"
import { defaultProfileSnapshot } from "@/lib/auth/defaults"
import { readSession } from "@/lib/auth/session"

export const runtime = "nodejs"

export async function GET() {
  const session = await readSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const user = findUserById(session.sub)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  let snapshot = getProfileSnapshot(user.id)
  if (!snapshot) {
    snapshot = defaultProfileSnapshot(user)
    saveProfileSnapshot(user.id, snapshot)
  }
  return NextResponse.json({ user, snapshot })
}
