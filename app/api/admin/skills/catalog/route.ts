import { NextResponse } from "next/server"
import { listSkillCatalog, upsertSkillCatalog } from "@/lib/admin/service"
import { isResponse, requireRole } from "@/lib/auth/guards"
import { enforceRateLimit } from "@/lib/security/http"
import { rateLimitKey } from "@/lib/security/request"

export const runtime = "nodejs"

export async function GET() {
  const user = await requireRole("admin")
  if (isResponse(user)) return user
  return NextResponse.json({ skills: await listSkillCatalog() })
}

export async function POST(req: Request) {
  const admin = await requireRole("admin")
  if (isResponse(admin)) return admin
  const limited = await enforceRateLimit(rateLimitKey(req, "admin-catalog", admin.id), 40, 15 * 60 * 1000)
  if (limited) return limited
  let body: { id?: string; name?: string; category?: string; active?: boolean }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }
  try {
    const skill = await upsertSkillCatalog(admin.id, {
      id: body.id,
      name: body.name ?? "",
      category: body.category ?? "General",
      active: body.active,
    })
    return NextResponse.json({ skill })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not save skill." }, { status: 400 })
  }
}
