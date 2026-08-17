/**
 * Platform recommendation score (0–100).
 * This is not a scientifically validated psychometric model.
 *
 * Scoring:
 * - Required-skill overlap (up to 80): owning a required skill adds
 *   0.55 + proficiency*0.35 + 0.1 if officially verified.
 * - Category/interest overlap (up to 12).
 * - Location/remote compatibility (up to 8).
 * - Education/experience keyword overlap (up to 8).
 */
export type MatchStudent = {
  skills: { name: string; level: number; verified?: boolean; category?: string }[]
  interests: string[]
  location?: string
  education?: { field?: string; qualification?: string; institution?: string }[]
  experience?: { role?: string; organization?: string; skills?: string[] }[]
}

export type MatchOpportunity = {
  skills: string[]
  location?: string
  remote?: boolean
  type?: string
}

export function scoreOpportunityMatch(student: MatchStudent, opportunity: MatchOpportunity): number {
  const byName = new Map(student.skills.map((skill) => [skill.name.toLowerCase(), skill]))
  const cats = new Map<string, (typeof student.skills)[number]>()
  for (const skill of student.skills) {
    if (skill.category && !cats.has(skill.category.toLowerCase())) cats.set(skill.category.toLowerCase(), skill)
  }
  const interests = student.interests.map((item) => item.toLowerCase())
  const required = opportunity.skills

  let skillScore = 55
  if (required.length > 0) {
    let total = 0
    for (const req of required) {
      const key = req.toLowerCase()
      const direct = byName.get(key)
      const viaCat = cats.get(key)
      if (direct) total += 0.55 + (direct.level / 5) * 0.35 + (direct.verified ? 0.1 : 0)
      else if (viaCat) total += 0.4 + (viaCat.level / 5) * 0.2
      else if (interests.some((item) => key.includes(item) || item.includes(key))) total += 0.3
    }
    skillScore = (total / required.length) * 80
  }

  const text = `${opportunity.type ?? ""} ${opportunity.location ?? ""}`.toLowerCase()
  const interestBoost = interests.some((item) => text.includes(item)) ? 12 : 0
  const studentLoc = (student.location ?? "").toLowerCase()
  const oppLoc = (opportunity.location ?? "").toLowerCase()
  let locationBoost = 0
  if (opportunity.remote) locationBoost = 8
  else if (studentLoc && oppLoc && (studentLoc.includes(oppLoc) || oppLoc.includes(studentLoc))) locationBoost = 8

  const educationText = (student.education ?? [])
    .map((item) => `${item.field ?? ""} ${item.qualification ?? ""} ${item.institution ?? ""}`)
    .join(" ")
    .toLowerCase()
  const experienceText = (student.experience ?? [])
    .map((item) => `${item.role ?? ""} ${item.organization ?? ""} ${(item.skills ?? []).join(" ")}`)
    .join(" ")
    .toLowerCase()
  const oppText = `${opportunity.type ?? ""} ${opportunity.location ?? ""}`.toLowerCase()
  const educationBoost = educationText && required.some((req) => educationText.includes(req.toLowerCase())) ? 4 : 0
  const experienceBoost =
    experienceText && (required.some((req) => experienceText.includes(req.toLowerCase())) || (oppText && experienceText.includes(oppText.split(" ")[0] ?? "")))
      ? 4
      : 0

  return Math.max(18, Math.min(98, Math.round(skillScore + interestBoost + locationBoost + educationBoost + experienceBoost)))
}
