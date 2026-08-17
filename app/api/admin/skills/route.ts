import { NextResponse } from "next/server"
import { recordAdminAudit } from "@/lib/admin/service"
import { findUserById, getProfileSnapshot, saveProfileSnapshot } from "@/lib/auth/db"
import { isResponse, requireRole } from "@/lib/auth/guards"
import { sanitizeProfileSnapshot } from "@/lib/auth/sanitize-profile"
import { setSkillVerification } from "@/lib/auth/skills"
import { enforceRateLimit } from "@/lib/security/http"
import { rateLimitKey } from "@/lib/security/request"

export const runtime = "nodejs"

export async function POST(req: Request) {
  const admin = await requireRole("admin")
  if (isResponse(admin)) return admin

  const limited = await enforceRateLimit(rateLimitKey(req, "admin-skills", admin.id), 40, 15 * 60 * 1000)
  if (limited) return limited

  let body: { userId?: string; skillName?: string; verified?: boolean }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }

  const userId = (body.userId ?? "").trim()
  const skillName = (body.skillName ?? "").trim()
  if (!userId || !skillName || typeof body.verified !== "boolean") {
    return NextResponse.json({ error: "userId, skillName, and verified are required." }, { status: 400 })
  }

  const target = await findUserById(userId)
  if (!target) return NextResponse.json({ error: "User not found." }, { status: 404 })

  const record = await setSkillVerification({
    userId,
    skillName,
    verified: body.verified,
    verifiedBy: admin.id,
    source: "admin",
  })
  const raw = await getProfileSnapshot(userId)
  if (raw) await saveProfileSnapshot(userId, await sanitizeProfileSnapshot(target, raw))
  await recordAdminAudit({
    actorId: admin.id,
    action: body.verified ? "skill.verified" : "skill.unverified",
    entityType: "skill",
    entityId: userId,
    metadata: { skillName },
  })
  return NextResponse.json({ ok: true, verification: record })
}
