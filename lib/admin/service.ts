import { randomUUID } from "node:crypto"
import { and, desc, eq, ilike, or, sql } from "drizzle-orm"
import { incrementSessionVersion } from "@/lib/auth/db"
import type { AuthRole } from "@/lib/auth/types"
import { getDb } from "@/lib/db/client"
import {
  adminAuditLog,
  applications,
  notifications,
  opportunities,
  organizations,
  profiles,
  skillCatalog,
  skillVerifications,
  skills,
  uploads,
  users,
  verificationRequests,
} from "@/lib/db/schema"
import { emailProviderConfigured } from "@/lib/email/send"
import { blobStorageEnabled } from "@/lib/security/uploads"
import { publicAppUrl } from "@/lib/runtime/app-url"
import { allowDemoOtp } from "@/lib/runtime/env"

export async function recordAdminAudit(input: {
  actorId: string
  action: string
  entityType: string
  entityId: string
  metadata?: Record<string, unknown>
}) {
  const safe = { ...(input.metadata ?? {}) }
  for (const key of Object.keys(safe)) {
    if (/password|secret|token|hash|otp|key/i.test(key)) delete safe[key]
  }
  await getDb().insert(adminAuditLog).values({
    id: randomUUID(),
    actorId: input.actorId,
    action: input.action.slice(0, 80),
    entityType: input.entityType.slice(0, 40),
    entityId: input.entityId.slice(0, 80),
    metadata: safe,
    createdAt: new Date().toISOString(),
  })
}

export async function adminDashboardStats() {
  const db = getDb()
  const [[students], [employers], [verifiedOrgs], [pendingOrgs], [opps], [published], [apps], [pendingSkills]] =
    await Promise.all([
      db.select({ n: sql<number>`count(*)::int` }).from(users).where(eq(users.role, "student")),
      db.select({ n: sql<number>`count(*)::int` }).from(users).where(eq(users.role, "employer")),
      db.select({ n: sql<number>`count(*)::int` }).from(organizations).where(eq(organizations.verificationStatus, "approved")),
      db.select({ n: sql<number>`count(*)::int` }).from(organizations).where(eq(organizations.verificationStatus, "pending")),
      db.select({ n: sql<number>`count(*)::int` }).from(opportunities),
      db.select({ n: sql<number>`count(*)::int` }).from(opportunities).where(eq(opportunities.status, "published")),
      db.select({ n: sql<number>`count(*)::int` }).from(applications),
      db
        .select({ n: sql<number>`count(*)::int` })
        .from(skills)
        .leftJoin(
          skillVerifications,
          and(eq(skillVerifications.userId, skills.userId), eq(skillVerifications.skillId, skills.id)),
        )
        .where(sql`${skillVerifications.id} is null`),
    ])
  return {
    totalStudents: students.n,
    totalEmployers: employers.n,
    verifiedEmployers: verifiedOrgs.n,
    pendingEmployerVerifications: pendingOrgs.n,
    totalOpportunities: opps.n,
    publishedOpportunities: published.n,
    totalApplications: apps.n,
    pendingSkillVerifications: pendingSkills.n,
  }
}

export async function listAdminUsers(input: { query?: string; role?: string; status?: string }) {
  const filters = []
  if (input.role === "student" || input.role === "employer" || input.role === "admin") {
    filters.push(eq(users.role, input.role))
  }
  if (input.status === "active" || input.status === "deactivated" || input.status === "suspended") {
    filters.push(eq(users.status, input.status))
  }
  if (input.query?.trim()) {
    const q = `%${input.query.trim()}%`
    filters.push(or(ilike(users.name, q), ilike(users.email, q)) ?? sql`true`)
  }
  const rows = await getDb()
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      emailVerified: users.emailVerified,
      status: users.status,
      createdAt: users.createdAt,
      headline: profiles.headline,
    })
    .from(users)
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(users.createdAt))
    .limit(200)
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    emailVerified: Boolean(row.emailVerified),
    status: row.status || "active",
    createdAt: row.createdAt,
    headline: row.headline ?? "",
  }))
}

