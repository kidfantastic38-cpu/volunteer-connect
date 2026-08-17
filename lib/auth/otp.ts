import { createHmac, randomInt, timingSafeEqual } from "node:crypto"
import { eq } from "drizzle-orm"
import { findUserById } from "@/lib/auth/db"
import { getDb } from "@/lib/db/client"
import { emailCodes } from "@/lib/db/schema"
import { sendVerificationEmail } from "@/lib/email/send"
import { allowDemoOtp, isProductionRuntime } from "@/lib/runtime/env"

const TTL_MS = 15 * 60 * 1000
export const DEMO_EMAIL_CODE = "481920"

function otpSecret(): string {
  const fromEnv = process.env.AUTH_SECRET?.trim()
  if (isProductionRuntime()) {
    if (!fromEnv || fromEnv.length < 32) {
      throw new Error("AUTH_SECRET must be a long random string (32+ characters) in production.")
    }
    return fromEnv
  }
  return fromEnv || "volunteer-connect-otp"
}

function hashCode(userId: string, code: string): string {
  return createHmac("sha256", otpSecret()).update(`${userId}:${code}`).digest("hex")
}

export async function issueEmailCode(userId: string): Promise<{ expiresAt: number; demo: boolean }> {
  const demo = allowDemoOtp()
  const code = demo ? DEMO_EMAIL_CODE : String(randomInt(100000, 1000000))
  const createdAt = Math.floor(Date.now() / 1000)
  const expiresAt = createdAt + Math.floor(TTL_MS / 1000)
  await getDb()
    .insert(emailCodes)
    .values({
      userId,
      codeHash: hashCode(userId, code),
      expiresAt,
      createdAt,
    })
    .onConflictDoUpdate({
      target: emailCodes.userId,
      set: { codeHash: hashCode(userId, code), expiresAt, createdAt },
    })

  if (!demo) {
    const user = await findUserById(userId)
    if (!user?.email) throw new Error("Cannot send verification email.")
    await sendVerificationEmail({ to: user.email, code })
  } else if (process.env.NODE_ENV !== "production") {
    console.info("[auth] email verification code issued")
  }

  return { expiresAt: createdAt + TTL_MS, demo }
}

export async function verifyEmailCode(userId: string, code: string): Promise<boolean> {
  const clean = code.replace(/\D/g, "").slice(0, 6)
  if (clean.length !== 6) return false
  const [row] = await getDb().select().from(emailCodes).where(eq(emailCodes.userId, userId)).limit(1)
  if (!row || row.expiresAt < Math.floor(Date.now() / 1000)) return false
  const actual = Buffer.from(hashCode(userId, clean), "hex")
  const expected = Buffer.from(row.codeHash, "hex")
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return false
  await getDb().delete(emailCodes).where(eq(emailCodes.userId, userId))
  return true
}
