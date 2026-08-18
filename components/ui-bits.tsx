import type { ReactNode } from "react"
import { ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

export function VerifiedBadge({ label = "Verified" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success">
      <ShieldCheck className="size-3" aria-hidden="true" />
      {label}
    </span>
  )
}

export function Chip({
  children,
  tone = "muted",
  className,
}: {
  children: ReactNode
  tone?: "muted" | "primary" | "accent" | "success" | "outline"
  className?: string
}) {
  const tones: Record<string, string> = {
    muted: "bg-muted text-muted-foreground",
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/12 text-accent",
    success: "bg-success/15 text-success",
    outline: "border border-border text-foreground",
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  )
}

export function MatchRing({ value, size = 56 }: { value: number; size?: number }) {
  const stroke = 6
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c - (value / 100) * c
  const tone = value >= 70 ? "text-success" : value >= 40 ? "text-primary" : "text-muted-foreground"
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} className="stroke-muted" fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className={cn("stroke-current transition-all", tone)}
          fill="none"
        />
      </svg>
      <span className={cn("absolute text-xs font-bold", tone)}>{value}%</span>
    </div>
  )
}

export function SkillBar({ name, level, verified }: { name: string; level: number; verified?: boolean }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{name}</span>
        {verified && <span className="text-xs text-success">Verified</span>}
      </div>
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={cn("h-1.5 flex-1 rounded-full", i < level ? "bg-primary" : "bg-muted")}
          />
        ))}
      </div>
    </div>
  )
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 px-6 py-12 text-center">
      {icon && <div className="mb-3 grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">{icon}</div>}
      <p className="font-display text-base font-semibold text-foreground">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground text-pretty">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
