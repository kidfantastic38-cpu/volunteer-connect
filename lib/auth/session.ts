import { createHmac, randomBytes, timingSafeEqual } from "node:crypto"
import fs from "node:fs"
import path from "node:path"
import { cookies } from "next/headers"
import { getSessionVersion } from "@/lib/auth/db"
import { resolveDataDir } from "@/lib/auth/paths"
import type { AuthSessionPayload, AuthUser } from "@/lib/auth/types"
import { isProductionRuntime } from "@/lib/runtime/env"

export const SESSION_COOKIE = "vc_session"
const SESSION_DAYS = 30

function secret(): string {
  const fromEnv = process.env.AUTH_SECRET?.trim()
  if (isProductionRuntime()) {
    if (!fromEnv || fromEnv.length < 32) {
      throw new Error("AUTH_SECRET must be a long random string (32+ characters) in production.")
    }
    return fromEnv
  }
  if (fromEnv && fromEnv.length >= 16) return fromEnv
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

export function encodeSession(user: AuthUser, sessionVersion = 1): string {
  const body: AuthSessionPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    exp: Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
    sv: sessionVersion,
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
  const sv = (await getSessionVersion(user.id)) ?? 1
  jar.set(SESSION_COOKIE, encodeSession(user, sv), {
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
  const data = decodeSession(jar.get(SESSION_COOKIE)?.value)
  if (!data) return null
  const version = await getSessionVersion(data.sub)
  if (version === null) return null
  if ((data.sv ?? 1) !== version) return null
  return data
}