export async function updateAdminUser(
  actorId: string,
  userId: string,
  patch: { status?: string; role?: AuthRole; confirmRoleChange?: boolean },
) {
  const [current] = await getDb().select().from(users).where(eq(users.id, userId)).limit(1)
  if (!current) return null
  if (patch.role && patch.role !== current.role && patch.confirmRoleChange !== true) {
    throw new Error("Role changes require confirmRoleChange: true.")
  }
  if (current.role === "admin" && actorId === userId && patch.role && patch.role !== "admin") {
    throw new Error("You cannot change your own admin role.")
  }
  if (current.role === "admin" && patch.role && patch.role !== "admin") {
    const [admins] = await getDb()
      .select({ n: sql<number>`count(*)::int` })
      .from(users)
      .where(eq(users.role, "admin"))
    if (admins.n <= 1) throw new Error("The last admin account cannot be demoted.")
  }
  const nextStatus = patch.status ?? current.status
  const nextRole = patch.role ?? (current.role as AuthRole)
  if (patch.status && !["active", "deactivated", "suspended"].includes(patch.status)) {
    throw new Error("Invalid status.")
  }
  if (patch.role && !["student", "employer", "admin"].includes(patch.role)) {
    throw new Error("Invalid role.")
  }
  await getDb()
    .update(users)
    .set({ status: nextStatus, role: nextRole, updatedAt: new Date().toISOString() })
    .where(eq(users.id, userId))
  if (nextStatus !== "active") await incrementSessionVersion(userId)
  await recordAdminAudit({
    actorId,
    action: patch.status ? `user.status.${nextStatus}` : `user.role.${nextRole}`,
    entityType: "user",
    entityId: userId,
    metadata: { status: nextStatus, role: nextRole },
  })
  const [row] = await getDb()
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      emailVerified: users.emailVerified,
      status: users.status,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
  return row
}

const employerSelect = {
  id: organizations.id,
  name: organizations.name,
  organizationType: organizations.organizationType,
  organizationEmail: organizations.organizationEmail,
  verificationStatus: organizations.verificationStatus,
  suspended: organizations.suspended,
  createdAt: organizations.createdAt,
  phone: organizations.phone,
  website: organizations.website,
  registrationNumber: organizations.registrationNumber,
  address: organizations.address,
  ownerId: users.id,
  ownerName: users.name,
  ownerEmail: users.email,
}

export async function listAdminEmployers() {
  return getDb()
    .select(employerSelect)
    .from(organizations)
    .innerJoin(users, eq(users.id, organizations.ownerId))
    .orderBy(desc(organizations.createdAt))
}

export async function getAdminEmployer(organizationId: string) {
  const [row] = await getDb()
    .select(employerSelect)
    .from(organizations)
    .innerJoin(users, eq(users.id, organizations.ownerId))
    .where(eq(organizations.id, organizationId))
    .limit(1)
  if (!row) return null
  const history = await getDb()
    .select({
      id: verificationRequests.id,
      status: verificationRequests.status,
      notes: verificationRequests.notes,
      submittedAt: verificationRequests.submittedAt,
      reviewedBy: verificationRequests.reviewedBy,
    })
    .from(verificationRequests)
    .where(eq(verificationRequests.organizationId, organizationId))
    .orderBy(desc(verificationRequests.submittedAt))
  return { ...row, history }
}

export async function setOrganizationSuspended(actorId: string, organizationId: string, suspended: boolean) {
  const [org] = await getDb().select().from(organizations).where(eq(organizations.id, organizationId)).limit(1)
  if (!org) return null
  await getDb()
    .update(organizations)
    .set({ suspended, updatedAt: new Date().toISOString() })
    .where(eq(organizations.id, organizationId))
  await recordAdminAudit({
    actorId,
    action: suspended ? "employer.suspended" : "employer.unsuspended",
    entityType: "organization",
    entityId: organizationId,
  })
  return { ...org, suspended }
}

export async function listAdminOpportunities() {
  const rows = await getDb()
    .select({
      id: opportunities.id,
      title: opportunities.title,
      type: opportunities.type,
      status: opportunities.status,
      createdAt: opportunities.createdAt,
      deadline: opportunities.deadline,
      organizationId: organizations.id,
      organizationName: organizations.name,
      applicants: sql<number>`count(${applications.id})::int`,
    })
    .from(opportunities)
    .innerJoin(organizations, eq(organizations.id, opportunities.organizationId))
    .leftJoin(applications, eq(applications.opportunityId, opportunities.id))
    .groupBy(
      opportunities.id,
      opportunities.title,
      opportunities.type,
      opportunities.status,
      opportunities.createdAt,
      opportunities.deadline,
      organizations.id,
      organizations.name,
    )
    .orderBy(desc(opportunities.createdAt))
    .limit(300)
  return rows
}

export async function moderateOpportunity(actorId: string, opportunityId: string, status: "published" | "closed" | "archived") {
  const [current] = await getDb().select().from(opportunities).where(eq(opportunities.id, opportunityId)).limit(1)
  if (!current) return null
  await getDb()
    .update(opportunities)
    .set({ status, updatedAt: new Date().toISOString() })
    .where(eq(opportunities.id, opportunityId))
  await recordAdminAudit({
    actorId,
    action: `opportunity.${status}`,
    entityType: "opportunity",
    entityId: opportunityId,
    metadata: { previousStatus: current.status },
  })
  const [row] = await getDb().select().from(opportunities).where(eq(opportunities.id, opportunityId)).limit(1)
  return row
}

