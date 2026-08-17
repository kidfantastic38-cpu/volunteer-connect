export const ORGANIZATION_TYPES = ["Company", "NGO", "School", "Government", "Startup", "Other"] as const
export type OrganizationType = (typeof ORGANIZATION_TYPES)[number]

export type VerificationStatus = "pending" | "approved" | "rejected" | "more_info"

export type Organization = {
  id: string
  ownerId: string
  name: string
  organizationType: OrganizationType
  organizationEmail: string
  phone: string
  website: string
  registrationNumber: string
  address: string
  logoUrl: string
  verificationStatus: VerificationStatus
  createdAt: string
  updatedAt: string
}

export type OrganizationInput = {
  name: string
  organizationType: OrganizationType
  organizationEmail: string
  phone: string
  website?: string
  registrationNumber?: string
  address: string
  logoUrl?: string
}

export type VerificationRequest = {
  id: string
  organizationId: string
  submittedAt: string
  reviewedBy: string | null
  status: VerificationStatus
  notes: string
}

export type VerificationListItem = {
  requestId: string
  organizationId: string
  organizationName: string
  ownerName: string
  ownerEmail: string
  organizationEmail: string
  website: string
  registrationNumber: string
  submittedAt: string
  status: VerificationStatus
  notes: string
}
