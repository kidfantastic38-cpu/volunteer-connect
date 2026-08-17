import { NextResponse } from "next/server"
import { broadcastNotification, listRecentNotifications } from "@/lib/admin/service"
import { isResponse, requireRole } from "@/lib/auth/guards"
import { enforceRateLimit } from "@/lib/security/http"
import { rateLimitKey } from "@/lib/security/request"

export const runtime = "nodejs"

export async function GET() {
  const user = await requireRole("admin")
  if (isResponse(user)) return user
  return NextResponse.json({ notifications: await listRecentNotifications() })
}

export async function POST(req: Request) {
  const admin = await requireRole("admin")
  if (isResponse(admin)) return admin
  const limited = await enforceRateLimit(rateLimitKey(req, "admin-announce", admin.id), 10, 15 * 60 * 1000)
  if (limited) return limited
  let body: { title?: string; message?: string; audience?: "all" | "student" | "employer" }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }
  try {
    const result = await broadcastNotification(admin.id, {
      title: body.title ?? "",
      message: body.message ?? "",
      audience: body.audience === "student" || body.audience === "employer" ? body.audience : "all",
    })
    return NextResponse.json({ ok: true, ...result, notifications: await listRecentNotifications() })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not send." }, { status: 400 })
  }
}
