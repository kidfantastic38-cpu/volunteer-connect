import { NextResponse } from "next/server"
import { organizationBadgeMap } from "@/lib/org/db"

export const runtime = "nodejs"

export async function GET() {
  return NextResponse.json({ badges: await organizationBadgeMap() })
}
