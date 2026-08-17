import { loadEnvFiles } from "./load-env.mjs"
import { runMigrations } from "../lib/db/migrate.ts"

loadEnvFiles()
await runMigrations()
console.log("Migrations applied.")
