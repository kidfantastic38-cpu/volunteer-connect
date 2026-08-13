import { createHmac, randomBytes, timingSafeEqual } from "node:crypto"
import fs from "node:fs"
import path from "node:path"
import { cookies } from "next/headers"
import { resolveDataDir } from "@/lib/auth/paths"
import type { AuthSessionPayload, AuthUser } from "@/lib/auth/types"

export const SESSION_COOKIE = "vc_session"
const SESSION_DAYS = 30

function secret(): string {
  if (process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 16) {
    return process.env.AUTH_SECRET
  }
  const dir = resolveDataDir()
  const file = path.join(dir, ".auth-secret")
  try {
    if (fs.existsSync(file)) return fs.readFileSync(file, "utf8").trim()
    fs.mkdirSync(dir, { recursive: true })
    const value = randomBytes(32).toString("hex")
    fs.writeFileSync(file, value, { mode: 0o600 })
    return value
  } catch {
    return "volunteer-connect-dev-secret-change-me"
  }
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url")
}

export function encodeSession(user: AuthUser): string {
  const body: AuthSessionPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    exp: Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
  }
  const payload = Buffer.from(JSON.stringify(body)).toString("base64url")
  return `${payload}.${sign(payload)}`
}

export function decodeSession(token: string | undefined | null): AuthSessionPayload | null {
  if (!token) return null
  const [payload, sig] = token.split(".")
  if (!payload || !sig) return null
  const expected = sign(payload)
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as AuthSessionPayload
    if (!data.sub || !data.email || !data.exp || data.exp < Date.now()) return null
    return data
  } catch {
    return null
  }
}

export async function setSessionCookie(user: AuthUser) {
  const jar = await cookies()
  jar.set(SESSION_COOKIE, encodeSession(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  })
}

export async function clearSessionCookie() {
  const jar = await cookies()
  jar.delete(SESSION_COOKIE)
}

export async function readSession(): Promise<AuthSessionPayload | null> {
  const jar = await cookies()
  return decodeSession(jar.get(SESSION_COOKIE)?.value)
}
