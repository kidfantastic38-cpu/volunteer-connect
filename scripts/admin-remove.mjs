/**
 * Remove one Admin user while preserving another.
 * Usage:
 *   ADMIN_KEEP_EMAIL=you@domain.com ADMIN_REMOVE_EMAIL=old@domain.com node --import ./scripts/register-ts-paths.mjs scripts/admin-remove.mjs
 * Never prints passwords, hashes, DATABASE_URL, AUTH_SECRET, or OTPs.
 */
import postgres from "postgres"
import { loadEnvFiles } from "./load-env.mjs"
import { normalizeEmail } from "../lib/auth/normalize.ts"

loadEnvFiles()

const keepEmail = normalizeEmail(process.env.ADMIN_KEEP_EMAIL || "")
const removeEmail = normalizeEmail(process.env.ADMIN_REMOVE_EMAIL || "")

if (!keepEmail || !removeEmail) {
  console.error("Set ADMIN_KEEP_EMAIL and ADMIN_REMOVE_EMAIL.")
  process.exit(1)
}
if (keepEmail === removeEmail) {
  console.error("Keep and remove emails must be different.")
  process.exit(1)
}

const url = process.env.DATABASE_URL?.trim() || ""
const driver = process.env.DATABASE_DRIVER?.trim() || ""
if (driver === "pglite" || !url || url.includes("127.0.0.1") || url.includes("localhost")) {
  console.error("Refusing to run against PGlite or a local database.")
  process.exit(1)
}

console.log(`database driver: ${driver || "neon"}`)
console.log("hosted postgres: yes")

const sql = postgres(url, { max: 1, prepare: false, ssl: "require" })

try {
  await sql.begin(async (tx) => {
    const keep = await tx`
      SELECT id, role, coalesce(status, 'active') AS status
      FROM users
      WHERE lower(email) = ${keepEmail}
      FOR UPDATE
    `
    const remove = await tx`
      SELECT id, role, coalesce(status, 'active') AS status
      FROM users
      WHERE lower(email) = ${removeEmail}
      FOR UPDATE
    `
    if (!keep[0] || keep[0].role !== "admin" || keep[0].status !== "active") {
      throw new Error("Keep email is not an active admin. Abort.")
    }
    if (!remove[0]) {
      console.log("remove email: not found")
      return
    }
    if (remove[0].role !== "admin") {
      throw new Error("Remove email is not an admin. Abort.")
    }
    await tx`DELETE FROM users WHERE id = ${remove[0].id} AND role = 'admin'`
    const remaining = await tx`SELECT count(*)::int AS n FROM users WHERE role = 'admin'`
    const keepStill = await tx`
      SELECT role, coalesce(status, 'active') AS status
      FROM users
      WHERE lower(email) = ${keepEmail}
    `
    if (remaining[0].n < 1 || !keepStill[0] || keepStill[0].role !== "admin" || keepStill[0].status !== "active") {
      throw new Error("Abort: preserved admin would be lost.")
    }
    console.log("removed older admin: yes")
    console.log(`admins remaining: ${remaining[0].n}`)
    console.log("preserved admin role: admin")
    console.log("preserved admin status: active")
  })
} catch (err) {
  console.error(err instanceof Error ? err.message : "Could not remove admin.")
  process.exit(1)
} finally {
  await sql.end({ timeout: 5 })
}
