import { NextResponse } from "next/server"
import { isResponse, requireUser } from "@/lib/auth/guards"
import { canReadUpload, findUpload, readUploadBytes } from "@/lib/security/uploads"

export const runtime = "nodejs"

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireUser()
  if (isResponse(user)) return user

  const { id } = await ctx.params
  const upload = await findUpload(id)
  if (!upload) return NextResponse.json({ error: "Not found." }, { status: 404 })
  if (!canReadUpload(user.id, user.role, upload)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 })
  }

  const bytes = await readUploadBytes(upload)
  if (!bytes) return NextResponse.json({ error: "Not found." }, { status: 404 })
  const ext = upload.storedName.includes(".") ? upload.storedName.split(".").pop() : "bin"

  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": upload.mime,
      "Content-Disposition": `attachment; filename="download.${ext}"`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  })
}
