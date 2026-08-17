const fetchAuth: typeof fetch = (input, init) => fetch(input, { credentials: "include", cache: "no-store", ...init })

async function parseError(res: Response) {
  try {
    const data = (await res.json()) as { error?: string }
    return data.error || "Request failed."
  } catch {
    return "Request failed."
  }
}

async function adminJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetchAuth(path, init)
  if (!res.ok) throw new Error(await parseError(res))
  return res.json() as Promise<T>
}

export const adminApi = {
  stats: () => adminJson<{ stats: Record<string, number> }>("/api/admin/stats"),
  users: (params = "") => adminJson<{ users: AdminUserRow[] }>(`/api/admin/users${params}`),
  patchUser: (id: string, body: object) =>
    adminJson<{ user: AdminUserRow }>(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  employers: () => adminJson<{ employers: AdminEmployerRow[] }>("/api/admin/employers"),
  employer: (id: string) =>
    adminJson<{ employer: AdminEmployerRow; history: AdminVerificationHistory[] }>(`/api/admin/employers/${id}`),
  patchEmployer: (id: string, body: object) =>
    adminJson(`/api/admin/employers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  opportunities: () => adminJson<{ opportunities: AdminOppRow[] }>("/api/admin/opportunities"),
  patchOpportunity: (id: string, status: string) =>
    adminJson(`/api/admin/opportunities/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }),
  applications: (params = "") => adminJson<{ applications: AdminAppRow[] }>(`/api/admin/applications${params}`),
  catalog: () => adminJson<{ skills: AdminCatalogRow[] }>("/api/admin/skills/catalog"),
  saveCatalog: (body: object) =>
    adminJson("/api/admin/skills/catalog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  skillQueue: () => adminJson<{ skills: AdminSkillRow[] }>("/api/admin/skills/verifications"),
  verifySkill: (body: object) =>
    adminJson("/api/admin/skills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  uploads: () => adminJson<{ uploads: AdminUploadRow[] }>("/api/admin/uploads"),
  portfolios: (params = "") => adminJson<{ portfolios: AdminPortfolioRow[] }>(`/api/admin/portfolios${params}`),
  unpublish: (id: string) =>
    adminJson(`/api/admin/portfolios/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: false }),
    }),
  reports: () => adminJson<{ reports: AdminReports }>("/api/admin/reports"),
  notifications: () => adminJson<{ notifications: AdminNoticeRow[] }>("/api/admin/notifications"),
  announce: (body: object) =>
    adminJson<{ ok: boolean; sent: number }>("/api/admin/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  settings: () => adminJson<{ settings: AdminSettings; audit: AdminAuditRow[] }>("/api/admin/settings"),
}

export type AdminUserRow = {
  id: string
  name: string
  email: string
  role: string
  emailVerified: boolean
  status: string
  createdAt: string
  headline?: string
}
export type AdminEmployerRow = {
  id: string
  name: string
  organizationType: string
  organizationEmail: string
  verificationStatus: string
  suspended: boolean
  createdAt: string
  phone?: string
  website?: string
  registrationNumber?: string
  address?: string
  ownerId: string
  ownerName: string
  ownerEmail: string
}
export type AdminOppRow = {
  id: string
  title: string
  type: string
  status: string
  createdAt: string
  deadline: string
  organizationId: string
  organizationName: string
  applicants: number
}
export type AdminAppRow = {
  id: string
  status: string
  appliedAt: string
  studentName: string
  studentEmail: string
  opportunityTitle: string
  opportunityId: string
  organizationName: string
  organizationId: string
}
export type AdminCatalogRow = { id: string; name: string; category: string; active: boolean }
export type AdminSkillRow = {
  skillId: string
  skillName: string
  category: string
  source: string
  studentId: string
  studentName: string
  studentEmail: string
  evidenceBacked: boolean | null
  verified: boolean | null
}
export type AdminUploadRow = {
  id: string
  originalName: string
  mimeType: string
  size: number
  createdAt: string
  ownerId: string
  ownerName: string
  ownerEmail: string
}
export type AdminPortfolioRow = {
  userId: string
  name: string
  slug: string | null
  published: boolean
  visibility: string
  tagline: string
  updatedAt: string
}
export type AdminReports = {
  usersByRole: Record<string, number>
  verifiedEmployers: number
  opportunitiesByType: Record<string, number>
  opportunitiesByStatus: Record<string, number>
  applicationsByStatus: Record<string, number>
  applicationsByOpportunityType: Record<string, number>
  commonSkills: { name: string; n: number }[]
  userGrowth: { month: string; n: number }[]
}
export type AdminNoticeRow = {
  id: string
  title: string
  message: string
  type: string
  createdAt: string
  recipients: number
}
export type AdminVerificationHistory = {
  id: string
  status: string
  notes: string
  submittedAt: string
  reviewedBy: string | null
}
export type AdminSettings = {
  appHost: string
  databaseDriver: string
  emailConfigured: boolean
  blobConfigured: boolean
  demoOtpEnabled: boolean
}
export type AdminAuditRow = { id: string; action: string; entityType: string; entityId: string; createdAt: string; actorName: string }
