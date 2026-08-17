import { NextResponse } from "next/server"
import { adminDashboardStats } from "@/lib/admin/service"
import { isResponse, requireRole } from "@/lib/auth/guards"

export const runtime = "nodejs"

export async function GET() {
  const user = await requireRole("admin")
  if (isResponse(user)) return user
  return NextResponse.json({ stats: await adminDashboardStats() })
}