export async function listAdminApplications(input: { status?: string; opportunityId?: string; organizationId?: string; query?: string }) {
  const filters = []
  if (input.status?.trim()) filters.push(eq(applications.status, input.status.trim()))
  if (input.opportunityId?.trim()) filters.push(eq(applications.opportunityId, input.opportunityId.trim()))
  if (input.organizationId?.trim()) filters.push(eq(opportunities.organizationId, input.organizationId.trim()))
  if (input.query?.trim()) {
    const q = `%${input.query.trim()}%`
    filters.push(or(ilike(users.name, q), ilike(opportunities.title, q), ilike(organizations.name, q)) ?? sql`true`)
  }
  return getDb()
    .select({
      id: applications.id,
      status: applications.status,
      appliedAt: applications.appliedAt,
      studentName: users.name,
      studentEmail: users.email,
      opportunityTitle: opportunities.title,
      opportunityId: opportunities.id,
      organizationName: organizations.name,
      organizationId: organizations.id,
    })
    .from(applications)
    .innerJoin(users, eq(users.id, applications.studentId))
    .innerJoin(opportunities, eq(opportunities.id, applications.opportunityId))
    .innerJoin(organizations, eq(organizations.id, opportunities.organizationId))
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(applications.appliedAt))
    .limit(300)
}

export async function listSkillCatalog() {
  return getDb().select().from(skillCatalog).orderBy(skillCatalog.category, skillCatalog.name)
}

export async function upsertSkillCatalog(
  actorId: string,
  input: { id?: string; name: string; category: string; active?: boolean },
) {
  const name = input.name.trim().slice(0, 80)
  const category = input.category.trim().slice(0, 80) || "General"
  if (!name) throw new Error("Skill name is required.")
  const stamp = new Date().toISOString()
  if (input.id) {
    await getDb()
      .update(skillCatalog)
      .set({ name, category, active: input.active ?? true, updatedAt: stamp })
      .where(eq(skillCatalog.id, input.id))
    await recordAdminAudit({ actorId, action: "skill.catalog.update", entityType: "skill_catalog", entityId: input.id })
    const [row] = await getDb().select().from(skillCatalog).where(eq(skillCatalog.id, input.id)).limit(1)
    return row
  }
  const id = randomUUID()
  await getDb().insert(skillCatalog).values({ id, name, category, active: input.active ?? true, createdAt: stamp, updatedAt: stamp })
  await recordAdminAudit({ actorId, action: "skill.catalog.create", entityType: "skill_catalog", entityId: id })
  const [row] = await getDb().select().from(skillCatalog).where(eq(skillCatalog.id, id)).limit(1)
  return row
}

export async function listPendingSkillVerifications() {
  return getDb()
    .select({
      skillId: skills.id,
      skillName: skills.name,
      category: skills.category,
      source: skills.source,
      studentId: users.id,
      studentName: users.name,
      studentEmail: users.email,
      evidenceBacked: skillVerifications.evidenceBacked,
      verified: skillVerifications.verified,
    })
    .from(skills)
    .innerJoin(users, eq(users.id, skills.userId))
    .leftJoin(skillVerifications, and(eq(skillVerifications.userId, skills.userId), eq(skillVerifications.skillId, skills.id)))
    .orderBy(desc(skills.createdAt))
    .limit(300)
}

export async function listAdminUploads() {
  const rows = await getDb()
    .select({
      id: uploads.id,
      originalName: uploads.originalName,
      mimeType: uploads.mimeType,
      size: uploads.size,
      createdAt: uploads.createdAt,
      ownerId: users.id,
      ownerName: users.name,
      ownerEmail: users.email,
    })
    .from(uploads)
    .innerJoin(users, eq(users.id, uploads.ownerId))
    .orderBy(desc(uploads.createdAt))
    .limit(200)
  return rows
}

export async function listAdminPortfolios(query?: string) {
  const filters = []
  if (query?.trim()) {
    const q = `%${query.trim()}%`
    filters.push(or(ilike(users.name, q), ilike(profiles.publicSlug, q), ilike(profiles.tagline, q)) ?? sql`true`)
  }
  return getDb()
    .select({
      userId: users.id,
      name: users.name,
      slug: profiles.publicSlug,
      published: profiles.published,
      visibility: profiles.visibility,
      tagline: profiles.tagline,
      updatedAt: profiles.updatedAt,
    })
    .from(profiles)
    .innerJoin(users, eq(users.id, profiles.userId))
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(profiles.updatedAt))
    .limit(200)
}

export async function unpublishPortfolio(actorId: string, userId: string) {
  const [row] = await getDb().select().from(profiles).where(eq(profiles.userId, userId)).limit(1)
  if (!row) return null
  await getDb().update(profiles).set({ published: false, visibility: "private", updatedAt: new Date().toISOString() }).where(eq(profiles.userId, userId))
  await recordAdminAudit({ actorId, action: "portfolio.unpublished", entityType: "profile", entityId: userId })
  return { userId, published: false }
}

