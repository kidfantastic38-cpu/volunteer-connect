import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { PGlite } from "@electric-sql/pglite"
import { neon } from "@neondatabase/serverless"
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http"
import { drizzle as drizzlePglite } from "drizzle-orm/pglite"
import { drizzle as drizzlePg } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { resolveDataDir } from "@/lib/auth/paths"
import * as schema from "@/lib/db/schema"

export type AppDb =
  | ReturnType<typeof drizzlePg<typeof schema>>
  | ReturnType<typeof drizzleNeon<typeof schema>>
  | ReturnType<typeof drizzlePglite<typeof schema>>

const SCHEMA_GEN = 2

const globalForDb = globalThis as unknown as {
  vcDb?: AppDb
  vcPglite?: PGlite
  vcPgliteReady?: Promise<void>
  vcSchemaGen?: number
}

export function isEmbeddedPostgres(): boolean {
  if (process.env.NODE_ENV === "production") return false
  if (process.env.DATABASE_DRIVER === "pglite") return true
  if (process.env.DATABASE_DRIVER === "postgres" || process.env.DATABASE_DRIVER === "neon") return false
  const url = process.env.DATABASE_URL ?? ""
  return !url || url.includes("127.0.0.1") || url.includes("localhost")
}

export function requireDatabaseUrl(): string {
  if (isEmbeddedPostgres()) return "pglite"
  const url = process.env.DATABASE_URL?.trim()
  if (url) return url
  if (process.env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL is required in production. Local SQLite is not used on Vercel.")
  }
  throw new Error(
    "DATABASE_URL is required. Start local Postgres with docker compose -f docker-compose.yml up -d, or set a Neon/Vercel Postgres URL.",
  )
}

function pglitePath() {
  return path.join(resolveDataDir(), "pglite")
}

function createDb(): AppDb {
  if (isEmbeddedPostgres()) {
    const client = globalForDb.vcPglite ?? new PGlite(pglitePath())
    globalForDb.vcPglite = client
    return drizzlePglite(client, { schema })
  }
  const url = requireDatabaseUrl()
  const driver = process.env.DATABASE_DRIVER?.trim()
  const useNeon = driver === "neon" || (driver !== "postgres" && url.includes("neon.tech"))
  if (useNeon) {
    return drizzleNeon(neon(url), { schema })
  }
  const conn = postgres(url, {
    max: process.env.NODE_ENV === "production" ? 1 : 5,
    prepare: false,
  })
  return drizzlePg(conn, { schema })
}

export function getDb(): AppDb {
  if (globalForDb.vcDb) return globalForDb.vcDb
  const db = createDb()
  globalForDb.vcDb = db
  return db
}

export async function ensureLocalSchema() {
  if (!isEmbeddedPostgres()) return
  getDb()
  const client = globalForDb.vcPglite
  if (!client) return
  if (globalForDb.vcSchemaGen !== SCHEMA_GEN) {
    globalForDb.vcPgliteReady = undefined
    globalForDb.vcSchemaGen = SCHEMA_GEN
  }
  if (!globalForDb.vcPgliteReady) {
    globalForDb.vcPgliteReady = (async () => {
      const dir = path.join(process.cwd(), "drizzle")
      const files = readdirSync(dir)
        .filter((file) => file.endsWith(".sql"))
        .sort()
      for (const file of files) {
        await client.exec(readFileSync(path.join(dir, file), "utf8"))
      }
    })()
  }
  await globalForDb.vcPgliteReady
}
