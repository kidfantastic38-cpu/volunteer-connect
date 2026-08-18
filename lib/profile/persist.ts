import { randomUUID } from "node:crypto"
import { eq } from "drizzle-orm"
import { defaultProfileSnapshot } from "@/lib/auth/defaults"
import type { AuthUser, ProfileSnapshot } from "@/lib/auth/types"
import { getDb } from "@/lib/db/client"
import {
  achievements,
  education,
  experiences,
  notifications,
  profiles,
  projects,
  skills,
} from "@/lib/db/schema"
import { safeId } from "@/lib/security/validate"

export type OwnedChildIds = {
  education: Set<string>
  experiences: Set<string>
  projects: Set<string>
  achievements: Set<string>
  skills: Set<string>
  notifications: Set<string>
}

export async function ownedChildIds(userId: string): Promise<OwnedChildIds> {
  const db = getDb()
  const [eduRows, expRows, projRows, achRows, skillRows, noteRows] = await Promise.all([
    db.select({ id: education.id }).from(education).where(eq(education.userId, userId)),
    db.select({ id: experiences.id }).from(experiences).where(eq(experiences.userId, userId)),
    db.select({ id: projects.id }).from(projects).where(eq(projects.userId, userId)),
    db.select({ id: achievements.id }).from(achievements).where(eq(achievements.userId, userId)),
    db.select({ id: skills.id }).from(skills).where(eq(skills.userId, userId)),
    db.select({ id: notifications.id }).from(notifications).where(eq(notifications.userId, userId)),
  ])
  return {
    education: new Set(eduRows.map((row) => row.id)),
    experiences: new Set(expRows.map((row) => row.id)),
    projects: new Set(projRows.map((row) => row.id)),
    achievements: new Set(achRows.map((row) => row.id)),
    skills: new Set(skillRows.map((row) => row.id)),
    notifications: new Set(noteRows.map((row) => row.id)),
  }
}

/** Keep IDs the caller already owns. Never reuse another user's or invented IDs. */
export function assignOwnedId(candidate: unknown, owned: Set<string>): string {
  const id = safeId(candidate)
  if (id && owned.has(id)) return id
  return randomUUID()
}

function now() {
  return new Date().toISOString()
}

function rec(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {}
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60)
}

export async function assembleProfileSnapshot(user: AuthUser): Promise<ProfileSnapshot | null> {
  const db = getDb()
  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1)
  if (!profile) return null

  const extras = profile.extras ?? {}
  const [eduRows, expRows, projRows, achRows, skillRows, noteRows] = await Promise.all([
    db.select().from(education).where(eq(education.userId, user.id)),
    db.select().from(experiences).where(eq(experiences.userId, user.id)),
    db.select().from(projects).where(eq(projects.userId, user.id)),
    db.select().from(achievements).where(eq(achievements.userId, user.id)),
    db.select().from(skills).where(eq(skills.userId, user.id)),
    db.select().from(notifications).where(eq(notifications.userId, user.id)),
  ])

  const base = defaultProfileSnapshot(user)
  return {
    ...base,
    user: {
      name: user.name,
      email: user.email,
      headline: profile.headline,
      location: profile.location,
      about: profile.about,
      interests: profile.careerInterests ?? [],
      avatar: String(extras.avatar ?? base.user.avatar),
    },
    role: user.role,
    verified: user.emailVerified,
    onboarding: (extras.onboarding as ProfileSnapshot["onboarding"]) ?? base.onboarding,
    education: eduRows.map((row) => ({
      id: row.id,
      institution: row.institution,
      qualification: row.qualification,
      field: row.field,
      start: row.startDate,
      end: row.endDate,
      ...row.details,
    })),
    experiences: expRows.map((row) => ({
      id: row.id,
      type: row.type,
      role: row.title,
      organization: row.organization,
      description: row.description,
      start: row.startDate,
      end: row.endDate,
      skills: row.skills ?? [],
      ...row.details,
    })),
    projects: projRows.map((row) => ({
      id: row.id,
      title: row.title,
      role: row.role,
      description: row.description,
      skills: row.technologies ?? [],
      ...row.details,
    })),
    achievements: achRows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      date: row.date,
      ...row.details,
    })),
    skills: skillRows.map((row) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      level: row.level,
      source: row.source,
      verified: false,
      evidenceBacked: false,
    })),
    notifications: noteRows.map((row) => ({
      id: row.id,
      kind: row.type,
      title: row.title,
      body: row.message,
      time: row.createdAt,
      read: row.read,
      href: row.href ?? undefined,
    })),
    applications: [],
    portfolio: {
      published: profile.published,
      theme: profile.theme,
      slug: profile.publicSlug ?? slugify(user.name),
      visibility: profile.visibility,
      showContact: profile.showContact,
      showEvidence: profile.showEvidence,
      tagline: profile.tagline,
    },
    privacy: (extras.privacy as ProfileSnapshot["privacy"]) ?? base.privacy,
    cvTemplate: String(extras.cvTemplate ?? "modern"),
  }
}

