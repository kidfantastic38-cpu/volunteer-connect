import { NextResponse } from "next/server"
import { listAdminApplications } from "@/lib/admin/service"
import { isResponse, requireRole } from "@/lib/auth/guards"

export const runtime = "nodejs"

export async function GET(req: Request) {
  const user = await requireRole("admin")
  if (isResponse(user)) return user
  const url = new URL(req.url)
  const applications = await listAdminApplications({
    status: url.searchParams.get("status") ?? "",
    opportunityId: url.searchParams.get("opportunityId") ?? "",
    organizationId: url.searchParams.get("organizationId") ?? "",
    query: url.searchParams.get("q") ?? "",
  })
  return NextResponse.json({ applications })
}
