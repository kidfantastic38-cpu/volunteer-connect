export const OPP_TYPES = ["job", "internship", "scholarship", "volunteering", "training"] as const
export type OppType = (typeof OPP_TYPES)[number]

export const OPP_STATUSES = ["draft", "published", "closed", "archived"] as const
export type OppStatus = (typeof OPP_STATUSES)[number]

const ALIASES: Record<string, OppStatus> = {
  open: "published",
  published: "published",
  draft: "draft",
  closed: "closed",
  archived: "archived",
}

export function isOppType(value: string): value is OppType {
  return (OPP_TYPES as readonly string[]).includes(value)
}

export function normalizeOppStatus(value: string | null | undefined): OppStatus {
  return ALIASES[(value ?? "").toLowerCase()] ?? "draft"
}

export function isOppStatus(value: string): value is OppStatus {
  return normalizeOppStatus(value) === value || value === "open"
}

export function isPublishedStatus(value: string | null | undefined): boolean {
  return normalizeOppStatus(value) === "published"
}

export function canApplyToStatus(value: string | null | undefined): boolean {
  return normalizeOppStatus(value) === "published"
}

export function isPrivateOpportunityStatus(value: string | null | undefined): boolean {
  const status = normalizeOppStatus(value)
  return status === "draft" || status === "archived"
}
