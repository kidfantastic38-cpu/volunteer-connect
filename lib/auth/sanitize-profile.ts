import type { AuthUser, ProfileSnapshot } from "@/lib/auth/types"
import { skillVerificationMap, normalizeSkillKey } from "@/lib/auth/skills"
import { ownedUploadIdSet } from "@/lib/security/uploads"
import { safeHttpUrl } from "@/lib/security/urls"
import { asBoolean, asInt, asStringArray, clip, safeId, yearMonth } from "@/lib/security/validate"

const SKILL_CATEGORIES = [
  "Communication",
  "Leadership",
  "Technical",
  "Teamwork",
  "Problem Solving",
  "Creativity",
  "Organization",
] as const

const VISIBILITY = new Set(["public", "unlisted", "private"])
const THEMES = new Set(["aurora", "minimal", "bold"])
const CV = new Set(["modern", "classic", "compact"])
const EXP_TYPES = new Set(["volunteer", "internship", "work"])
const PROJ_CATS = new Set(["school", "community", "personal"])
const ACH_CATS = new Set(["award", "certification", "leadership"])
const EVIDENCE_TYPES = new Set(["certificate", "reference", "photo", "link", "document"])
const APP_STATUSES = new Set(["saved", "applied", "interview", "offer", "rejected"])

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60)
}

function evidenceList(
  value: unknown,
  ownedUploads: Set<string>,
): { id: string; type: string; label: string; status: "pending"; uploadId?: string }[] {
  if (!Array.isArray(value)) return []
  return value.slice(0, 8).map((item, index) => {
    const rec = item && typeof item === "object" ? (item as Record<string, unknown>) : {}
    const type = EVIDENCE_TYPES.has(String(rec.type)) ? String(rec.type) : "document"
    const uploadId = safeId(rec.uploadId)
    return {
      id: safeId(rec.id) || `ev-${index}`,
      type,
      label: clip(rec.label, 120) || "Evidence",
      status: "pending" as const,
      uploadId: uploadId && ownedUploads.has(uploadId) ? uploadId : undefined,
    }
  })
}

function evidenceSkillNames(
  items: { skills?: string[]; evidence: { uploadId?: string }[] }[],
): Set<string> {
  const names = new Set<string>()
  for (const item of items) {
    if (!item.evidence.some((entry) => entry.uploadId)) continue
    for (const skill of item.skills ?? []) names.add(normalizeSkillKey(skill))
  }
  return names
}

