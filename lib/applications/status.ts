export const APP_STATUSES = [
  "submitted",
  "under_review",
  "shortlisted",
  "rejected",
  "accepted",
  "withdrawn",
] as const
export type AppStatus = (typeof APP_STATUSES)[number]

const ALIASES: Record<string, AppStatus> = {
  applied: "submitted",
  submitted: "submitted",
  interview: "under_review",
  under_review: "under_review",
  shortlisted: "shortlisted",
  offer: "accepted",
  accepted: "accepted",
  rejected: "rejected",
  withdrawn: "withdrawn",
}

export function normalizeAppStatus(value: string | null | undefined): AppStatus {
  return ALIASES[(value ?? "").toLowerCase()] ?? "submitted"
}

export function isAppStatus(value: string): value is AppStatus {
  return Boolean(ALIASES[value.toLowerCase()])
}

export function isEmployerWritableStatus(value: string): boolean {
  const status = normalizeAppStatus(value)
  return status === "under_review" || status === "shortlisted" || status === "rejected" || status === "accepted"
}

export function isActiveApplication(value: string | null | undefined): boolean {
  return normalizeAppStatus(value) !== "withdrawn"
}
