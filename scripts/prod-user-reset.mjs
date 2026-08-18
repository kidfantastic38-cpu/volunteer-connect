/**
 * Controlled production user reset for hosted PostgreSQL.
 * Default: preview counts only. Pass --execute to delete non-admin users in a transaction.
 * Never prints passwords, hashes, DATABASE_URL, AUTH_SECRET, OTPs, or session tokens.
 */
import postgres from "postgres"
import { del } from "@vercel/blob"
import { loadEnvFiles } from "./load-env.mjs"

loadEnvFiles()

const EXECUTE = process.argv.includes("--execute")
const SEEDED_ADMIN_EMAIL = "admin@volunteerconnect.org"

function requireHostedUrl() {
  const driver = process.env.DATABASE_DRIVER?.trim() || ""
  const url = process.env.DATABASE_URL?.trim() || ""
  if (driver === "pglite" || !url || url.includes("127.0.0.1") || url.includes("localhost")) {
    throw new Error("Refusing to run against PGlite or a local database. Set DATABASE_DRIVER=neon and DATABASE_URL for production Neon.")
  }
  return url
}

function printCounts(title, row) {
  console.log(title)
  for (const [key, value] of Object.entries(row)) {
    console.log(`  ${key}: ${value}`)
  }
}

const url = requireHostedUrl()
const driver = process.env.DATABASE_DRIVER?.trim() || (url.includes("neon.tech") ? "neon" : "postgres")
console.log(`database driver: ${driver}`)
console.log(`hosted postgres: yes`)
console.log(`mode: ${EXECUTE ? "execute" : "preview"}`)

const sql = postgres(url, { max: 1, prepare: false, ssl: "require" })

