import type { AuthPayload } from "@/lib/auth/payload"
import type { AuthRole, ProfileSnapshot } from "@/lib/auth/types"
import type { Organization, OrganizationInput, VerificationListItem, VerificationStatus } from "@/lib/org/types"

export type AuthResponse = AuthPayload

const fetchAuth: typeof fetch = (input, init) =>
  fetch(input, { credentials: "include", cache: "no-store", ...init })

async function parseError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string }
    return data.error || "Something went wrong."
  } catch {
    return "Something went wrong."
  }
}

export async function apiRegister(input: {
  name: string
  email: string
  password: string
  role: AuthRole
  organization?: OrganizationInput
}): Promise<AuthResponse> {
  const res = await fetchAuth("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function apiLogin(input: { email: string; password: string }): Promise<AuthResponse> {
  const res = await fetchAuth("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function apiLogout() {
  await fetchAuth("/api/auth/logout", { method: "POST" })
}

export async function apiMe(): Promise<AuthResponse | null> {
  const res = await fetchAuth("/api/auth/me")
  if (res.status === 401) return null
  if (!res.ok) return null
  return res.json()
}

export async function apiSaveProfile(snapshot: ProfileSnapshot): Promise<ProfileSnapshot | null> {
  const res = await fetchAuth("/api/auth/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ snapshot }),
  })
  if (!res.ok) return null
  try {
    const data = (await res.json()) as { snapshot?: ProfileSnapshot }
    return data.snapshot ?? null
  } catch {
    return null
  }
}

export async function apiChangePassword(input: { current: string; next: string }) {
  const res = await fetchAuth("/api/auth/password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error(await parseError(res))
}

export async function apiVerifyEmail(code: string): Promise<AuthResponse> {
  const res = await fetchAuth("/api/auth/verify-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function apiSendVerifyEmail(): Promise<{ demo: boolean }> {
  const res = await fetchAuth("/api/auth/verify-email/send", { method: "POST" })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function apiUploadFile(file: File): Promise<{ id: string; name: string; mime: string; size: number }> {
  const body = new FormData()
  body.append("file", file)
  const res = await fetchAuth("/api/uploads", { method: "POST", body })
  if (!res.ok) throw new Error(await parseError(res))
  const data = (await res.json()) as { upload: { id: string; name: string; mime: string; size: number } }
  return data.upload
}

export async function apiGetOrganization(): Promise<Organization> {
  const res = await fetchAuth("/api/org")
  if (!res.ok) throw new Error(await parseError(res))
  const data = (await res.json()) as { organization: Organization }
  return data.organization
}

export async function apiSaveOrganization(input: Partial<OrganizationInput>): Promise<Organization> {
  const res = await fetchAuth("/api/org", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error(await parseError(res))
  const data = (await res.json()) as { organization: Organization }
  return data.organization
}

export async function apiOrgBadges(): Promise<Record<string, VerificationStatus>> {
  const res = await fetchAuth("/api/org/badges")
  if (!res.ok) return {}
  const data = (await res.json()) as { badges?: Record<string, VerificationStatus> }
  return data.badges ?? {}
}

export type ApiOpportunity = {
  id: string
  organizationId?: string
  org: string
  title: string
  type: "job" | "internship" | "scholarship" | "volunteering" | "training"
  location: string
  remote: boolean
  description: string
  skills: string[]
  deadline: string
  compensation?: string
  applicants?: number
  matchScore?: number | null
  status?: string
}

export type ApiApplication = {
  id: string
  opportunityId: string
  studentId?: string
  status:
    | "saved"
    | "submitted"
    | "under_review"
    | "shortlisted"
    | "accepted"
    | "rejected"
    | "withdrawn"
    | "applied"
    | "interview"
    | "offer"
  updatedAt: string
  appliedAt?: string
  opportunityTitle?: string
  organizationName?: string
  coverMessage?: string
}

export type ApiCandidate = {
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

export async function apiListOpportunities(input?: { q?: string; type?: string; mine?: boolean }): Promise<ApiOpportunity[]> {
  const params = new URLSearchParams()
  if (input?.q) params.set("q", input.q)
  if (input?.type) params.set("type", input.type)
  if (input?.mine) params.set("mine", "1")
  const res = await fetchAuth(`/api/opportunities${params.size ? `?${params}` : ""}`)
  if (!res.ok) return []
  const data = (await res.json()) as { opportunities?: ApiOpportunity[] }
  return data.opportunities ?? []
}

export async function apiPublishOpportunity(input: {
  title: string
  description: string
  type?: string
  location?: string
  remote?: boolean
  skills?: string[]
  deadline?: string
  compensation?: string
  requirements?: string
  status?: "draft" | "published"
}): Promise<ApiOpportunity | null> {
  const res = await fetchAuth("/api/employer/opportunities", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error(await parseError(res))
  const data = (await res.json()) as { opportunity?: ApiOpportunity }
  return data.opportunity ?? null
}

export async function apiArchiveOpportunity(id: string) {
  const res = await fetchAuth(`/api/employer/opportunities/${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error(await parseError(res))
}

export async function apiUpdateEmployerOpportunity(id: string, input: Record<string, unknown>) {
  const res = await fetchAuth(`/api/employer/opportunities/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error(await parseError(res))
  const data = (await res.json()) as { opportunity?: ApiOpportunity }
  return data.opportunity ?? null
}

export async function apiWithdrawApplication(id: string) {
  const res = await fetchAuth(`/api/applications/${id}/withdraw`, { method: "POST" })
  if (!res.ok) throw new Error(await parseError(res))
}

export async function apiListApplications(): Promise<ApiApplication[]> {
  const res = await fetchAuth("/api/applications")
  if (!res.ok) return []
  const data = (await res.json()) as { applications?: ApiApplication[] }
  return data.applications ?? []
}

export async function apiApply(opportunityId: string, coverMessage?: string): Promise<ApiApplication> {
  const res = await fetchAuth("/api/applications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ opportunityId, coverMessage }),
  })
  if (!res.ok) throw new Error(await parseError(res))
  const data = (await res.json()) as { application: ApiApplication }
  return data.application
}

export async function apiSaveOpportunity(opportunityId: string) {
  const res = await fetchAuth("/api/applications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ opportunityId, save: true }),
  })
  if (!res.ok) throw new Error(await parseError(res))
}

export async function apiUpdateApplication(id: string, status: string): Promise<ApiApplication> {
  const res = await fetchAuth(`/api/applications/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  })
  if (!res.ok) throw new Error(await parseError(res))
  const data = (await res.json()) as { application: ApiApplication }
  return data.application
}

export async function apiEmployerCandidates(): Promise<ApiCandidate[]> {
  const res = await fetchAuth("/api/employer/candidates")
  if (!res.ok) return []
  const data = (await res.json()) as { candidates?: ApiCandidate[] }
  return data.candidates ?? []
}

export async function apiListVerifications(): Promise<VerificationListItem[]> {
  const res = await fetchAuth("/api/admin/verifications")
  if (!res.ok) throw new Error(await parseError(res))
  const data = (await res.json()) as { requests: VerificationListItem[] }
  return data.requests
}

export async function apiReviewVerification(input: {
  organizationId: string
  status: VerificationStatus
  notes?: string
}): Promise<VerificationListItem[]> {
  const res = await fetchAuth("/api/admin/verifications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error(await parseError(res))
  const data = (await res.json()) as { requests: VerificationListItem[] }
  return data.requests
}