export async function sanitizeProfileSnapshot(user: AuthUser, incoming: ProfileSnapshot): Promise<ProfileSnapshot> {
  const src = incoming && typeof incoming === "object" ? incoming : ({} as ProfileSnapshot)
  const profile = src.user && typeof src.user === "object" ? src.user : { name: user.name, email: user.email, headline: "", location: "", about: "", interests: [], avatar: "chart-1" }
  const onboarding =
    src.onboarding && typeof src.onboarding === "object"
      ? (src.onboarding as Record<string, unknown>)
      : {}
  const portfolioIn = src.portfolio && typeof src.portfolio === "object" ? (src.portfolio as Record<string, unknown>) : {}
  const privacyIn = src.privacy && typeof src.privacy === "object" ? (src.privacy as Record<string, unknown>) : {}
  const ownedUploads = await ownedUploadIdSet(user.id)

  const education = Array.isArray(src.education)
    ? src.education.slice(0, 20).map((item, index) => {
        const rec = item && typeof item === "object" ? (item as Record<string, unknown>) : {}
        return {
          id: safeId(rec.id) || `edu-${index}`,
          institution: clip(rec.institution, 120),
          qualification: clip(rec.qualification, 120),
          field: clip(rec.field, 120),
          start: yearMonth(rec.start),
          end: yearMonth(rec.end),
          grade: clip(rec.grade, 40),
          description: clip(rec.description, 800),
        }
      })
    : []

  const experiences = Array.isArray(src.experiences)
    ? src.experiences.slice(0, 30).map((item, index) => {
        const rec = item && typeof item === "object" ? (item as Record<string, unknown>) : {}
        return {
          id: safeId(rec.id) || `exp-${index}`,
          type: EXP_TYPES.has(String(rec.type)) ? String(rec.type) : "volunteer",
          role: clip(rec.role, 120),
          organization: clip(rec.organization, 120),
          location: clip(rec.location, 120),
          start: yearMonth(rec.start),
          end: yearMonth(rec.end),
          current: asBoolean(rec.current),
          hours: asInt(rec.hours, 0, 20000, 0) || undefined,
          description: clip(rec.description, 2000),
          skills: asStringArray(rec.skills, 12, 40),
          evidence: evidenceList(rec.evidence, ownedUploads),
        }
      })
    : []

  const projects = Array.isArray(src.projects)
    ? src.projects.slice(0, 30).map((item, index) => {
        const rec = item && typeof item === "object" ? (item as Record<string, unknown>) : {}
        return {
          id: safeId(rec.id) || `proj-${index}`,
          title: clip(rec.title, 160),
          category: PROJ_CATS.has(String(rec.category)) ? String(rec.category) : "personal",
          role: clip(rec.role, 120),
          description: clip(rec.description, 2000),
          outcome: clip(rec.outcome, 400),
          link: safeHttpUrl(String(rec.link ?? "")),
          skills: asStringArray(rec.skills, 12, 40),
          evidence: evidenceList(rec.evidence, ownedUploads),
        }
      })
    : []

  const achievements = Array.isArray(src.achievements)
    ? src.achievements.slice(0, 30).map((item, index) => {
        const rec = item && typeof item === "object" ? (item as Record<string, unknown>) : {}
        return {
          id: safeId(rec.id) || `ach-${index}`,
          title: clip(rec.title, 160),
          issuer: clip(rec.issuer, 120),
          date: yearMonth(rec.date),
          category: ACH_CATS.has(String(rec.category)) ? String(rec.category) : "award",
          description: clip(rec.description, 800),
          evidence: evidenceList(rec.evidence, ownedUploads),
        }
      })
    : []

  const official = await skillVerificationMap(user.id)
  const evidenceBacked = new Set<string>([
    ...evidenceSkillNames(experiences),
    ...evidenceSkillNames(projects),
    ...evidenceSkillNames(achievements),
  ])

  const skills = Array.isArray(src.skills)
    ? src.skills.slice(0, 40).map((item, index) => {
        const rec = item && typeof item === "object" ? (item as Record<string, unknown>) : {}
        const name = clip(rec.name, 80)
        const key = normalizeSkillKey(name)
        const record = official.get(key)
        return {
          id: safeId(rec.id) || `sk-${index}`,
          name,
          level: asInt(rec.level, 1, 5, 3),
          category: SKILL_CATEGORIES.includes(rec.category as (typeof SKILL_CATEGORIES)[number])
            ? rec.category
            : "Communication",
          source: clip(rec.source, 80) || "Self-assessed",
          verified: Boolean(record?.verified),
          evidenceBacked: evidenceBacked.has(key),
        }
      })
    : []

  const applications = Array.isArray(src.applications)
    ? src.applications.slice(0, 80).map((item) => {
        const rec = item && typeof item === "object" ? (item as Record<string, unknown>) : {}
        return {
          opportunityId: clip(rec.opportunityId, 64),
          status: APP_STATUSES.has(String(rec.status)) ? String(rec.status) : "saved",
          updatedAt: clip(rec.updatedAt, 40),
        }
      })
    : []

  const notifications = Array.isArray(src.notifications)
    ? src.notifications.slice(0, 50).map((item, index) => {
        const rec = item && typeof item === "object" ? (item as Record<string, unknown>) : {}
        return {
          id: safeId(rec.id) || `nt-${index}`,
          kind: clip(rec.kind, 32) || "system",
          title: clip(rec.title, 120),
          body: clip(rec.body, 400),
          time: clip(rec.time, 40),
          read: asBoolean(rec.read),
          href: String(rec.href ?? "").startsWith("/") ? clip(rec.href, 160) : undefined,
        }
      })
    : []

  const desiredSlug = slugify(String(portfolioIn.slug ?? "")) || slugify(user.name) || "portfolio"

  return {
    user: {
      name: clip(profile.name, 80) || user.name,
      email: user.email,
      headline: clip(profile.headline, 160),
      location: clip(profile.location, 120),
      about: clip(profile.about, 4000),
      interests: asStringArray(profile.interests, 12, 40),
      avatar: clip(profile.avatar, 32) || "chart-1",
    },
    role: user.role,
    verified: user.emailVerified,
    onboarding: {
      basics: asBoolean(onboarding.basics),
      education: asBoolean(onboarding.education),
      experience: asBoolean(onboarding.experience),
      projects: asBoolean(onboarding.projects),
      achievements: asBoolean(onboarding.achievements),
      skills: asBoolean(onboarding.skills),
    },
    education,
    experiences,
    projects,
    achievements,
    skills,
    applications,
    notifications,
    portfolio: {
      published: asBoolean(portfolioIn.published),
      theme: THEMES.has(String(portfolioIn.theme)) ? String(portfolioIn.theme) : "aurora",
      slug: desiredSlug,
      visibility: VISIBILITY.has(String(portfolioIn.visibility)) ? String(portfolioIn.visibility) : "unlisted",
      showContact: asBoolean(portfolioIn.showContact, false),
      showEvidence: asBoolean(portfolioIn.showEvidence, true),
      tagline: clip(portfolioIn.tagline, 200),
    },
    privacy: {
      searchable: asBoolean(privacyIn.searchable, true),
      showToEmployers: asBoolean(privacyIn.showToEmployers, true),
      shareAnalytics: asBoolean(privacyIn.shareAnalytics),
      emailNotifications: asBoolean(privacyIn.emailNotifications, true),
      matchAlerts: asBoolean(privacyIn.matchAlerts, true),
    },
    cvTemplate: CV.has(String(src.cvTemplate)) ? String(src.cvTemplate) : "modern",
  }
}

export function portfolioSlugOf(snapshot: ProfileSnapshot): string {
  const portfolio = snapshot.portfolio && typeof snapshot.portfolio === "object" ? (snapshot.portfolio as { slug?: string }) : {}
  return slugify(portfolio.slug ?? "") || "portfolio"
}