try {
  const [inventory] = await sql`
    SELECT
      (SELECT count(*)::int FROM users) AS total_users,
      (SELECT count(*)::int FROM users WHERE role = 'student') AS students,
      (SELECT count(*)::int FROM users WHERE role = 'employer') AS employers,
      (SELECT count(*)::int FROM users WHERE role = 'admin') AS admins,
      (SELECT count(*)::int FROM users WHERE coalesce(status, 'active') = 'active') AS active_users,
      (SELECT count(*)::int FROM users WHERE coalesce(status, 'active') <> 'active') AS inactive_or_suspended_users,
      (SELECT count(*)::int FROM organizations) AS organizations,
      (SELECT count(*)::int FROM opportunities) AS opportunities,
      (SELECT count(*)::int FROM applications) AS applications,
      (SELECT count(*)::int FROM uploads) AS uploads,
      (SELECT count(*)::int FROM profiles) AS profiles,
      (SELECT count(*)::int FROM education) AS education,
      (SELECT count(*)::int FROM experiences) AS experiences,
      (SELECT count(*)::int FROM projects) AS projects,
      (SELECT count(*)::int FROM achievements) AS achievements,
      (SELECT count(*)::int FROM skills) AS user_skills,
      (SELECT count(*)::int FROM skill_verifications) AS skill_verifications,
      (SELECT count(*)::int FROM saved_opportunities) AS saved_opportunities,
      (SELECT count(*)::int FROM notifications) AS notifications,
      (SELECT count(*)::int FROM email_codes) AS email_codes,
      (SELECT count(*)::int FROM verification_requests) AS verification_requests,
      (SELECT count(*)::int FROM admin_audit_log) AS admin_audit_log,
      (SELECT count(*)::int FROM skill_catalog) AS skill_catalog,
      (SELECT count(*)::int FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'skill_catalog') AS skill_catalog_table
  `

  printCounts("inventory", inventory)

  const admins = await sql`
    SELECT role, coalesce(status, 'active') AS status, email_verified
    FROM users
    WHERE role = 'admin'
  `
  console.log("admin exists: " + (admins.length > 0 ? "YES" : "NO"))
  console.log("admin count: " + admins.length)
  if (admins.length === 1) {
    console.log("role = admin: " + (admins[0].role === "admin" ? "YES" : "NO"))
    console.log("status = active: " + (admins[0].status === "active" ? "YES" : "NO"))
  } else if (admins.length > 1) {
    const allAdmin = admins.every((row) => row.role === "admin")
    const allActive = admins.every((row) => row.status === "active")
    console.log("role = admin: " + (allAdmin ? "YES" : "NO"))
    console.log("status = active: " + (allActive ? "YES" : "NO"))
  }

  const [seeded] = await sql`
    SELECT role, coalesce(status, 'active') AS status
    FROM users
    WHERE lower(email) = ${SEEDED_ADMIN_EMAIL}
    LIMIT 1
  `
  console.log("seeded demo admin present: " + (seeded ? "yes" : "no"))
  if (seeded) {
    console.log("seeded demo admin role: " + seeded.role)
    console.log("seeded demo admin status: " + seeded.status)
  }

  if (admins.length === 0) {
    console.error("STOP: no Admin account exists. Provision a permanent Admin before deleting users.")
    process.exit(2)
  }

  const [preview] = await sql`
    WITH doomed AS (
      SELECT id, role FROM users WHERE role <> 'admin'
    ),
    doomed_orgs AS (
      SELECT o.id
      FROM organizations o
      JOIN doomed d ON d.id = o.owner_id
    ),
    doomed_opps AS (
      SELECT opp.id
      FROM opportunities opp
      JOIN doomed_orgs org ON org.id = opp.organization_id
    )
    SELECT
      (SELECT count(*)::int FROM doomed) AS users_to_delete,
      (SELECT count(*)::int FROM doomed WHERE role = 'student') AS students_to_delete,
      (SELECT count(*)::int FROM doomed WHERE role = 'employer') AS employers_to_delete,
      (SELECT count(*)::int FROM doomed WHERE role NOT IN ('student', 'employer', 'admin')) AS other_roles_to_delete,
      (SELECT count(*)::int FROM doomed_orgs) AS organizations_to_delete,
      (SELECT count(*)::int FROM doomed_opps) AS opportunities_to_delete,
      (SELECT count(*)::int FROM applications a WHERE a.student_id IN (SELECT id FROM doomed) OR a.opportunity_id IN (SELECT id FROM doomed_opps)) AS applications_to_delete,
      (SELECT count(*)::int FROM uploads u WHERE u.owner_id IN (SELECT id FROM doomed)) AS uploads_to_delete,
      (SELECT count(*)::int FROM profiles p WHERE p.user_id IN (SELECT id FROM doomed)) AS profiles_to_delete,
      (SELECT count(*)::int FROM education e WHERE e.user_id IN (SELECT id FROM doomed)) AS education_to_delete,
      (SELECT count(*)::int FROM experiences e WHERE e.user_id IN (SELECT id FROM doomed)) AS experiences_to_delete,
      (SELECT count(*)::int FROM projects p WHERE p.user_id IN (SELECT id FROM doomed)) AS projects_to_delete,
      (SELECT count(*)::int FROM achievements a WHERE a.user_id IN (SELECT id FROM doomed)) AS achievements_to_delete,
      (SELECT count(*)::int FROM skills s WHERE s.user_id IN (SELECT id FROM doomed)) AS user_skills_to_delete,
      (SELECT count(*)::int FROM skill_verifications sv WHERE sv.user_id IN (SELECT id FROM doomed)) AS skill_verifications_to_delete,
      (SELECT count(*)::int FROM saved_opportunities so WHERE so.user_id IN (SELECT id FROM doomed) OR so.opportunity_id IN (SELECT id FROM doomed_opps)) AS saved_opportunities_to_delete,
      (SELECT count(*)::int FROM notifications n WHERE n.user_id IN (SELECT id FROM doomed)) AS notifications_to_delete,
      (SELECT count(*)::int FROM email_codes c WHERE c.user_id IN (SELECT id FROM doomed)) AS email_codes_to_delete,
      (SELECT count(*)::int FROM verification_requests vr WHERE vr.organization_id IN (SELECT id FROM doomed_orgs)) AS verification_requests_to_delete,
      (SELECT count(*)::int FROM admin_audit_log l WHERE l.actor_id IN (SELECT id FROM doomed)) AS admin_audit_log_to_cascade,
      (SELECT count(*)::int FROM users WHERE role = 'admin') AS admins_to_preserve,
      (SELECT count(*)::int FROM skill_catalog) AS skill_catalog_to_preserve
  `
  printCounts("preview delete", preview)
  console.log("admin account to preserve: existing role=admin rows only")
  console.log("shared skill catalog: preserve")
  console.log("schema/migrations: preserve")

  if (!EXECUTE) {
    console.log("Preview only. Re-run with --execute to delete non-admin users in a transaction.")
    process.exit(0)
  }

  const blobUrls = await sql`
    SELECT u.storage_path
    FROM uploads u
    JOIN users usr ON usr.id = u.owner_id
    WHERE usr.role <> 'admin'
      AND u.storage_path LIKE 'http%'
  `

  await sql.begin(async (tx) => {
    const remainingAdmins = await tx`SELECT id FROM users WHERE role = 'admin' FOR UPDATE`
    if (remainingAdmins.length < 1) throw new Error("Abort: no admin row to preserve.")
    await tx`DELETE FROM users WHERE role <> 'admin'`
    const after = await tx`SELECT count(*)::int AS admins, count(*) FILTER (WHERE role <> 'admin')::int AS others FROM users`
    if (after[0].admins < 1) throw new Error("Abort: admin would be lost.")
    if (after[0].others !== 0) throw new Error("Abort: non-admin users still present.")
  })
  console.log("transaction: committed")

  let blobsDeleted = 0
  let blobErrors = 0
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim()
  if (blobUrls.length && token) {
    const urls = blobUrls.map((row) => row.storage_path).filter((value) => typeof value === "string" && value.startsWith("http"))
    if (urls.length) {
      try {
        await del(urls, { token })
        blobsDeleted = urls.length
      } catch {
        for (const one of urls) {
          try {
            await del(one, { token })
            blobsDeleted += 1
          } catch {
            blobErrors += 1
          }
        }
      }
    }
  }
  console.log(`blob objects deleted: ${blobsDeleted}`)
  console.log(`blob delete errors: ${blobErrors}`)

  const [after] = await sql`
    SELECT
      (SELECT count(*)::int FROM users) AS total_users,
      (SELECT count(*)::int FROM users WHERE role = 'student') AS students,
      (SELECT count(*)::int FROM users WHERE role = 'employer') AS employers,
      (SELECT count(*)::int FROM users WHERE role = 'admin') AS admins,
      (SELECT count(*)::int FROM organizations) AS organizations,
      (SELECT count(*)::int FROM opportunities) AS opportunities,
      (SELECT count(*)::int FROM applications) AS applications,
      (SELECT count(*)::int FROM uploads) AS uploads,
      (SELECT count(*)::int FROM profiles) AS profiles,
      (SELECT count(*)::int FROM education) AS education,
      (SELECT count(*)::int FROM experiences) AS experiences,
      (SELECT count(*)::int FROM projects) AS projects,
      (SELECT count(*)::int FROM achievements) AS achievements,
      (SELECT count(*)::int FROM skills) AS user_skills,
      (SELECT count(*)::int FROM skill_verifications) AS skill_verifications,
      (SELECT count(*)::int FROM saved_opportunities) AS saved_opportunities,
      (SELECT count(*)::int FROM notifications) AS notifications,
      (SELECT count(*)::int FROM email_codes) AS email_codes,
      (SELECT count(*)::int FROM verification_requests) AS verification_requests,
      (SELECT count(*)::int FROM skill_catalog) AS skill_catalog
  `
  printCounts("after cleanup", after)

  const leftoverAdmins = await sql`
    SELECT role, coalesce(status, 'active') AS status
    FROM users
    WHERE role = 'admin'
  `
  console.log("preserved admin exists: " + (leftoverAdmins.length > 0 ? "YES" : "NO"))
  console.log("preserved role = admin: " + (leftoverAdmins.length > 0 && leftoverAdmins.every((row) => row.role === "admin") ? "YES" : "NO"))
  console.log("preserved status = active: " + (leftoverAdmins.length > 0 && leftoverAdmins.every((row) => row.status === "active") ? "YES" : "NO"))
} finally {
  await sql.end({ timeout: 5 })
}
