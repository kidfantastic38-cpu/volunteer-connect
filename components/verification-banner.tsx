import { Clock3, ShieldAlert, ShieldQuestion } from "lucide-react"
import { ButtonLink } from "@/components/button-link"
import type { VerificationStatus } from "@/lib/org/types"

export function VerificationBanner({
  status,
  notes,
}: {
  status?: VerificationStatus | null
  notes?: string
}) {
  if (!status || status === "approved") return null

  if (status === "rejected") {
    return (
      <div className="mb-6 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3" role="status">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-destructive">
          <ShieldAlert className="size-4" aria-hidden="true" /> Organization verification rejected
        </p>
        <p className="mt-1 text-sm text-destructive/90">
          {notes || "Your organization could not be verified. Update your details and contact support if you believe this is a mistake."}
        </p>
        <ButtonLink href="/employer/organization" variant="outline" size="sm" className="mt-3">
          Review organization profile
        </ButtonLink>
      </div>
    )
  }

  if (status === "more_info") {
    return (
      <div className="mb-6 rounded-2xl border border-accent/40 bg-accent/15 px-4 py-3" role="status">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
          <ShieldQuestion className="size-4" aria-hidden="true" /> More information requested
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {notes || "An admin asked for more information before they can verify your organization."}
        </p>
        <ButtonLink href="/employer/organization" size="sm" className="mt-3">
          Update organization profile
        </ButtonLink>
      </div>
    )
  }

  return (
    <div className="mb-6 rounded-2xl border border-border bg-muted/60 px-4 py-3" role="status">
      <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
        <Clock3 className="size-4 text-primary" aria-hidden="true" /> Verification pending
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Your organization verification is pending. You can complete your profile, but posting opportunities will be
        unlocked after approval.
      </p>
    </div>
  )
}
