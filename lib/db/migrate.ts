import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { PGlite } from "@electric-sql/pglite"
import postgres from "postgres"

function isEmbeddedPostgres() {
  if (process.env.NODE_ENV === "production") return false
  if (process.env.DATABASE_DRIVER === "pglite") return true
  if (process.env.DATABASE_DRIVER === "postgres" || process.env.DATABASE_DRIVER === "neon") return false
  const url = process.env.DATABASE_URL ?? ""
  return !url || url.includes("127.0.0.1") || url.includes("localhost")
}

function pglitePath() {
  if (process.env.VOLUNTEER_CONNECT_DATA_DIR) {
    return path.join(path.resolve(process.env.VOLUNTEER_CONNECT_DATA_DIR), "pglite")
  }
  return path.join(process.cwd(), "data", "pglite")
}

function migrationFiles() {
  const dir = path.join(process.cwd(), "drizzle")
  return readdirSync(dir)
    .filter((file) => file.endsWith(".sql"))
    .sort()
    .map((file) => ({ file, sql: readFileSync(path.join(dir, file), "utf8") }))
}

export async function runMigrations() {
  const files = migrationFiles()
  if (isEmbeddedPostgres()) {
    const client = new PGlite(pglitePath())
    try {
      for (const item of files) {
        await client.exec(item.sql)
      }
    } finally {
      await client.close()
    }
    return
  }

  const url = process.env.DATABASE_URL?.trim()
  if (!url) {
    throw new Error(
      "DATABASE_URL is required. Start local Postgres with docker compose -f docker-compose.yml up -d, or set a Neon/Vercel Postgres URL.",
    )
  }
  const sql = postgres(url, { max: 1, prepare: false })
  try {
    for (const item of files) {
      await sql.unsafe(item.sql)
    }
  } finally {
    await sql.end({ timeout: 5 })
  }
}
