import { randomUUID } from "node:crypto"
import { and, desc, eq, ilike, or, sql } from "drizzle-orm"
import { getDb } from "@/lib/db/client"
import { opportunities, organizations } from "@/lib/db/schema"
import { canApplyToStatus, isOppType, normalizeOppStatus, type OppStatus, type OppType } from "@/lib/opportunities/status"

export { OPP_STATUSES, OPP_TYPES, isOppStatus, isOppType, normalizeOppStatus, type OppStatus, type OppType } from "@/lib/opportunities/status"

export type OpportunityRecord = {
  id: string
  organizationId: string
  org: string
  title: string
  type: OppType
  description: string
  location: string
  remote: boolean
  requirements: string
  skills: string[]
  deadline: string
  compensation?: string
  status: OppStatus
  applicants: number
  createdAt: string
  updatedAt: string
}

function toRecord(
  row: typeof opportunities.$inferSelect & { orgName?: string | null; applicants?: number | null },
): OpportunityRecord {
  return {
    id: row.id,
    organizationId: row.organizationId,
    org: row.orgName ?? "",
    title: row.title,
    type: row.type as OppType,
    description: row.description,
    location: row.location,
    remote: row.remote,
    requirements: row.requirements,
    skills: row.skillsRequired ?? [],
    deadline: row.deadline,
    compensation: row.compensation || undefined,
    status: normalizeOppStatus(row.status),
    applicants: Number(row.applicants ?? 0),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export async function listOpportunities(input?: {
  query?: string
  type?: string
  location?: string
  remote?: boolean
  skill?: string
  organizationId?: string
  includeArchived?: boolean
  includeDrafts?: boolean
  publishedOnly?: boolean
}): Promise<OpportunityRecord[]> {
  const db = getDb()
  const filters = []
  if (input?.publishedOnly) {
    filters.push(or(eq(opportunities.status, "published"), eq(opportunities.status, "open")) ?? sql`true`)
  } else if (!input?.includeArchived && !input?.includeDrafts) {
    filters.push(or(eq(opportunities.status, "published"), eq(opportunities.status, "open")) ?? sql`true`)
  }
  if (input?.type && isOppType(input.type)) filters.push(eq(opportunities.type, input.type))
  if (input?.organizationId) filters.push(eq(opportunities.organizationId, input.organizationId))
  if (input?.location?.trim()) filters.push(ilike(opportunities.location, `%${input.location.trim()}%`))
  if (input?.remote === true) filters.push(eq(opportunities.remote, true))
  if (input?.query?.trim()) {
    const q = `%${input.query.trim()}%`
    filters.push(
      or(ilike(opportunities.title, q), ilike(opportunities.description, q), ilike(organizations.name, q)) ?? sql`true`,
    )
  }

  const rows = await db
    .select({
      opportunity: opportunities,
      orgName: organizations.name,
      applicants: sql<number>`(select count(*) from applications a where a.opportunity_id = ${opportunities.id})`,
    })
    .from(opportunities)
    .innerJoin(organizations, eq(organizations.id, opportunities.organizationId))
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(opportunities.createdAt))

  let records = rows.map((row) => toRecord({ ...row.opportunity, orgName: row.orgName, applicants: row.applicants }))
  if (input?.skill?.trim()) {
    const skill = input.skill.trim().toLowerCase()
    records = records.filter((item) => item.skills.some((name) => name.toLowerCase().includes(skill)))
  }
  if (!input?.includeArchived) {
    records = records.filter((item) => item.status !== "archived")
  }
  if (!input?.includeDrafts && !input?.organizationId) {
    records = records.filter((item) => item.status !== "draft")
  }
  return records
}

export async function getOpportunity(id: string): Promise<OpportunityRecord | null> {
  const [row] = await getDb()
    .select({
      opportunity: opportunities,
      orgName: organizations.name,
      applicants: sql<number>`(select count(*) from applications a where a.opportunity_id = ${opportunities.id})`,
    })
    .from(opportunities)
    .innerJoin(organizations, eq(organizations.id, opportunities.organizationId))
    .where(eq(opportunities.id, id))
    .limit(1)
  return row ? toRecord({ ...row.opportunity, orgName: row.orgName, applicants: row.applicants }) : null
}

export async function createOpportunity(input: {
  organizationId: string
  title: string
  type: OppType
  description: string
  location: string
  remote: boolean
  requirements?: string
  skills: string[]
  deadline: string
  compensation?: string
  status?: OppStatus
}): Promise<OpportunityRecord> {
  const id = randomUUID()
  const stamp = new Date().toISOString()
  await getDb().insert(opportunities).values({
    id,
    organizationId: input.organizationId,
    title: input.title,
    type: input.type,
    description: input.description,
    location: input.location,
    remote: input.remote,
    requirements: input.requirements ?? "",
    skillsRequired: input.skills,
    deadline: input.deadline,
    compensation: input.compensation ?? "",
    status: input.status === "draft" ? "draft" : "published",
    createdAt: stamp,
    updatedAt: stamp,
  })
  const created = await getOpportunity(id)
  if (!created) throw new Error("Opportunity was not saved.")
  return created
}

export async function updateOpportunity(
  id: string,
  input: Partial<{
    title: string
    type: OppType
    description: string
    location: string
    remote: boolean
    requirements: string
    skills: string[]
    deadline: string
    compensation: string
    status: OppStatus
  }>,
): Promise<OpportunityRecord | null> {
  const current = await getOpportunity(id)
  if (!current) return null
  await getDb()
    .update(opportunities)
    .set({
      title: input.title ?? current.title,
      type: input.type ?? current.type,
      description: input.description ?? current.description,
      location: input.location ?? current.location,
      remote: input.remote ?? current.remote,
      requirements: input.requirements ?? current.requirements,
      skillsRequired: input.skills ?? current.skills,
      deadline: input.deadline ?? current.deadline,
      compensation: input.compensation ?? current.compensation ?? "",
      status: input.status ? normalizeOppStatus(input.status) : current.status,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(opportunities.id, id))
  return getOpportunity(id)
}

export async function archiveOpportunity(id: string): Promise<OpportunityRecord | null> {
  return updateOpportunity(id, { status: "archived" })
}

export function isDeadlineOpen(deadline: string): boolean {
  if (!deadline || deadline === "Open") return true
  const ts = Date.parse(deadline)
  if (Number.isNaN(ts)) return true
  return ts >= Date.now() - 24 * 60 * 60 * 1000
}

export function isAcceptingApplications(opportunity: Pick<OpportunityRecord, "status" | "deadline">): boolean {
  return canApplyToStatus(opportunity.status) && isDeadlineOpen(opportunity.deadline)
}

export function canViewOpportunity(
  opportunity: Pick<OpportunityRecord, "status" | "organizationId">,
  viewer: { role: string; organizationId?: string | null } | null,
): boolean {
  const status = normalizeOppStatus(opportunity.status)
  if (status === "published" || status === "closed") return true
  if (!viewer) return false
  if (viewer.role === "admin") return true
  return Boolean(viewer.organizationId && viewer.organizationId === opportunity.organizationId)
}