export async function persistProfileSnapshot(userId: string, snapshot: ProfileSnapshot) {
  const db = getDb()
  const stamp = now()
  const portfolio = rec(snapshot.portfolio)
  const desired = slugify(String(portfolio.slug ?? "")) || "portfolio"
  const taken = await db.select({ userId: profiles.userId }).from(profiles).where(eq(profiles.publicSlug, desired)).limit(1)
  const slug = taken[0] && taken[0].userId !== userId ? `${desired}-${userId.slice(0, 8)}` : desired
  if (taken[0] && taken[0].userId !== userId && snapshot.portfolio && typeof snapshot.portfolio === "object") {
    ;(snapshot.portfolio as { slug: string }).slug = slug
  }

  const extras = {
    avatar: snapshot.user.avatar,
    onboarding: snapshot.onboarding,
    privacy: snapshot.privacy,
    cvTemplate: snapshot.cvTemplate,
  }

  await db
    .insert(profiles)
    .values({
      userId,
      headline: snapshot.user.headline,
      about: snapshot.user.about,
      location: snapshot.user.location,
      careerInterests: snapshot.user.interests ?? [],
      publicSlug: slug,
      published: Boolean(portfolio.published),
      visibility: String(portfolio.visibility ?? "unlisted"),
      showContact: Boolean(portfolio.showContact),
      showEvidence: portfolio.showEvidence !== false,
      tagline: String(portfolio.tagline ?? ""),
      theme: String(portfolio.theme ?? "aurora"),
      extras,
      createdAt: stamp,
      updatedAt: stamp,
    })
    .onConflictDoUpdate({
      target: profiles.userId,
      set: {
        headline: snapshot.user.headline,
        about: snapshot.user.about,
        location: snapshot.user.location,
        careerInterests: snapshot.user.interests ?? [],
        publicSlug: slug,
        published: Boolean(portfolio.published),
        visibility: String(portfolio.visibility ?? "unlisted"),
        showContact: Boolean(portfolio.showContact),
        showEvidence: portfolio.showEvidence !== false,
        tagline: String(portfolio.tagline ?? ""),
        theme: String(portfolio.theme ?? "aurora"),
        extras,
        updatedAt: stamp,
      },
    })

  await replaceChildren(userId, snapshot, stamp)
}

