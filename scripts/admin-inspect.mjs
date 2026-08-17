/**
 * Print non-sensitive admin account status for hosted PostgreSQL.
 * Never prints passwords, hashes, DATABASE_URL, AUTH_SECRET, or OTPs.
 */
import { loadEnvFiles } from "./load-env.mjs"
import { describeDatabaseTarget } from "../lib/auth/provision-admin.ts"
import { getDb, isEmbeddedPostgres } from "../lib/db/client.ts"
import { users } from "../lib/db/schema.ts"
import { eq, sql } from "drizzle-orm"

loadEnvFiles()

const target = describeDatabaseTarget()
console.log(`database driver: ${target.driver}`)
console.log(`hosted postgres: ${target.hosted ? "yes" : "no"}`)
console.log(`embedded pglite: ${isEmbeddedPostgres() ? "yes" : "no"}`)
console.log(`DATABASE_URL set: ${process.env.DATABASE_URL ? "yes" : "no"}`)

if (!target.hosted || isEmbeddedPostgres()) {
  console.error("Refusing to inspect a non-hosted database.")
  process.exit(1)
}

const db = getDb()
const [counts] = await db.select({ n: sql`count(*)::int` }).from(users).where(eq(users.role, "admin"))
console.log(`admin accounts: ${counts.n}`)

const demo = await db
  .select({ role: users.role, status: users.status, emailVerified: users.emailVerified })
  .from(users)
  .where(eq(users.email, "admin@volunteerconnect.org"))
  .limit(1)

if (demo[0]) {
  console.log("seeded demo admin present: yes")
  console.log(`seeded demo admin role: ${demo[0].role}`)
  console.log(`seeded demo admin status: ${demo[0].status || "active"}`)
  console.log(`seeded demo admin emailVerified: ${demo[0].emailVerified ? "yes" : "no"}`)
} else {
  console.log("seeded demo admin present: no")
}

const requested = process.env.ADMIN_EMAIL?.trim().toLowerCase()
if (requested) {
  const rows = await db
    .select({ role: users.role, status: users.status, emailVerified: users.emailVerified })
    .from(users)
    .where(eq(users.email, requested))
    .limit(1)
  if (!rows[0]) {
    console.log("requested email: not found")
  } else {
    console.log("requested email: found")
    console.log(`requested role: ${rows[0].role}`)
    console.log(`requested status: ${rows[0].status || "active"}`)
    console.log(`requested emailVerified: ${rows[0].emailVerified ? "yes" : "no"}`)
  }
}

process.exit(0)
