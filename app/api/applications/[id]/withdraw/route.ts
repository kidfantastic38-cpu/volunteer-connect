import { NextResponse } from "next/server"
import { isResponse, requireRole } from "@/lib/auth/guards"
import { getApplicationById, updateApplicationStatus } from "@/lib/applications/store"

export const runtime = "nodejs"

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireRole("student")
  if (isResponse(user)) return user
  const { id } = await ctx.params
  const application = await getApplicationById(id)
  if (!application || application.studentId !== user.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 })
  }
  const updated = await updateApplicationStatus(id, "withdrawn")
  return NextResponse.json({ application: updated })
}
