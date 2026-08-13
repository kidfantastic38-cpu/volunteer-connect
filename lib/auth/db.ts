import { randomUUID } from "node:crypto"
import fs from "node:fs"
import { DatabaseSync } from "node:sqlite"
import { amaraDemoSnapshot, defaultProfileSnapshot } from "@/lib/auth/defaults"
import { hashPassword } from "@/lib/auth/password"
import { normalizeEmail } from "@/lib/auth/normalize"
import { getDatabasePath, resolveDataDir } from "@/lib/auth/paths"
import type { AuthRole, AuthUser, ProfileSnapshot } from "@/lib/auth/types"

type UserRow = {
  id: string
  email: string
  password_hash: string
  name: string
  role: string
}

let db: DatabaseSync | null = null
let loggedPath = false

export { getDatabasePath }

function getDb(): DatabaseSync {
  if (db) return db
  const dataDir = resolveDataDir()
  fs.mkdirSync(dataDir, { recursive: true })
  const file = getDatabasePath()
  db = new DatabaseSync(file)
  db.exec("PRAGMA journal_mode = WAL;")
  db.exec("PRAGMA foreign_keys = ON;")
  db.exec("PRAGMA synchronous = FULL;")
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS profiles (
      user_id TEXT PRIMARY KEY,
      snapshot TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `)
  seedDemoUsers()
  if (!loggedPath) {
    loggedPath = true
    console.info(`[auth] SQLite ${file}`)
  }
  return db
}

function seedDemoUsers() {
  const exists = getDb().prepare("SELECT id FROM users WHERE email = ?")
  const insert = getDb().prepare(
    `INSERT INTO users (id, email, password_hash, name, role, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  )
  const now = new Date().toISOString()
  const seeds: [string, string, string, AuthRole][] = [
    ["user-amara", "amara@example.com", "Amara Okafor", "student"],
    ["user-admin", "admin@volunteerconnect.org", "Platform Admin", "admin"],
  ]
  for (const [id, email, name, role] of seeds) {
    if (!exists.get(email)) {
      insert.run(id, email, hashPassword("password"), name, role, now, now)
    }
    const snapshot = email === "amara@example.com" ? amaraDemoSnapshot() : defaultProfileSnapshot({ id, email, name, role })
    const current = getProfileSnapshot(id)
    const empty = !current || ((current.experiences?.length ?? 0) === 0 && (current.education?.length ?? 0) === 0)
    if (!current || (email === "amara@example.com" && empty)) {
      saveProfileSnapshot(id, snapshot)
    }
  }
}

function toUser(row: UserRow): AuthUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role as AuthRole,
  }
}

export function findUserByEmail(email: string): (AuthUser & { passwordHash: string }) | null {
  const row = getDb()
    .prepare("SELECT id, email, password_hash, name, role FROM users WHERE email = ?")
    .get(normalizeEmail(email)) as UserRow | undefined
  if (!row) return null
  return { ...toUser(row), passwordHash: row.password_hash }
}

export function findUserById(id: string): AuthUser | null {
  const row = getDb()
    .prepare("SELECT id, email, password_hash, name, role FROM users WHERE id = ?")
    .get(id) as UserRow | undefined
  return row ? toUser(row) : null
}

export function createUser(input: {
  name: string
  email: string
  password: string
  role: AuthRole
}): { user: AuthUser; snapshot: ProfileSnapshot } {
  const id = randomUUID()
  const now = new Date().toISOString()
  const email = normalizeEmail(input.email)
  const name = input.name.trim()
  const passwordHash = hashPassword(input.password)
  const database = getDb()

  const insertUser = database.prepare(
    `INSERT INTO users (id, email, password_hash, name, role, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  )
  const verifyUser = database.prepare("SELECT id, email, password_hash, name, role FROM users WHERE email = ?")
  const insertProfile = database.prepare(
    `INSERT INTO profiles (user_id, snapshot, updated_at) VALUES (?, ?, ?)`,
  )

  database.exec("BEGIN IMMEDIATE")
  try {
    insertUser.run(id, email, passwordHash, name, input.role, now, now)
    const row = verifyUser.get(email) as UserRow | undefined
    if (!row || row.id !== id) {
      throw new Error("Registration did not write to the users table.")
    }
    const user = toUser(row)
    const snapshot = defaultProfileSnapshot(user)
    insertProfile.run(id, JSON.stringify(snapshot), now)
    database.exec("COMMIT")
  } catch (err) {
    if (database.isTransaction) database.exec("ROLLBACK")
    throw err
  }

  const confirmed = verifyUser.get(email) as UserRow | undefined
  if (!confirmed || confirmed.id !== id) {
    throw new Error("Registration did not commit to the users table.")
  }
  const user = toUser(confirmed)
  const snapshot = getProfileSnapshot(id) ?? defaultProfileSnapshot(user)
  return { user, snapshot }
}

export function updateUserPassword(id: string, password: string) {
  getDb()
    .prepare("UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?")
    .run(hashPassword(password), new Date().toISOString(), id)
}

export function updateUserName(id: string, name: string) {
  getDb()
    .prepare("UPDATE users SET name = ?, updated_at = ? WHERE id = ?")
    .run(name.trim(), new Date().toISOString(), id)
}

export function getProfileSnapshot(userId: string): ProfileSnapshot | null {
  const row = getDb().prepare("SELECT snapshot FROM profiles WHERE user_id = ?").get(userId) as
    | { snapshot: string }
    | undefined
  if (!row) return null
  try {
    return JSON.parse(row.snapshot) as ProfileSnapshot
  } catch {
    return null
  }
}

export function saveProfileSnapshot(userId: string, snapshot: ProfileSnapshot) {
  const now = new Date().toISOString()
  getDb()
    .prepare(
      `INSERT INTO profiles (user_id, snapshot, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET snapshot = excluded.snapshot, updated_at = excluded.updated_at`,
    )
    .run(userId, JSON.stringify(snapshot), now)
}
