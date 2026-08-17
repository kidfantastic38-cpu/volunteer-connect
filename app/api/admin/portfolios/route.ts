import { NextResponse } from "next/server"
import { listAdminPortfolios } from "@/lib/admin/service"
import { isResponse, requireRole } from "@/lib/auth/guards"

export const runtime = "nodejs"

export async function GET(req: Request) {
  const user = await requireRole("admin")
  if (isResponse(user)) return user
  const url = new URL(req.url)
  return NextResponse.json({ portfolios: await listAdminPortfolios(url.searchParams.get("q") ?? "") })
}
