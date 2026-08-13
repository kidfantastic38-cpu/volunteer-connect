import type { ReactNode } from "react"
import { CheckCircle2, Info, AlertTriangle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type AlertTone = "info" | "success" | "warning" | "error"

const alertConfig: Record<AlertTone, { icon: typeof Info; wrap: string; icon_c: string }> = {
  info: { icon: Info, wrap: "border-info/30 bg-info/10", icon_c: "text-info" },
  success: { icon: CheckCircle2, wrap: "border-success/30 bg-success/10", icon_c: "text-success" },
  warning: { icon: AlertTriangle, wrap: "border-warning/40 bg-warning/10", icon_c: "text-warning" },
  error: { icon: XCircle, wrap: "border-destructive/30 bg-destructive/10", icon_c: "text-destructive" },
}

export function Alert({
  tone = "info",
  title,
  children,
  action,
  className,
}: {
  tone?: AlertTone
  title: string
  children?: ReactNode
  action?: ReactNode
  className?: string
}) {
  const { icon: Icon, wrap, icon_c } = alertConfig[tone]
  return (
    <div role="alert" className={cn("flex items-start gap-3 rounded-xl border p-4", wrap, className)}>
      <Icon className={cn("mt-0.5 size-5 shrink-0", icon_c)} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {children ? <div className="mt-1 text-sm text-foreground/80 text-pretty">{children}</div> : null}
        {action ? <div className="mt-3">{action}</div> : null}
      </div>
    </div>
  )
}

/** CSS-only tooltip — accessible label revealed on hover/focus. */
export function Tooltip({
  label,
  children,
  side = "top",
}: {
  label: string
  children: ReactNode
  side?: "top" | "bottom"
}) {
  return (
    <span className="group/tt relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute left-1/2 z-40 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background opacity-0 shadow-e2 transition-opacity duration-150 group-hover/tt:opacity-100 group-focus-within/tt:opacity-100",
          side === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5",
        )}
      >
        {label}
      </span>
    </span>
  )
}
