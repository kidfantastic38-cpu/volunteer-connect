import { BadgeCheck, Clock3, ShieldAlert, ShieldQuestion } from "lucide-react"
import { cn } from "@/lib/utils"
import type { VerificationStatus } from "@/lib/org/types"

const COPY: Record<
  VerificationStatus,
  { label: string; icon: typeof BadgeCheck; className: string }
> = {
  approved: {
    label: "Verified",
    icon: BadgeCheck,
    className: "bg-success/15 text-success",
  },
  pending: {
    label: "Pending",
    icon: Clock3,
    className: "bg-accent/25 text-accent-foreground",
  },
  more_info: {
    label: "More info needed",
    icon: ShieldQuestion,
    className: "bg-accent/25 text-accent-foreground",
  },
  rejected: {
    label: "Rejected",
    icon: ShieldAlert,
    className: "bg-destructive/10 text-destructive",
  },
}

export function OrgTrustBadge({
  status,
  className,
}: {
  status?: VerificationStatus | null
  className?: string
}) {
  if (!status) return null
  const meta = COPY[status]
  const Icon = meta.icon
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        meta.className,
        className,
      )}
    >
      <Icon className="size-3" aria-hidden="true" />
      {meta.label}
    </span>
  )
}
