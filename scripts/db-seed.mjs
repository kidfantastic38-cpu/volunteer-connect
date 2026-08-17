import { loadEnvFiles } from "./load-env.mjs"
import { bootstrapDatabase } from "../lib/db/bootstrap.ts"

loadEnvFiles()

if (process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production") {
  console.error("Refusing to seed production. Run pnpm db:migrate only.")
  process.exit(1)
}

await bootstrapDatabase()
console.log("Seed complete. Existing emails were not overwritten.")
