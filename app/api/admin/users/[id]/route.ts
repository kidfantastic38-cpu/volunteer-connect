import { NextResponse } from "next/server"
import { updateAdminUser } from "@/lib/admin/service"
import type { AuthRole } from "@/lib/auth/types"
import { isResponse, requireRole } from "@/lib/auth/guards"
import { enforceRateLimit } from "@/lib/security/http"
import { rateLimitKey } from "@/lib/security/request"

export const runtime = "nodejs"

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireRole("admin")
  if (isResponse(admin)) return admin
  const limited = await enforceRateLimit(rateLimitKey(req, "admin-users", admin.id), 40, 15 * 60 * 1000)
  if (limited) return limited
  const { id } = await ctx.params
  let body: { status?: string; role?: AuthRole }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }
  try {
    const user = await updateAdminUser(admin.id, id, body)
    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 })
    return NextResponse.json({ user })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not update user." }, { status: 400 })
  }
}
