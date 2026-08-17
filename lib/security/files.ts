import { randomUUID } from "node:crypto"

export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024

export const ALLOWED_UPLOAD_KINDS = ["pdf", "jpeg", "png", "webp"] as const
export type AllowedUploadKind = (typeof ALLOWED_UPLOAD_KINDS)[number]

const KIND_MIME: Record<AllowedUploadKind, string> = {
  pdf: "application/pdf",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
}

const KIND_EXT: Record<AllowedUploadKind, string> = {
  pdf: "pdf",
  jpeg: "jpg",
  png: "png",
  webp: "webp",
}

const DANGEROUS_EXT =
  /\.(exe|dll|com|bat|cmd|sh|bash|zsh|ps1|msi|jar|js|mjs|cjs|ts|tsx|jsx|php|phtml|asp|aspx|cgi|htm|html|svg|xml|xhtml|hta|vbs|wsf|scr|pif|cpl|lnk|apk|app|dmg|iso|img|bin|elf)$/i

export function detectFileKind(bytes: Uint8Array): AllowedUploadKind | null {
  if (bytes.length < 12) return null
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) return "pdf"
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpeg"
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "png"
  const riff = bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46
  const webp = bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  if (riff && webp) return "webp"
  return null
}

export function mimeForKind(kind: AllowedUploadKind): string {
  return KIND_MIME[kind]
}

export function extForKind(kind: AllowedUploadKind): string {
  return KIND_EXT[kind]
}

export function isDangerousFilename(name: string): boolean {
  if (name.includes("\0") || name.includes("..")) return true
  const base = name.split(/[/\\]/).pop() ?? name
  return DANGEROUS_EXT.test(base) || base.includes("\0") || base.includes("..")
}

export function sanitizeStoredName(kind: AllowedUploadKind): string {
  return `${randomUUID()}.${extForKind(kind)}`
}

export function displayFilename(original: string): string {
  const base = (original.split(/[/\\]/).pop() ?? "file").replace(/[^\w.\- ()]/g, "_").slice(0, 120)
  return base || "file"
}

export function validateUpload(bytes: Uint8Array, originalName: string): { kind: AllowedUploadKind } | { error: string } {
  if (bytes.length === 0) return { error: "The file is empty." }
  if (bytes.length > MAX_UPLOAD_BYTES) return { error: "Files must be 2MB or smaller." }
  if (isDangerousFilename(originalName)) return { error: "This file type is not allowed." }
  const kind = detectFileKind(bytes)
  if (!kind) return { error: "Only PDF, JPEG, PNG, and WebP files are allowed." }
  return { kind }
}
