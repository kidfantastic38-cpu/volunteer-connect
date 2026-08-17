import { NextResponse } from "next/server"
import { findUserByEmail, getProfileSnapshot, saveProfileSnapshot } from "@/lib/auth/db"
import { defaultProfileSnapshot } from "@/lib/auth/defaults"
import { normalizeEmail } from "@/lib/auth/normalize"
import { buildAuthPayload } from "@/lib/auth/payload"
import { MAX_PASSWORD_LENGTH, verifyPassword } from "@/lib/auth/password"
import { sanitizeProfileSnapshot } from "@/lib/auth/sanitize-profile"
import { setSessionCookie } from "@/lib/auth/session"
import { ensureBootstrapped } from "@/lib/db/bootstrap"
import { enforceRateLimit, safeInternalError } from "@/lib/security/http"
import { rateLimitKey } from "@/lib/security/request"

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
  const limitedAccount = await enforceRateLimit(rateLimitKey(req, "login", email || "unknown"), 10, 15 * 60 * 1000)
  if (limitedAccount) return limitedAccount
  const limitedIp = await enforceRateLimit(rateLimitKey(req, "login-ip"), 40, 15 * 60 * 1000)
  if (limitedIp) return limitedIp
  if (!email || !password || password.length > MAX_PASSWORD_LENGTH) {
    return NextResponse.json({ error: GENERIC }, { status: 401 })
  }

  try {
    await ensureBootstrapped()
    const found = await findUserByEmail(email)
    if (!found || !verifyPassword(password, found.passwordHash)) {
      return NextResponse.json({ error: GENERIC }, { status: 401 })
    }

    const { passwordHash: _, ...user } = found
    let snapshot = await getProfileSnapshot(user.id)
    if (!snapshot) {
      snapshot = defaultProfileSnapshot(user)
    }
    snapshot = await sanitizeProfileSnapshot(user, snapshot)
    await saveProfileSnapshot(user.id, snapshot)
    await setSessionCookie(user)
    return NextResponse.json(await buildAuthPayload(user, snapshot))
  } catch (err) {
    return safeInternalError(GENERIC, err)
  }
}
