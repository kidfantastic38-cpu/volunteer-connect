/**
 * Import existing local SQLite users into Postgres.
 * Never deletes Postgres rows. Never overwrites an existing email.
 * Usage: node scripts/db-import-sqlite.mjs [path-to-sqlite]
 */
import { existsSync } from "node:fs"
import path from "node:path"
import { DatabaseSync } from "node:sqlite"
import { loadEnvFiles } from "./load-env.mjs"
import { getDb } from "../lib/db/client.ts"
import { users, organizations, skillVerifications, uploads } from "../lib/db/schema.ts"
import { persistProfileSnapshot } from "../lib/profile/persist.ts"
import { eq } from "drizzle-orm"

loadEnvFiles()

const sqlitePath = path.resolve(process.argv[2] || path.join(process.cwd(), "data", "volunteer-connect.sqlite"))
if (!existsSync(sqlitePath)) {
  console.log(`No SQLite file at ${sqlitePath}. Nothing to import.`)
  process.exit(0)
}

function tables(db) {
  return new Set(db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map((row) => row.name))
}

function columns(db, table) {
  return new Set(db.prepare(`PRAGMA table_info(${table})`).all().map((row) => row.name))
}

const sqlite = new DatabaseSync(sqlitePath, { readOnly: true })
const present = tables(sqlite)
const pg = getDb()
const stamp = new Date().toISOString()
let importedUsers = 0
let skippedUsers = 0
let importedOrgs = 0
let importedProfiles = 0
let importedSkills = 0

if (present.has("users")) {
  const rows = sqlite.prepare("SELECT * FROM users").all()
  for (const row of rows) {
    const email = String(row.email || "").trim().toLowerCase()
    if (!email) continue
    const [existing] = await pg.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1)
    if (existing) {
      skippedUsers += 1
      continue
    }
    await pg.insert(users).values({
      id: String(row.id),
      name: String(row.name || email),
      email,
      passwordHash: String(row.password_hash || row.passwordHash || ""),
      role: String(row.role || "student"),
      emailVerified: Boolean(row.email_verified ?? row.emailVerified),
      sessionVersion: Number(row.session_version ?? row.sessionVersion ?? 1),
      createdAt: String(row.created_at ?? row.createdAt ?? stamp),
      updatedAt: String(row.updated_at ?? row.updatedAt ?? stamp),
    })
    importedUsers += 1
  }
}

if (present.has("organizations")) {
  const rows = sqlite.prepare("SELECT * FROM organizations").all()
  for (const row of rows) {
    const ownerId = String(row.owner_id || row.ownerId || "")
    if (!ownerId) continue
    const [owner] = await pg.select({ id: users.id }).from(users).where(eq(users.id, ownerId)).limit(1)
    if (!owner) continue
    const [existing] = await pg.select({ id: organizations.id }).from(organizations).where(eq(organizations.ownerId, ownerId)).limit(1)
    if (existing) continue
    await pg.insert(organizations).values({
      id: String(row.id),
      ownerId,
      name: String(row.name || "Organization"),
      organizationType: String(row.organization_type || row.organizationType || "NGO"),
      organizationEmail: String(row.organization_email || row.organizationEmail || ""),
      phone: String(row.phone || ""),
      website: String(row.website || ""),
      registrationNumber: String(row.registration_number || row.registrationNumber || ""),
      address: String(row.address || ""),
      logoUrl: String(row.logo_url || row.logoUrl || ""),
      verificationStatus: String(row.verification_status || row.verificationStatus || "pending"),
      createdAt: String(row.created_at || row.createdAt || stamp),
      updatedAt: String(row.updated_at || row.updatedAt || stamp),
    })
    importedOrgs += 1
  }
}

if (present.has("profiles")) {
  const cols = columns(sqlite, "profiles")
  const rows = sqlite.prepare("SELECT * FROM profiles").all()
  for (const row of rows) {
    const userId = String(row.user_id || row.userId || "")
    if (!userId) continue
    const [user] = await pg.select().from(users).where(eq(users.id, userId)).limit(1)
    if (!user) continue
    let snapshot = null
    if (cols.has("snapshot") && row.snapshot) {
      try {
        snapshot = JSON.parse(String(row.snapshot))
      } catch {
        snapshot = null
      }
    }
    if (snapshot && snapshot.user) {
      await persistProfileSnapshot(userId, snapshot)
      importedProfiles += 1
    }
  }
}

if (present.has("skill_verifications")) {
  const rows = sqlite.prepare("SELECT * FROM skill_verifications").all()
  for (const row of rows) {
    const userId = String(row.user_id || row.userId || "")
    const skillKey = String(row.skill_key || row.skillKey || "").trim().toLowerCase()
    if (!userId || !skillKey) continue
    const [user] = await pg.select({ id: users.id }).from(users).where(eq(users.id, userId)).limit(1)
    if (!user) continue
    await pg
      .insert(skillVerifications)
      .values({
        id: String(row.id || `${userId}-${skillKey}`),
        userId,
        skillId: null,
        skillKey,
        skillName: String(row.skill_name || row.skillName || skillKey),
        verified: Boolean(row.verified ?? 1),
        evidenceBacked: Boolean(row.evidence_backed ?? row.evidenceBacked ?? 0),
        verifiedBy: row.verified_by || row.verifiedBy || null,
        verifiedAt: String(row.verified_at || row.verifiedAt || stamp),
        source: String(row.source || "admin"),
      })
      .onConflictDoNothing()
    importedSkills += 1
  }
}

if (present.has("uploads")) {
  const rows = sqlite.prepare("SELECT * FROM uploads").all()
  for (const row of rows) {
    const id = String(row.id || "")
    const ownerId = String(row.owner_id || row.ownerId || "")
    if (!id || !ownerId) continue
    const [owner] = await pg.select({ id: users.id }).from(users).where(eq(users.id, ownerId)).limit(1)
    if (!owner) continue
    await pg
      .insert(uploads)
      .values({
        id,
        ownerId,
        originalName: String(row.original_name || row.originalName || "file"),
        storagePath: String(row.storage_path || row.stored_name || row.storedName || id),
        mimeType: String(row.mime || row.mime_type || row.mimeType || "application/octet-stream"),
        size: Number(row.size || 0),
        createdAt: String(row.created_at || row.createdAt || stamp),
      })
      .onConflictDoNothing()
  }
}

sqlite.close()
console.log(`Imported from ${sqlitePath}`)
console.log(`  users: ${importedUsers} inserted, ${skippedUsers} skipped (email already exists)`)
console.log(`  organizations: ${importedOrgs} inserted`)
console.log(`  profiles: ${importedProfiles} restored`)
console.log(`  skill verifications: ${importedSkills} considered`)
console.log("SQLite file was not deleted.")
