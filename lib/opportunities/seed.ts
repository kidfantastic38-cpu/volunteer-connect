import { eq } from "drizzle-orm"
import { getDb } from "@/lib/db/client"
import { opportunities } from "@/lib/db/schema"
import { findOrganizationByOwner, reviewVerification } from "@/lib/org/db"
import { findUserByEmail } from "@/lib/auth/db"
import { createOpportunity, type OppType } from "@/lib/opportunities/store"

const CATALOG: {
  ownerEmail: string
  title: string
  type: OppType
  location: string
  remote: boolean
  description: string
  skills: string[]
  deadline: string
  compensation?: string
}[] = [
  {
    ownerEmail: "hello@earthwise.org",
    title: "Sustainability Programme Assistant",
    type: "job",
    location: "Manchester, UK",
    remote: false,
    description: "Support the delivery of community sustainability programmes and volunteer coordination.",
    skills: ["Leadership", "Organization", "Communication", "Teamwork"],
    deadline: "2026-09-15",
    compensation: "£23,000 / year",
  },
  {
    ownerEmail: "hello@earthwise.org",
    title: "Community Garden Coordinator",
    type: "volunteering",
    location: "Manchester, UK",
    remote: false,
    description: "Help run weekend garden sessions and mentor new volunteers.",
    skills: ["Leadership", "Teamwork", "Organization"],
    deadline: "2026-12-31",
  },
  {
    ownerEmail: "hello@earthwise.org",
    title: "Digital Marketing Internship",
    type: "internship",
    location: "Remote",
    remote: true,
    description: "12-week paid internship running social campaigns for climate-focused programmes.",
    skills: ["Content Creation", "Analytics", "Creativity", "Communication"],
    deadline: "2026-08-30",
    compensation: "£1,400 / month",
  },
  {
    ownerEmail: "hello@earthwise.org",
    title: "Youth Leadership Scholarship",
    type: "scholarship",
    location: "UK-wide",
    remote: true,
    description: "£5,000 scholarship for young people demonstrating exceptional community leadership.",
    skills: ["Leadership", "Communication", "Problem Solving"],
    deadline: "2026-10-01",
    compensation: "£5,000 award",
  },
  {
    ownerEmail: "hello@earthwise.org",
    title: "Weekend Food Bank Volunteer",
    type: "volunteering",
    location: "Manchester, UK",
    remote: false,
    description: "Help sort and distribute food parcels to local families every Saturday.",
    skills: ["Teamwork", "Organization"],
    deadline: "2026-12-31",
  },
  {
    ownerEmail: "hello@earthwise.org",
    title: "Communications Assistant",
    type: "job",
    location: "Leeds, UK",
    remote: false,
    description: "Draft newsletters, manage the events calendar and support the small comms team.",
    skills: ["Communication", "Content Creation", "Organization"],
    deadline: "2026-09-10",
    compensation: "£21,500 / year",
  },
]

export async function approveDemoEmployer() {
  const owner = await findUserByEmail("hello@earthwise.org")
  if (!owner) return
  const org = await findOrganizationByOwner(owner.id)
  if (!org || org.verificationStatus === "approved") return
  const admin = await findUserByEmail("admin@volunteerconnect.org")
  await reviewVerification({
    organizationId: org.id,
    reviewerId: admin?.id ?? owner.id,
    status: "approved",
    notes: "Demo seed — EarthWise is the reference verified employer.",
  })
}

export async function seedCatalogOpportunities() {
  await approveDemoEmployer()
  const owner = await findUserByEmail("hello@earthwise.org")
  if (!owner) return
  const org = await findOrganizationByOwner(owner.id)
  if (!org) return
  const existing = await getDb()
    .select({ id: opportunities.id, title: opportunities.title })
    .from(opportunities)
    .where(eq(opportunities.organizationId, org.id))
  const titles = new Set(existing.map((row) => row.title))
  for (const item of CATALOG) {
    if (titles.has(item.title)) continue
    await createOpportunity({
      organizationId: org.id,
      title: item.title,
      type: item.type,
      description: item.description,
      location: item.location,
      remote: item.remote,
      skills: item.skills,
      deadline: item.deadline,
      compensation: item.compensation,
    })
  }
}
