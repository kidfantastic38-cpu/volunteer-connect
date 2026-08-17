/**
 * Create or refresh a permanent Administrator account in hosted PostgreSQL.
 * Usage:
 *   ADMIN_EMAIL=you@domain ADMIN_PASSWORD=... pnpm admin:create
 * Optional: ADMIN_NAME="Platform Administrator"
 * Password may also be piped on stdin. Never commit these values.
 */
import { readFileSync } from "node:fs"
import { loadEnvFiles } from "./load-env.mjs"
import { provisionAdminAccount } from "../lib/auth/provision-admin.ts"
import { describeDatabaseTarget } from "../lib/auth/provision-admin.ts"

loadEnvFiles()

function readPassword() {
  const fromEnv = process.env.ADMIN_PASSWORD
  if (fromEnv && fromEnv.trim()) return fromEnv
  if (!process.stdin.isTTY) {
    const piped = readFileSync(0, "utf8").replace(/\r?\n$/, "")
    if (piped) return piped
  }
  return ""
}

const email = process.env.ADMIN_EMAIL?.trim() || ""
const name = process.env.ADMIN_NAME?.trim()
const password = readPassword()
delete process.env.ADMIN_PASSWORD

if (!email) {
  console.error("Set ADMIN_EMAIL. Example: ADMIN_EMAIL=you@domain.com ADMIN_PASSWORD=... pnpm admin:create")
  process.exit(1)
}
if (!password) {
  console.error("Set ADMIN_PASSWORD in the environment for this command, or pipe the password on stdin. It is not read from git, .env, or .env.example.")
  process.exit(1)
}

const target = describeDatabaseTarget()
console.log(`database driver: ${target.driver}`)
console.log(`hosted postgres: ${target.hosted ? "yes" : "no"}`)

try {
  const result = await provisionAdminAccount({ email, password, name })
  console.log(`action: ${result.action}`)
  console.log(`email: ${result.email}`)
  console.log(`role: ${result.role}`)
  console.log(`status: ${result.status}`)
  console.log(`emailVerified: ${result.emailVerified ? "yes" : "no"}`)
  console.log(`verification email sent: ${result.emailSent ? "yes" : "no"}`)
  console.log("Password and hash were not printed.")
} catch (err) {
  console.error(err instanceof Error ? err.message : "Could not provision admin.")
  process.exit(1)
}
