import { NextResponse } from "next/server"
import { isResponse, requireUser } from "@/lib/auth/guards"
import { issueEmailCode } from "@/lib/auth/otp"
import { enforceRateLimit } from "@/lib/security/http"
import { rateLimitKey } from "@/lib/security/request"

export const runtime = "nodejs"

export async function POST(req: Request) {
  const user = await requireUser()
  if (isResponse(user)) return user

  const limited = await enforceRateLimit(rateLimitKey(req, "verify-email-send", user.id), 3, 15 * 60 * 1000)
  if (limited) return limited

  try {
    const issued = await issueEmailCode(user.id)
    return NextResponse.json({
      ok: true,
      expiresAt: issued.expiresAt,
      demo: issued.demo,
    })
  } catch {
    return NextResponse.json({ error: "Could not send a verification email right now." }, { status: 503 })
  }
}