export async function adminReports() {
  const db = getDb()
  const roleRows = await db.select({ role: users.role, n: sql<number>`count(*)::int` }).from(users).groupBy(users.role)
  const oppTypeRows = await db.select({ type: opportunities.type, n: sql<number>`count(*)::int` }).from(opportunities).groupBy(opportunities.type)
  const oppStatusRows = await db.select({ status: opportunities.status, n: sql<number>`count(*)::int` }).from(opportunities).groupBy(opportunities.status)
  const appStatusRows = await db.select({ status: applications.status, n: sql<number>`count(*)::int` }).from(applications).groupBy(applications.status)
  const skillRows = await db
    .select({ name: skills.name, n: sql<number>`count(*)::int` })
    .from(skills)
    .groupBy(skills.name)
    .orderBy(desc(sql`count(*)`))
    .limit(12)
  const [verified] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(organizations)
    .where(eq(organizations.verificationStatus, "approved"))
  const growthRows = await db
    .select({
      month: sql<string>`left(${users.createdAt}, 7)`,
      n: sql<number>`count(*)::int`,
    })
    .from(users)
    .groupBy(sql`left(${users.createdAt}, 7)`)
    .orderBy(sql`left(${users.createdAt}, 7)`)
  const appTypeRows = await db
    .select({ type: opportunities.type, n: sql<number>`count(*)::int` })
    .from(applications)
    .innerJoin(opportunities, eq(opportunities.id, applications.opportunityId))
    .groupBy(opportunities.type)
  return {
    usersByRole: Object.fromEntries(roleRows.map((row) => [row.role, row.n])),
    verifiedEmployers: verified.n,
    opportunitiesByType: Object.fromEntries(oppTypeRows.map((row) => [row.type, row.n])),
    opportunitiesByStatus: Object.fromEntries(oppStatusRows.map((row) => [row.status, row.n])),
    applicationsByStatus: Object.fromEntries(appStatusRows.map((row) => [row.status, row.n])),
    applicationsByOpportunityType: Object.fromEntries(appTypeRows.map((row) => [row.type, row.n])),
    commonSkills: skillRows,
    userGrowth: growthRows,
  }
}

export async function broadcastNotification(actorId: string, input: { title: string; message: string; audience: "all" | "student" | "employer" }) {
  const title = input.title.trim().slice(0, 160)
  const message = input.message.trim().slice(0, 500)
  if (!title || !message) throw new Error("Title and message are required.")
  const audience = input.audience
  const recipients = await getDb()
    .select({ id: users.id })
    .from(users)
    .where(audience === "all" ? undefined : eq(users.role, audience))
  const stamp = new Date().toISOString()
  if (recipients.length) {
    await getDb().insert(notifications).values(
      recipients.map((user) => ({
        id: randomUUID(),
        userId: user.id,
        type: "announcement",
        title,
        message,
        read: false,
        href: null,
        createdAt: stamp,
      })),
    )
  }
  await recordAdminAudit({
    actorId,
    action: "notification.broadcast",
    entityType: "notification",
    entityId: actorId,
    metadata: { audience, recipients: recipients.length },
  })
  return { sent: recipients.length }
}

export async function listRecentNotifications() {
  return getDb()
    .select({
      id: sql<string>`min(${notifications.id})`,
      title: notifications.title,
      message: notifications.message,
      type: notifications.type,
      createdAt: notifications.createdAt,
      recipients: sql<number>`count(*)::int`,
    })
    .from(notifications)
    .where(eq(notifications.type, "announcement"))
    .groupBy(notifications.title, notifications.message, notifications.type, notifications.createdAt)
    .orderBy(desc(notifications.createdAt))
    .limit(40)
}

export function adminSettingsSnapshot() {
  let host = ""
  try {
    host = new URL(publicAppUrl()).host
  } catch {
    host = ""
  }
  return {
    appHost: host,
    databaseDriver: process.env.DATABASE_DRIVER || "unset",
    emailConfigured: emailProviderConfigured(),
    blobConfigured: blobStorageEnabled(),
    demoOtpEnabled: allowDemoOtp(),
  }
}

export async function listAuditLog() {
  return getDb()
    .select({
      id: adminAuditLog.id,
      action: adminAuditLog.action,
      entityType: adminAuditLog.entityType,
      entityId: adminAuditLog.entityId,
      createdAt: adminAuditLog.createdAt,
      actorName: users.name,
    })
    .from(adminAuditLog)
    .innerJoin(users, eq(users.id, adminAuditLog.actorId))
    .orderBy(desc(adminAuditLog.createdAt))
    .limit(100)
}
