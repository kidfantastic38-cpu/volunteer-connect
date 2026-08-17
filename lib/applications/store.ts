import { randomUUID } from "node:crypto"
import { and, desc, eq } from "drizzle-orm"
import { getDb } from "@/lib/db/client"
import { applications, opportunities, organizations, savedOpportunities, users } from "@/lib/db/schema"
import { getOpportunity, isAcceptingApplications } from "@/lib/opportunities/store"
import { createNotification } from "@/lib/notifications/create"
import { findOrganizationById } from "@/lib/org/db"
import { isActiveApplication, normalizeAppStatus, type AppStatus } from "@/lib/applications/status"

export { APP_STATUSES, isAppStatus, normalizeAppStatus, type AppStatus } from "@/lib/applications/status"

export type ApplicationRecord = {
  id: string
  opportunityId: string
  studentId: string
  status: AppStatus | "saved"
  coverMessage: string
  appliedAt: string
  updatedAt: string
  opportunityTitle?: string
  organizationName?: string
  studentName?: string
  studentEmail?: string
}


export async function findApplication(opportunityId: string, studentId: string) {
  const [row] = await getDb()
    .select()
    .from(applications)
    .where(and(eq(applications.opportunityId, opportunityId), eq(applications.studentId, studentId)))
    .limit(1)
  return row ?? null
}

export async function getApplicationById(id: string): Promise<ApplicationRecord | null> {
  const [row] = await getDb()
    .select({
      application: applications,
      opportunityTitle: opportunities.title,
      organizationName: organizations.name,
      organizationId: organizations.id,
      studentName: users.name,
      studentEmail: users.email,
    })
    .from(applications)
    .innerJoin(opportunities, eq(opportunities.id, applications.opportunityId))
    .innerJoin(organizations, eq(organizations.id, opportunities.organizationId))
    .innerJoin(users, eq(users.id, applications.studentId))
    .where(eq(applications.id, id))
    .limit(1)
  if (!row) return null
  return {
    id: row.application.id,
    opportunityId: row.application.opportunityId,
    studentId: row.application.studentId,
    status: normalizeAppStatus(row.application.status),
    coverMessage: row.application.coverMessage,
    appliedAt: row.application.appliedAt,
    updatedAt: row.application.updatedAt,
    opportunityTitle: row.opportunityTitle,
    organizationName: row.organizationName,
    studentName: row.studentName,
    studentEmail: row.studentEmail,
  }
}

export async function listStudentApplications(studentId: string): Promise<ApplicationRecord[]> {
  const rows = await getDb()
    .select({
      application: applications,
      opportunityTitle: opportunities.title,
      organizationName: organizations.name,
    })
    .from(applications)
    .innerJoin(opportunities, eq(opportunities.id, applications.opportunityId))
    .innerJoin(organizations, eq(organizations.id, opportunities.organizationId))
    .where(eq(applications.studentId, studentId))
    .orderBy(desc(applications.updatedAt))

  const saved = await getDb()
    .select({
      opportunityId: savedOpportunities.opportunityId,
      createdAt: savedOpportunities.createdAt,
      opportunityTitle: opportunities.title,
      organizationName: organizations.name,
    })
    .from(savedOpportunities)
    .innerJoin(opportunities, eq(opportunities.id, savedOpportunities.opportunityId))
    .innerJoin(organizations, eq(organizations.id, opportunities.organizationId))
    .where(eq(savedOpportunities.userId, studentId))

  const appliedIds = new Set(rows.map((row) => row.application.opportunityId))
  return [
    ...rows.map((row) => ({
      id: row.application.id,
      opportunityId: row.application.opportunityId,
      studentId,
      status: normalizeAppStatus(row.application.status),
      coverMessage: row.application.coverMessage,
      appliedAt: row.application.appliedAt,
      updatedAt: row.application.updatedAt,
      opportunityTitle: row.opportunityTitle,
      organizationName: row.organizationName,
    })),
    ...saved
      .filter((row) => !appliedIds.has(row.opportunityId))
      .map((row) => ({
        id: `saved:${row.opportunityId}`,
        opportunityId: row.opportunityId,
        studentId,
        status: "saved" as const,
        coverMessage: "",
        appliedAt: row.createdAt,
        updatedAt: row.createdAt,
        opportunityTitle: row.opportunityTitle,
        organizationName: row.organizationName,
      })),
  ]
}

export async function listAllApplications(): Promise<ApplicationRecord[]> {
  const rows = await getDb()
    .select({
      application: applications,
      opportunityTitle: opportunities.title,
      organizationName: organizations.name,
      studentName: users.name,
      studentEmail: users.email,
    })
    .from(applications)
    .innerJoin(opportunities, eq(opportunities.id, applications.opportunityId))
    .innerJoin(organizations, eq(organizations.id, opportunities.organizationId))
    .innerJoin(users, eq(users.id, applications.studentId))
    .orderBy(desc(applications.appliedAt))

  return rows.map((row) => ({
    id: row.application.id,
    opportunityId: row.application.opportunityId,
    studentId: row.application.studentId,
    status: normalizeAppStatus(row.application.status),
    coverMessage: row.application.coverMessage,
    appliedAt: row.application.appliedAt,
    updatedAt: row.application.updatedAt,
    opportunityTitle: row.opportunityTitle,
    organizationName: row.organizationName,
    studentName: row.studentName,
    studentEmail: row.studentEmail,
  }))
}

