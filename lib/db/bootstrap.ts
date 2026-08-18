import { seedDemoUsers } from "@/lib/auth/db"
import { ensureLocalSchema } from "@/lib/db/client"
import { seedCatalogOpportunities } from "@/lib/opportunities/seed"
import { allowDevSeed } from "@/lib/runtime/env"

const BOOT_GEN = 3
const globalForBoot = globalThis as unknown as { vcBoot?: Promise<void>; vcBootGen?: number }

export async function bootstrapDatabase() {
  await ensureLocalSchema()
  if (!allowDevSeed()) return
  await seedDemoUsers()
  await seedCatalogOpportunities()
}

/** Insert-if-absent demo data. Safe to call on every request. */
export function ensureBootstrapped() {
  if (globalForBoot.vcBootGen !== BOOT_GEN) {
    globalForBoot.vcBoot = undefined
    globalForBoot.vcBootGen = BOOT_GEN
  }
  if (!globalForBoot.vcBoot) {
    globalForBoot.vcBoot = bootstrapDatabase().catch((err) => {
      globalForBoot.vcBoot = undefined
      throw err
    })
  }
  return globalForBoot.vcBoot
}
