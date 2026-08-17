import { NextResponse } from "next/server"
import { isResponse, requireUser } from "@/lib/auth/guards"
import { MAX_UPLOAD_BYTES, validateUpload } from "@/lib/security/files"
import { enforceRateLimit } from "@/lib/security/http"
import { rateLimitKey } from "@/lib/security/request"
import { publicUploadDto, saveUploadFile } from "@/lib/security/uploads"

export const runtime = "nodejs"

export async function POST(req: Request) {
  const user = await requireUser()
  if (isResponse(user)) return user

  const limited = await enforceRateLimit(rateLimitKey(req, "upload", user.id), 20, 15 * 60 * 1000)
  if (limited) return limited

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 })
  }

  const file = form.get("file")
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose a file to upload." }, { status: 400 })
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "Files must be 2MB or smaller." }, { status: 400 })
  }

  const bytes = new Uint8Array(await file.arrayBuffer())
  const checked = validateUpload(bytes, file.name)
  if ("error" in checked) {
    return NextResponse.json({ error: checked.error }, { status: 400 })
  }

  const upload = await saveUploadFile({
    ownerId: user.id,
    bytes,
    originalName: file.name,
    kind: checked.kind,
  })
  return NextResponse.json({ upload: publicUploadDto(upload) })
}