export async function listOrganizationApplications(organizationId: string): Promise<ApplicationRecord[]> {
  const rows = await getDb()
    .select({
      application: applications,
      opportunityTitle: opportunities.title,
      organizationName: organizations.name,
      studentName: users.name,
      studentEmail: users.email,
    })
    .from(applications)
    .innerJoin(opportunities, eq(opportunities.id, applications.opportunityId))
    .innerJoin(organizations, eq(organizations.id, opportunities.organizationId))
    .innerJoin(users, eq(users.id, applications.studentId))
    .where(eq(organizations.id, organizationId))
    .orderBy(desc(applications.appliedAt))

  return rows.map((row) => ({
    id: row.application.id,
    opportunityId: row.application.opportunityId,
    studentId: row.application.studentId,
    status: normalizeAppStatus(row.application.status),
    coverMessage: row.application.coverMessage,
    appliedAt: row.application.appliedAt,
    updatedAt: row.application.updatedAt,
    opportunityTitle: row.opportunityTitle,
    organizationName: row.organizationName,
    studentName: row.studentName,
    studentEmail: row.studentEmail,
  }))
}

export async function applyToOpportunity(input: {
  studentId: string
  opportunityId: string
  coverMessage?: string
}): Promise<{ application: ApplicationRecord } | { error: string; status: number }> {
  const opportunity = await getOpportunity(input.opportunityId)
  if (!opportunity || !isAcceptingApplications(opportunity)) {
    if (opportunity && !isDeadlineOpenSafe(opportunity.deadline)) {
      return { error: "The application deadline has passed.", status: 400 }
    }
    return { error: "This opportunity is not open for applications.", status: 400 }
  }
  const existing = await findApplication(input.opportunityId, input.studentId)
  if (existing && isActiveApplication(existing.status)) {
    return { error: "You have already applied to this opportunity.", status: 409 }
  }
  const stamp = new Date().toISOString()
  const coverMessage = (input.coverMessage ?? "").trim().slice(0, 2000)
  if (existing) {
    await getDb()
      .update(applications)
      .set({
        status: "submitted",
        coverMessage,
        appliedAt: stamp,
        updatedAt: stamp,
      })
      .where(eq(applications.id, existing.id))
    const application = await getApplicationById(existing.id)
    await notifyApplicationSubmitted(application)
    return { application: application! }
  }
  const id = randomUUID()
  await getDb().insert(applications).values({
    id,
    opportunityId: input.opportunityId,
    studentId: input.studentId,
    status: "submitted",
    coverMessage,
    appliedAt: stamp,
    updatedAt: stamp,
  })
  await getDb()
    .delete(savedOpportunities)
    .where(and(eq(savedOpportunities.userId, input.studentId), eq(savedOpportunities.opportunityId, input.opportunityId)))
  const application = await getApplicationById(id)
  await notifyApplicationSubmitted(application)
  return { application: application! }
}

function isDeadlineOpenSafe(deadline: string) {
  if (!deadline || deadline === "Open") return true
  const ts = Date.parse(deadline)
  if (Number.isNaN(ts)) return true
  return ts >= Date.now() - 24 * 60 * 60 * 1000
}

async function notifyApplicationSubmitted(application: ApplicationRecord | null) {
  if (!application) return
  await createNotification({
    userId: application.studentId,
    type: "application",
    title: "Application submitted",
    message: `Your application for ${application.opportunityTitle ?? "an opportunity"} was submitted.`,
    href: "/applications",
  })
  const opportunity = await getOpportunity(application.opportunityId)
  if (!opportunity) return
  const org = await findOrganizationById(opportunity.organizationId)
  if (!org) return
  await createNotification({
    userId: org.ownerId,
    type: "application",
    title: "New application received",
    message: `${application.studentName ?? "A student"} applied to ${opportunity.title}.`,
    href: "/employer/candidates",
  })
}

export async function saveOpportunity(studentId: string, opportunityId: string) {
  const opportunity = await getOpportunity(opportunityId)
  if (!opportunity) return { error: "Opportunity not found.", status: 404 as const }
  await getDb()
    .insert(savedOpportunities)
    .values({ userId: studentId, opportunityId, createdAt: new Date().toISOString() })
    .onConflictDoNothing()
  return { ok: true as const }
}

export async function updateApplicationStatus(id: string, status: AppStatus) {
  const next = normalizeAppStatus(status)
  await getDb().update(applications).set({ status: next, updatedAt: new Date().toISOString() }).where(eq(applications.id, id))
  const application = await getApplicationById(id)
  if (application) {
    await createNotification({
      userId: application.studentId,
      type: "application",
      title: "Application update",
      message: `Your application for ${application.opportunityTitle ?? "an opportunity"} is now ${next.replace("_", " ")}.`,
      href: "/applications",
    })
  }
  return application
}

export async function organizationIdForApplication(id: string): Promise<string | null> {
  const [row] = await getDb()
    .select({ organizationId: opportunities.organizationId })
    .from(applications)
    .innerJoin(opportunities, eq(opportunities.id, applications.opportunityId))
    .where(eq(applications.id, id))
    .limit(1)
  return row?.organizationId ?? null
}
