import { isOppStatus, isOppType, normalizeOppStatus, type OppStatus, type OppType } from "@/lib/opportunities/status"

export type OpportunityInput = {
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
}

export function parseOpportunityBody(body: Record<string, unknown>, defaults?: { status?: OppStatus }): OpportunityInput | { error: string } {
  const title = String(body.title ?? "").trim().slice(0, 160)
  const description = String(body.description ?? "").trim().slice(0, 4000)
  if (!title || !description) return { error: "Title and description are required." }
  const requestedType = String(body.type ?? "job")
  const type = isOppType(requestedType) ? requestedType : "job"
  const requestedStatus = typeof body.status === "string" ? body.status : defaults?.status ?? "published"
  const publish = body.publish === true
  const status = publish ? "published" : isOppStatus(requestedStatus) || requestedStatus === "open" ? normalizeOppStatus(requestedStatus) : "published"
  return {
    title,
    type,
    description,
    location: String(body.location ?? "").trim().slice(0, 120),
    remote: Boolean(body.remote),
    requirements: String(body.requirements ?? "").trim().slice(0, 2000),
    skills: Array.isArray(body.skills)
      ? body.skills.map(String).map((item) => item.trim()).filter(Boolean).slice(0, 20)
      : String(body.skills ?? "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
          .slice(0, 20),
    deadline: String(body.deadline ?? "").trim().slice(0, 40),
    compensation: String(body.compensation ?? "").trim().slice(0, 80),
    status,
  }
}
