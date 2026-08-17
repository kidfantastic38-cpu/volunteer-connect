import { relations } from "drizzle-orm"
import {
  bigint,
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core"

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull(),
  emailVerified: boolean("email_verified").notNull().default(false),
  sessionVersion: integer("session_version").notNull().default(1),
  status: text("status").notNull().default("active"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
})

export const profiles = pgTable(
  "profiles",
  {
    userId: text("user_id")
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),
    headline: text("headline").notNull().default(""),
    about: text("about").notNull().default(""),
    location: text("location").notNull().default(""),
    careerInterests: text("career_interests").array().notNull().default([]),
    publicSlug: text("public_slug"),
    published: boolean("published").notNull().default(false),
    visibility: text("visibility").notNull().default("unlisted"),
    showContact: boolean("show_contact").notNull().default(false),
    showEvidence: boolean("show_evidence").notNull().default(true),
    tagline: text("tagline").notNull().default(""),
    theme: text("theme").notNull().default("aurora"),
    extras: jsonb("extras").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [uniqueIndex("profiles_public_slug_idx").on(table.publicSlug)],
)

export const education = pgTable(
  "education",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    institution: text("institution").notNull().default(""),
    qualification: text("qualification").notNull().default(""),
    field: text("field").notNull().default(""),
    startDate: text("start_date").notNull().default(""),
    endDate: text("end_date").notNull().default(""),
    details: jsonb("details").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [index("education_user_idx").on(table.userId)],
)

export const experiences = pgTable(
  "experiences",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull().default("volunteer"),
    title: text("title").notNull().default(""),
    organization: text("organization").notNull().default(""),
    description: text("description").notNull().default(""),
    responsibilities: text("responsibilities").notNull().default(""),
    startDate: text("start_date").notNull().default(""),
    endDate: text("end_date").notNull().default(""),
    skills: text("skills").array().notNull().default([]),
    details: jsonb("details").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [index("experiences_user_idx").on(table.userId)],
)

export const projects = pgTable(
  "projects",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull().default(""),
    description: text("description").notNull().default(""),
    role: text("role").notNull().default(""),
    technologies: text("technologies").array().notNull().default([]),
    details: jsonb("details").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [index("projects_user_idx").on(table.userId)],
)

export const achievements = pgTable(
  "achievements",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull().default(""),
    description: text("description").notNull().default(""),
    date: text("date").notNull().default(""),
    details: jsonb("details").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [index("achievements_user_idx").on(table.userId)],
)

export const skills = pgTable(
  "skills",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    category: text("category").notNull().default("Communication"),
    level: integer("level").notNull().default(3),
    source: text("source").notNull().default("Self-assessed"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [index("skills_user_idx").on(table.userId)],
)

export const skillVerifications = pgTable(
  "skill_verifications",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    skillId: text("skill_id").references(() => skills.id, { onDelete: "cascade" }),
    skillKey: text("skill_key").notNull(),
    skillName: text("skill_name").notNull(),
    verified: boolean("verified").notNull().default(true),
    evidenceBacked: boolean("evidence_backed").notNull().default(false),
    verifiedBy: text("verified_by"),
    verifiedAt: text("verified_at").notNull(),
    source: text("source").notNull().default("admin"),
  },
  (table) => [uniqueIndex("skill_verifications_user_key_idx").on(table.userId, table.skillKey)],
)

export const organizations = pgTable("organizations", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  organizationType: text("organization_type").notNull(),
  organizationEmail: text("organization_email").notNull(),
  phone: text("phone").notNull(),
  website: text("website").notNull().default(""),
  registrationNumber: text("registration_number").notNull().default(""),
  address: text("address").notNull(),
  logoUrl: text("logo_url").notNull().default(""),
  verificationStatus: text("verification_status").notNull().default("pending"),
  suspended: boolean("suspended").notNull().default(false),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
})

export const verificationRequests = pgTable("verification_requests", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  submittedAt: text("submitted_at").notNull(),
  reviewedBy: text("reviewed_by"),
  status: text("status").notNull().default("pending"),
  notes: text("notes").notNull().default(""),
})

export const emailCodes = pgTable("email_codes", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  codeHash: text("code_hash").notNull(),
  expiresAt: bigint("expires_at", { mode: "number" }).notNull(),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
})

export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  windowStart: bigint("window_start", { mode: "number" }).notNull(),
  count: integer("count").notNull(),
})

export const uploads = pgTable(
  "uploads",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    originalName: text("original_name").notNull(),
    storagePath: text("storage_path").notNull(),
    mimeType: text("mime_type").notNull(),
    size: integer("size").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [index("uploads_owner_idx").on(table.ownerId)],
)

export const opportunities = pgTable(
  "opportunities",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    type: text("type").notNull().default("job"),
    description: text("description").notNull(),
    location: text("location").notNull().default(""),
    remote: boolean("remote").notNull().default(false),
    requirements: text("requirements").notNull().default(""),
    skillsRequired: text("skills_required").array().notNull().default([]),
    deadline: text("deadline").notNull().default(""),
    compensation: text("compensation").notNull().default(""),
    status: text("status").notNull().default("draft"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [index("opportunities_org_idx").on(table.organizationId), index("opportunities_status_idx").on(table.status)],
)

export const applications = pgTable(
  "applications",
  {
    id: text("id").primaryKey(),
    opportunityId: text("opportunity_id")
      .notNull()
      .references(() => opportunities.id, { onDelete: "cascade" }),
    studentId: text("student_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("submitted"),
    coverMessage: text("cover_message").notNull().default(""),
    appliedAt: text("applied_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("applications_unique_idx").on(table.opportunityId, table.studentId),
    index("applications_student_idx").on(table.studentId),
    index("applications_opportunity_idx").on(table.opportunityId),
  ],
)

export const savedOpportunities = pgTable(
  "saved_opportunities",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    opportunityId: text("opportunity_id")
      .notNull()
      .references(() => opportunities.id, { onDelete: "cascade" }),
    createdAt: text("created_at").notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.opportunityId] })],
)

export const notifications = pgTable(
  "notifications",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull().default("system"),
    title: text("title").notNull(),
    message: text("message").notNull().default(""),
    read: boolean("read").notNull().default(false),
    href: text("href"),
    createdAt: text("created_at").notNull(),
  },
  (table) => [index("notifications_user_idx").on(table.userId)],
)

export const adminAuditLog = pgTable(
  "admin_audit_log",
  {
    id: text("id").primaryKey(),
    actorId: text("actor_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: text("created_at").notNull(),
  },
  (table) => [index("admin_audit_log_created_idx").on(table.createdAt), index("admin_audit_log_entity_idx").on(table.entityType, table.entityId)],
)

export const skillCatalog = pgTable("skill_catalog", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  category: text("category").notNull().default("General"),
  active: boolean("active").notNull().default(true),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
})

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, { fields: [users.id], references: [profiles.userId] }),
  organization: one(organizations, { fields: [users.id], references: [organizations.ownerId] }),
  experiences: many(experiences),
  skills: many(skills),
  applications: many(applications),
}))
