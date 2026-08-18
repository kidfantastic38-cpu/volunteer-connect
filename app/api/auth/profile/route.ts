import { NextResponse } from "next/server"
import { findUserById, saveProfileSnapshot } from "@/lib/auth/db"
import { isResponse, requireUser } from "@/lib/auth/guards"
import { sanitizeProfileSnapshot } from "@/lib/auth/sanitize-profile"
import type { ProfileSnapshot } from "@/lib/auth/types"
import { enforceRateLimit } from "@/lib/security/http"
import { rateLimitKey } from "@/lib/security/request"

export const runtime = "nodejs"

export async function PUT(req: Request) {
  const user = await requireUser()
  if (isResponse(user)) return user
  // Session identity only. Query parameters such as ?id= cannot retarget another account.

  const limited = await enforceRateLimit(rateLimitKey(req, "profile", user.id), 60, 15 * 60 * 1000)
  if (limited) return limited

  let body: { snapshot?: ProfileSnapshot }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }
  if (!body.snapshot || typeof body.snapshot !== "object") {
    return NextResponse.json({ error: "Missing snapshot." }, { status: 400 })
  }

  const account = await findUserById(user.id)
  if (!account) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const snapshot = await sanitizeProfileSnapshot(account, body.snapshot)
  await saveProfileSnapshot(account.id, snapshot)
  return NextResponse.json({ ok: true, snapshot })
}
