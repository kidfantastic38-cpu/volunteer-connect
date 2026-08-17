import fs from "node:fs"
import path from "node:path"
import { randomUUID } from "node:crypto"
import { eq } from "drizzle-orm"
import { get, put } from "@vercel/blob"
import { resolveDataDir } from "@/lib/auth/paths"
import { getDb } from "@/lib/db/client"
import { uploads } from "@/lib/db/schema"
import { displayFilename, extForKind, mimeForKind, sanitizeStoredName, type AllowedUploadKind } from "@/lib/security/files"

export type StoredUpload = {
  id: string
  ownerId: string
  storedName: string
  originalName: string
  mime: string
  size: number
  createdAt: string
  storagePath: string
}

function blobStorageEnabled() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN)
}

export function uploadsRoot(): string {
  return path.join(resolveDataDir(), "uploads")
}

export function ownerUploadDir(ownerId: string): string {
  return path.join(uploadsRoot(), ownerId)
}

export async function saveUploadFile(input: {
  ownerId: string
  bytes: Uint8Array
  originalName: string
  kind: AllowedUploadKind
}): Promise<StoredUpload> {
  const id = randomUUID()
  const storedName = sanitizeStoredName(input.kind)
  const createdAt = new Date().toISOString()
  let storagePath = storedName

  if (blobStorageEnabled()) {
    const blob = await put(`uploads/${input.ownerId}/${storedName}`, Buffer.from(input.bytes), {
      access: "private",
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType: mimeForKind(input.kind),
    })
    storagePath = blob.url
  } else {
    if (process.env.NODE_ENV === "production") {
      throw new Error("BLOB_READ_WRITE_TOKEN is required for uploads in production.")
    }
    const dir = ownerUploadDir(input.ownerId)
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(path.join(dir, storedName), input.bytes)
    storagePath = `local:${input.ownerId}/${storedName}`
  }

  await getDb().insert(uploads).values({
    id,
    ownerId: input.ownerId,
    originalName: displayFilename(input.originalName),
    storagePath,
    mimeType: mimeForKind(input.kind),
    size: input.bytes.length,
    createdAt,
  })
  return {
    id,
    ownerId: input.ownerId,
    storedName,
    originalName: displayFilename(input.originalName),
    mime: mimeForKind(input.kind),
    size: input.bytes.length,
    createdAt,
    storagePath,
  }
}

export async function ownedUploadIdSet(ownerId: string): Promise<Set<string>> {
  const rows = await getDb().select({ id: uploads.id }).from(uploads).where(eq(uploads.ownerId, ownerId))
  return new Set(rows.map((row) => row.id))
}

export function canReadUpload(userId: string, role: string, upload: StoredUpload): boolean {
  return upload.ownerId === userId || role === "admin"
}

export async function findUpload(id: string): Promise<StoredUpload | null> {
  const [row] = await getDb().select().from(uploads).where(eq(uploads.id, id)).limit(1)
  if (!row) return null
  return {
    id: row.id,
    ownerId: row.ownerId,
    storedName: row.storagePath.split("/").pop() ?? row.id,
    originalName: row.originalName,
    mime: row.mimeType,
    size: row.size,
    createdAt: row.createdAt,
    storagePath: row.storagePath,
  }
}

export async function readUploadBytes(upload: StoredUpload): Promise<Buffer | null> {
  if (upload.storagePath.startsWith("http")) {
    if (blobStorageEnabled()) {
      const result = await get(upload.storagePath, {
        access: "private",
        token: process.env.BLOB_READ_WRITE_TOKEN,
        useCache: false,
      })
      if (!result || result.statusCode !== 200 || !result.stream) return null
      return Buffer.from(await new Response(result.stream).arrayBuffer())
    }
    const res = await fetch(upload.storagePath)
    if (!res.ok) return null
    return Buffer.from(await res.arrayBuffer())
  }
  const relative = upload.storagePath.startsWith("local:") ? upload.storagePath.slice(6) : upload.storedName
  const file = path.join(uploadsRoot(), relative)
  const resolved = path.resolve(file)
  const root = path.resolve(uploadsRoot())
  if (!resolved.startsWith(root + path.sep) && resolved !== root) return null
  if (!fs.existsSync(resolved)) return null
  return fs.readFileSync(resolved)
}

export function publicUploadDto(upload: StoredUpload) {
  return {
    id: upload.id,
    name: upload.originalName,
    mime: upload.mime,
    size: upload.size,
    ext: extForKind(upload.mime === "application/pdf" ? "pdf" : upload.mime === "image/png" ? "png" : upload.mime === "image/webp" ? "webp" : "jpeg"),
  }
}