async function replaceChildren(userId: string, snapshot: ProfileSnapshot, stamp: string) {
  const db = getDb()
  await db.delete(education).where(eq(education.userId, userId))
  await db.delete(experiences).where(eq(experiences.userId, userId))
  await db.delete(projects).where(eq(projects.userId, userId))
  await db.delete(achievements).where(eq(achievements.userId, userId))
  await db.delete(skills).where(eq(skills.userId, userId))
  await db.delete(notifications).where(eq(notifications.userId, userId))

  const edu = Array.isArray(snapshot.education) ? snapshot.education : []
  if (edu.length) {
    await db.insert(education).values(
      edu.map((item) => {
        const row = rec(item)
        return {
          id: safeId(row.id) || randomUUID(),
          userId,
          institution: String(row.institution ?? ""),
          qualification: String(row.qualification ?? ""),
          field: String(row.field ?? ""),
          startDate: String(row.start ?? ""),
          endDate: String(row.end ?? ""),
          details: { grade: row.grade, description: row.description, location: row.location },
          createdAt: stamp,
          updatedAt: stamp,
        }
      }),
    )
  }

  const exp = Array.isArray(snapshot.experiences) ? snapshot.experiences : []
  if (exp.length) {
    await db.insert(experiences).values(
      exp.map((item) => {
        const row = rec(item)
        return {
          id: safeId(row.id) || randomUUID(),
          userId,
          type: String(row.type ?? "volunteer"),
          title: String(row.role ?? row.title ?? ""),
          organization: String(row.organization ?? ""),
          description: String(row.description ?? ""),
          responsibilities: String(row.responsibilities ?? ""),
          startDate: String(row.start ?? ""),
          endDate: String(row.end ?? ""),
          skills: Array.isArray(row.skills) ? row.skills.map(String) : [],
          details: {
            location: row.location,
            current: row.current,
            hours: row.hours,
            evidence: row.evidence,
          },
          createdAt: stamp,
          updatedAt: stamp,
        }
      }),
    )
  }

  const proj = Array.isArray(snapshot.projects) ? snapshot.projects : []
  if (proj.length) {
    await db.insert(projects).values(
      proj.map((item) => {
        const row = rec(item)
        return {
          id: safeId(row.id) || randomUUID(),
          userId,
          title: String(row.title ?? ""),
          description: String(row.description ?? ""),
          role: String(row.role ?? ""),
          technologies: Array.isArray(row.skills) ? row.skills.map(String) : [],
          details: { category: row.category, outcome: row.outcome, link: row.link, evidence: row.evidence },
          createdAt: stamp,
          updatedAt: stamp,
        }
      }),
    )
  }

  const ach = Array.isArray(snapshot.achievements) ? snapshot.achievements : []
  if (ach.length) {
    await db.insert(achievements).values(
      ach.map((item) => {
        const row = rec(item)
        return {
          id: safeId(row.id) || randomUUID(),
          userId,
          title: String(row.title ?? ""),
          description: String(row.description ?? ""),
          date: String(row.date ?? ""),
          details: { issuer: row.issuer, category: row.category, evidence: row.evidence },
          createdAt: stamp,
          updatedAt: stamp,
        }
      }),
    )
  }

  const sk = Array.isArray(snapshot.skills) ? snapshot.skills : []
  if (sk.length) {
    await db.insert(skills).values(
      sk.map((item) => {
        const row = rec(item)
        return {
          id: safeId(row.id) || randomUUID(),
          userId,
          name: String(row.name ?? ""),
          category: String(row.category ?? "Communication"),
          level: Number(row.level ?? 3),
          source: String(row.source ?? "Self-assessed"),
          createdAt: stamp,
          updatedAt: stamp,
        }
      }),
    )
  }

  const notes = Array.isArray(snapshot.notifications) ? snapshot.notifications : []
  if (notes.length) {
    await db.insert(notifications).values(
      notes.map((item) => {
        const row = rec(item)
        return {
          id: safeId(row.id) || randomUUID(),
          userId,
          type: String(row.kind ?? "system"),
          title: String(row.title ?? ""),
          message: String(row.body ?? ""),
          read: Boolean(row.read),
          href: typeof row.href === "string" ? row.href : null,
          createdAt: String(row.time ?? stamp),
        }
      }),
    )
  }
}
