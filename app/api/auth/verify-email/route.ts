import { NextResponse } from "next/server"
import { findUserById, getProfileSnapshot, saveProfileSnapshot, setEmailVerified } from "@/lib/auth/db"
import { isResponse, requireUser } from "@/lib/auth/guards"
import { verifyEmailCode } from "@/lib/auth/otp"
import { buildAuthPayload } from "@/lib/auth/payload"
import { sanitizeProfileSnapshot } from "@/lib/auth/sanitize-profile"
import { enforceRateLimit } from "@/lib/security/http"
import { rateLimitKey } from "@/lib/security/request"

export const runtime = "nodejs"

export async function POST(req: Request) {
  const user = await requireUser()
  if (isResponse(user)) return user

  const limited = await enforceRateLimit(rateLimitKey(req, "verify-email", user.id), 10, 15 * 60 * 1000)
  if (limited) return limited

  let body: { code?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Enter the 6-digit code we sent." }, { status: 400 })
  }

  if (!(await verifyEmailCode(user.id, body.code ?? ""))) {
    return NextResponse.json({ error: "That code is invalid or has expired." }, { status: 400 })
  }

  await setEmailVerified(user.id, true)
  const fresh = await findUserById(user.id)
  if (!fresh) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const raw = await getProfileSnapshot(fresh.id)
  const snapshot = raw ? await sanitizeProfileSnapshot(fresh, raw) : null
  if (snapshot) await saveProfileSnapshot(fresh.id, snapshot)
  return NextResponse.json(await buildAuthPayload(fresh, snapshot))
}
