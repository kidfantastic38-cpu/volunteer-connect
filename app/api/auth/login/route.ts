import { NextResponse } from "next/server"
import { findUserByEmail, getProfileSnapshot, saveProfileSnapshot } from "@/lib/auth/db"
import { defaultProfileSnapshot } from "@/lib/auth/defaults"
import { normalizeEmail } from "@/lib/auth/normalize"
import { verifyPassword } from "@/lib/auth/password"
import { setSessionCookie } from "@/lib/auth/session"

export const runtime = "nodejs"

const GENERIC = "We couldn't find an account with those details."

export async function POST(req: Request) {
  let body: { email?: string; password?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: GENERIC }, { status: 400 })
  }

  const email = normalizeEmail(body.email ?? "")
  const password = body.password ?? ""
  if (!email || !password) {
    return NextResponse.json({ error: GENERIC }, { status: 401 })
  }

  const found = findUserByEmail(email)
  if (!found || !verifyPassword(password, found.passwordHash)) {
    return NextResponse.json({ error: GENERIC }, { status: 401 })
  }

  const user = { id: found.id, email: found.email, name: found.name, role: found.role }
  let snapshot = getProfileSnapshot(user.id)
  if (!snapshot) {
    snapshot = defaultProfileSnapshot(user)
    saveProfileSnapshot(user.id, snapshot)
  }
  await setSessionCookie(user)
  return NextResponse.json({ user, snapshot })
}
