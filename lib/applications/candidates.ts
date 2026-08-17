import { getProfileSnapshot } from "@/lib/auth/db"
import { sanitizeProfileSnapshot } from "@/lib/auth/sanitize-profile"
import { findUserById } from "@/lib/auth/db"
import { scoreOpportunityMatch } from "@/lib/matching/score"
import { getOpportunity } from "@/lib/opportunities/store"
import { listOrganizationApplications, type ApplicationRecord } from "@/lib/applications/store"

export type EmployerCandidate = {
  applicationId: string
  opportunityId: string
  opportunityTitle: string
  status: string
  appliedAt: string
  coverMessage: string
  match: number
  name: string
  headline: string
  location: string
  about: string
  hours: number
  verifiedSkills: string[]
  otherSkills: string[]
  portfolioSlug: string | null
  showContact: boolean
  email: string | null
  cvAvailable: boolean
}

type Privacy = {
  showToEmployers?: boolean
}

type Portfolio = {
  published?: boolean
  visibility?: string
  showContact?: boolean
  slug?: string
}

function volunteerHours(experiences: unknown[]): number {
  return experiences.reduce<number>((sum, item) => {
    const rec = item && typeof item === "object" ? (item as { hours?: unknown; type?: unknown }) : {}
    const hours = typeof rec.hours === "number" ? rec.hours : 0
    return rec.type === "volunteer" ? sum + hours : sum
  }, 0)
}

export async function listEmployerCandidates(organizationId: string): Promise<EmployerCandidate[]> {
  const applications = await listOrganizationApplications(organizationId)
  const out: EmployerCandidate[] = []
  for (const application of applications) {
    const view = await toEmployerCandidate(application)
    if (view) out.push(view)
  }
  return out.sort((a, b) => b.match - a.match)
}

export async function toEmployerCandidate(application: ApplicationRecord): Promise<EmployerCandidate | null> {
  const student = await findUserById(application.studentId)
  if (!student) return null
  const raw = await getProfileSnapshot(student.id)
  if (!raw) {
    return {
      applicationId: application.id,
      opportunityId: application.opportunityId,
      opportunityTitle: application.opportunityTitle ?? "",
      status: application.status,
      appliedAt: application.appliedAt,
      coverMessage: application.coverMessage,
      match: 18,
      name: application.studentName ?? student.name,
      headline: "",
      location: "",
      about: "",
      hours: 0,
      verifiedSkills: [],
      otherSkills: [],
      portfolioSlug: null,
      showContact: false,
      email: null,
      cvAvailable: false,
    }
  }
  const snapshot = await sanitizeProfileSnapshot(student, raw)
  const privacy = (snapshot.privacy ?? {}) as Privacy
  const portfolio = (snapshot.portfolio ?? {}) as Portfolio
  const showProfile = privacy.showToEmployers !== false
  const showContact = Boolean(portfolio.showContact)
  const published = Boolean(portfolio.published) && portfolio.visibility !== "private"
  const skills = (snapshot.skills as { name: string; level: number; verified?: boolean; category?: string }[]) ?? []
  const opportunity = await getOpportunity(application.opportunityId)
  const match = opportunity
    ? scoreOpportunityMatch(
        {
          skills,
          interests: snapshot.user.interests ?? [],
          location: snapshot.user.location,
        },
        opportunity,
      )
    : 18

  return {
    applicationId: application.id,
    opportunityId: application.opportunityId,
    opportunityTitle: application.opportunityTitle ?? opportunity?.title ?? "",
    status: application.status,
    appliedAt: application.appliedAt,
    coverMessage: application.coverMessage,
    match,
    name: snapshot.user.name,
    headline: showProfile ? snapshot.user.headline : "",
    location: showProfile ? snapshot.user.location : "",
    about: showProfile ? snapshot.user.about : "",
    hours: showProfile ? volunteerHours((snapshot.experiences as unknown[]) ?? []) : 0,
    verifiedSkills: showProfile ? skills.filter((skill) => skill.verified).map((skill) => skill.name) : [],
    otherSkills: showProfile ? skills.filter((skill) => !skill.verified).map((skill) => skill.name) : [],
    portfolioSlug: published ? portfolio.slug ?? null : null,
    showContact,
    email: showContact ? student.email : null,
    cvAvailable: showProfile && published,
  }
}
