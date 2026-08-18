/**
 * Updates seeded catalog opportunity locations from UK demo values
 * to Freetown, Sierra Leone. Does not insert users or change other fields.
 */
import { loadEnvFiles } from "./load-env.mjs"
import { relocateDemoOpportunityLocations } from "../lib/opportunities/seed.ts"

loadEnvFiles()

const updated = await relocateDemoOpportunityLocations()
console.log(`Updated ${updated} demo opportunity location(s).`)
