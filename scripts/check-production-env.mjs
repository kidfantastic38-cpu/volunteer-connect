/**
 * Validates required production environment variables without printing secrets.
 * Usage: node scripts/check-production-env.mjs
 * Optional: loads .env.local / .env for local dry-runs.
 */
import { loadEnvFiles } from "./load-env.mjs"

loadEnvFiles()

const required = [
  "AUTH_SECRET",
  "DATABASE_URL",
  "DATABASE_DRIVER",
  "BLOB_READ_WRITE_TOKEN",
  "BREVO_API_KEY",
  "EMAIL_FROM",
  "APP_URL",
]

let failed = false

function present(name) {
  return Boolean(process.env[name]?.trim())
}

if (!present("BREVO_API_KEY") && present("BRIVO_API_KEY")) {
  process.env.BREVO_API_KEY = process.env.BRIVO_API_KEY
}

for (const name of required) {
  if (!present(name)) {
    console.log(`MISSING: ${name}`)
    failed = true
  }
}

if (present("AUTH_SECRET") && (process.env.AUTH_SECRET?.trim().length ?? 0) < 32) {
  console.log("WEAK: AUTH_SECRET (use at least 32 characters)")
  failed = true
}

const driver = process.env.DATABASE_DRIVER?.trim()
if (driver && driver !== "neon" && driver !== "postgres") {
  console.log("INVALID: DATABASE_DRIVER must be neon or postgres in production")
  failed = true
}

if (process.env.ALLOW_DEMO_OTP === "true") {
  console.log("INVALID: ALLOW_DEMO_OTP must be unset or false in production")
  failed = true
}

for (const name of ["AUTH_SECRET", "DATABASE_URL", "BLOB_READ_WRITE_TOKEN", "BREVO_API_KEY"]) {
  if (present(`NEXT_PUBLIC_${name}`)) {
    console.log(`EXPOSED: NEXT_PUBLIC_${name} must not be set`)
    failed = true
  }
}

if (failed) {
  console.log("Production environment check failed.")
  process.exit(1)
}

console.log("Production environment check passed. Secret values were not printed.")
