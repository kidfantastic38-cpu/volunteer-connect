import { NextResponse } from "next/server"
import { findUserByEmail, findUserById, incrementSessionVersion, updateUserPassword } from "@/lib/auth/db"
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH, verifyPassword } from "@/lib/auth/password"
import { setSessionCookie } from "@/lib/auth/session"
import { isResponse, requireUser } from "@/lib/auth/guards"
import { enforceRateLimit } from "@/lib/security/http"
import { rateLimitKey } from "@/lib/security/request"

export const runtime = "nodejs"

export async function POST(req: Request) {
  const user = await requireUser()
  if (isResponse(user)) return user

  const limited = await enforceRateLimit(rateLimitKey(req, "password", user.id), 5, 15 * 60 * 1000)
  if (limited) return limited

  let body: { current?: string; next?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }

  const current = body.current ?? ""
  const next = body.next ?? ""
  if (next.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json({ error: "New password must be at least 6 characters." }, { status: 400 })
  }
  if (next.length > MAX_PASSWORD_LENGTH) {
    return NextResponse.json({ error: "Password is too long." }, { status: 400 })
  }

  const withHash = await findUserByEmail(user.email)
  if (!withHash || !verifyPassword(current, withHash.passwordHash)) {
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 })
  }

  await updateUserPassword(user.id, next)
  await incrementSessionVersion(user.id)
  const fresh = await findUserById(user.id)
  if (fresh) await setSessionCookie(fresh)
  return NextResponse.json({ ok: true })
}
