import { NextResponse } from "next/server"
import { listAdminOpportunities } from "@/lib/admin/service"
import { isResponse, requireRole } from "@/lib/auth/guards"

export const runtime = "nodejs"

export async function GET() {
  const user = await requireRole("admin")
  if (isResponse(user)) return user
  return NextResponse.json({ opportunities: await listAdminOpportunities() })
}
