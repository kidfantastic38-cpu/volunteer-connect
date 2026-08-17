import { findUserById, getProfileSnapshot } from "@/lib/auth/db"
import { sanitizeProfileSnapshot } from "@/lib/auth/sanitize-profile"
import type { AuthUser, ProfileSnapshot } from "@/lib/auth/types"
import { getDb } from "@/lib/db/client"
import { profiles } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { safeHttpUrl } from "@/lib/security/urls"

export type PublicPortfolio = {
  name: string
  headline: string
  location: string
  about: string
  email: string | null
  tagline: string
  theme: string
  showEvidence: boolean
  education: {
    institution: string
    qualification: string
    field: string
    start: string
    end: string
  }[]
  experiences: {
    role: string
    organization: string
    location: string
    start: string
    end: string
    description: string
    skills: string[]
  }[]
  projects: {
    title: string
    role: string
    description: string
    outcome: string
    link: string
    skills: string[]
  }[]
  achievements: {
    title: string
    issuer: string
    date: string
    description: string
  }[]
  skills: {
    name: string
    level: number
    category: string
    verified: boolean
    evidenceBacked: boolean
  }[]
}

type PortfolioMeta = {
  published?: boolean
  visibility?: string
  showContact?: boolean
  showEvidence?: boolean
  tagline?: string
  theme?: string
}

export async function findUserIdByPublicSlug(slug: string): Promise<string | null> {
  const [row] = await getDb().select({ userId: profiles.userId }).from(profiles).where(eq(profiles.publicSlug, slug)).limit(1)
  return row?.userId ?? null
}

export async function toPublicPortfolio(
  user: AuthUser,
  snapshot: ProfileSnapshot,
  viewer: AuthUser | null = null,
): Promise<PublicPortfolio | null> {
  const clean = await sanitizeProfileSnapshot(user, snapshot)
  const portfolio = (clean.portfolio ?? {}) as PortfolioMeta
  if (!portfolio.published) return null
  if (portfolio.visibility === "private") return null
  if (portfolio.visibility === "unlisted" && !viewer) return null

  const skills = (clean.skills as { name: string; level: number; category: string; verified?: boolean; evidenceBacked?: boolean }[]) ?? []
  const education = (clean.education as { institution: string; qualification: string; field: string; start: string; end: string }[]) ?? []
  const experiences = (clean.experiences as {
    role: string
    organization: string
    location: string
    start: string
    end: string
    description: string
    skills: string[]
  }[]) ?? []
  const projects = (clean.projects as {
    title: string
    role: string
    description: string
    outcome: string
    link?: string
    skills: string[]
  }[]) ?? []
  const achievements = (clean.achievements as { title: string; issuer: string; date: string; description: string }[]) ?? []

  return {
    name: clean.user.name,
    headline: clean.user.headline,
    location: clean.user.location,
    about: clean.user.about,
    email: portfolio.showContact ? clean.user.email : null,
    tagline: portfolio.tagline ?? "",
    theme: portfolio.theme ?? "aurora",
    showEvidence: Boolean(portfolio.showEvidence),
    education: education.map((item) => ({
      institution: item.institution,
      qualification: item.qualification,
      field: item.field,
      start: item.start,
      end: item.end,
    })),
    experiences: experiences.map((item) => ({
      role: item.role,
      organization: item.organization,
      location: item.location,
      start: item.start,
      end: item.end,
      description: item.description,
      skills: item.skills ?? [],
    })),
    projects: projects.map((item) => ({
      title: item.title,
      role: item.role,
      description: item.description,
      outcome: item.outcome,
      link: safeHttpUrl(item.link ?? ""),
      skills: item.skills ?? [],
    })),
    achievements: achievements.map((item) => ({
      title: item.title,
      issuer: item.issuer,
      date: item.date,
      description: item.description,
    })),
    skills: skills.map((item) => ({
      name: item.name,
      level: item.level,
      category: item.category,
      verified: Boolean(item.verified),
      evidenceBacked: Boolean(item.evidenceBacked),
    })),
  }
}

export async function getPublicPortfolioBySlug(slug: string, viewer: AuthUser | null = null): Promise<PublicPortfolio | null> {
  const userId = await findUserIdByPublicSlug(slug)
  if (!userId) return null
  const user = await findUserById(userId)
  if (!user) return null
  const snapshot = await getProfileSnapshot(userId)
  if (!snapshot) return null
  return toPublicPortfolio(user, snapshot, viewer)
}
