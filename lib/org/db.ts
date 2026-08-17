import { randomUUID } from "node:crypto"
import { desc, eq } from "drizzle-orm"
import { normalizeEmail } from "@/lib/auth/normalize"
import { getDb } from "@/lib/db/client"
import { organizations, users, verificationRequests } from "@/lib/db/schema"
import type {
  Organization,
  OrganizationInput,
  OrganizationType,
  VerificationListItem,
  VerificationRequest,
  VerificationStatus,
} from "@/lib/org/types"
import { ORGANIZATION_TYPES } from "@/lib/org/types"
import { safeHttpUrl } from "@/lib/security/urls"

export function isOrganizationType(value: string): value is OrganizationType {
  return (ORGANIZATION_TYPES as readonly string[]).includes(value)
}

function toOrg(row: typeof organizations.$inferSelect): Organization {
  return {
    id: row.id,
    ownerId: row.ownerId,
    name: row.name,
    organizationType: row.organizationType as OrganizationType,
    organizationEmail: row.organizationEmail,
    phone: row.phone,
    website: safeHttpUrl(row.website),
    registrationNumber: row.registrationNumber,
    address: row.address,
    logoUrl: safeHttpUrl(row.logoUrl),
    verificationStatus: row.verificationStatus as VerificationStatus,
    suspended: Boolean(row.suspended),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export async function findOrganizationByOwner(ownerId: string): Promise<Organization | null> {
  const [row] = await getDb().select().from(organizations).where(eq(organizations.ownerId, ownerId)).limit(1)
  return row ? toOrg(row) : null
}

export async function findOrganizationById(id: string): Promise<Organization | null> {
  const [row] = await getDb().select().from(organizations).where(eq(organizations.id, id)).limit(1)
  return row ? toOrg(row) : null
}

export async function createOrganization(ownerId: string, input: OrganizationInput): Promise<Organization> {
  const id = randomUUID()
  const stamp = new Date().toISOString()
  await getDb().insert(organizations).values({
    id,
    ownerId,
    name: input.name.trim(),
    organizationType: input.organizationType,
    organizationEmail: normalizeEmail(input.organizationEmail),
    phone: input.phone.trim(),
    website: safeHttpUrl(input.website),
    registrationNumber: (input.registrationNumber ?? "").trim(),
    address: input.address.trim(),
    logoUrl: safeHttpUrl(input.logoUrl),
    verificationStatus: "pending",
    createdAt: stamp,
    updatedAt: stamp,
  })
  await createVerificationRequest(id)
  const org = await findOrganizationById(id)
  if (!org) throw new Error("Organization was not saved.")
  return org
}

export async function updateOrganization(ownerId: string, input: Partial<OrganizationInput>): Promise<Organization | null> {
  const current = await findOrganizationByOwner(ownerId)
  if (!current) return null
  await getDb()
    .update(organizations)
    .set({
      name: (input.name ?? current.name).trim(),
      organizationType: input.organizationType ?? current.organizationType,
      organizationEmail: normalizeEmail(input.organizationEmail ?? current.organizationEmail),
      phone: (input.phone ?? current.phone).trim(),
      website: safeHttpUrl(input.website ?? current.website),
      registrationNumber: (input.registrationNumber ?? current.registrationNumber).trim(),
      address: (input.address ?? current.address).trim(),
      logoUrl: safeHttpUrl(input.logoUrl ?? current.logoUrl),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(organizations.ownerId, ownerId))
  return findOrganizationByOwner(ownerId)
}

export async function createVerificationRequest(organizationId: string): Promise<VerificationRequest> {
  const id = randomUUID()
  const stamp = new Date().toISOString()
  await getDb().insert(verificationRequests).values({
    id,
    organizationId,
    submittedAt: stamp,
    reviewedBy: null,
    status: "pending",
    notes: "",
  })
  return { id, organizationId, submittedAt: stamp, reviewedBy: null, status: "pending", notes: "" }
}

export async function listVerificationRequests(): Promise<VerificationListItem[]> {
  const rows = await getDb()
    .select({
      requestId: verificationRequests.id,
      organizationId: organizations.id,
      organizationName: organizations.name,
      ownerName: users.name,
      ownerEmail: users.email,
      organizationEmail: organizations.organizationEmail,
      website: organizations.website,
      registrationNumber: organizations.registrationNumber,
      submittedAt: verificationRequests.submittedAt,
      status: organizations.verificationStatus,
      notes: verificationRequests.notes,
    })
    .from(verificationRequests)
    .innerJoin(organizations, eq(organizations.id, verificationRequests.organizationId))
    .innerJoin(users, eq(users.id, organizations.ownerId))
    .orderBy(desc(verificationRequests.submittedAt))

  const seen = new Set<string>()
  const latest: VerificationListItem[] = []
  for (const row of rows) {
    if (seen.has(row.organizationId)) continue
    seen.add(row.organizationId)
    latest.push({
      requestId: row.requestId,
      organizationId: row.organizationId,
      organizationName: row.organizationName,
      ownerName: row.ownerName,
      ownerEmail: row.ownerEmail,
      organizationEmail: row.organizationEmail,
      website: row.website,
      registrationNumber: row.registrationNumber,
      submittedAt: row.submittedAt,
      status: row.status as VerificationStatus,
      notes: row.notes,
    })
  }
  return latest
}

export async function reviewVerification(input: {
  organizationId: string
  reviewerId: string
  status: VerificationStatus
  notes?: string
}): Promise<Organization | null> {
  const org = await findOrganizationById(input.organizationId)
  if (!org) return null
  const notes = (input.notes ?? "").trim()
  const db = getDb()
  await db
    .update(organizations)
    .set({ verificationStatus: input.status, updatedAt: new Date().toISOString() })
    .where(eq(organizations.id, input.organizationId))
  const [latest] = await db
    .select({ id: verificationRequests.id })
    .from(verificationRequests)
    .where(eq(verificationRequests.organizationId, input.organizationId))
    .orderBy(desc(verificationRequests.submittedAt))
    .limit(1)
  if (latest) {
    await db
      .update(verificationRequests)
      .set({ status: input.status, reviewedBy: input.reviewerId, notes })
      .where(eq(verificationRequests.id, latest.id))
  }
  return findOrganizationById(input.organizationId)
}

export async function organizationBadgeMap(): Promise<Record<string, VerificationStatus>> {
  const rows = await getDb()
    .select({ name: organizations.name, verificationStatus: organizations.verificationStatus })
    .from(organizations)
    .where(eq(organizations.verificationStatus, "approved"))
  const map: Record<string, VerificationStatus> = {}
  for (const row of rows) map[row.name.toLowerCase()] = row.verificationStatus as VerificationStatus
  return map
}

export async function approvedOrganizationNames(): Promise<string[]> {
  const rows = await getDb()
    .select({ name: organizations.name })
    .from(organizations)
    .where(eq(organizations.verificationStatus, "approved"))
  return rows.map((row) => row.name)
}
