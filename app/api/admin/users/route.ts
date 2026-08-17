import { NextResponse } from "next/server"
import { listAdminUsers } from "@/lib/admin/service"
import { isResponse, requireRole } from "@/lib/auth/guards"

export const runtime = "nodejs"

export async function GET(req: Request) {
  const user = await requireRole("admin")
  if (isResponse(user)) return user
  const url = new URL(req.url)
  const users = await listAdminUsers({
    query: url.searchParams.get("q") ?? "",
    role: url.searchParams.get("role") ?? "",
    status: url.searchParams.get("status") ?? "",
  })
  return NextResponse.json({ users })
}
