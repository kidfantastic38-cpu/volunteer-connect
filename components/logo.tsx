import { cn } from "@/lib/utils"

export function Logo({
  className,
  showText = true,
  inverted = false,
}: {
  className?: string
  showText?: boolean
  inverted?: boolean
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "grid size-8 place-items-center rounded-sm font-display text-[11px] font-semibold tracking-wide",
          inverted ? "bg-primary-foreground text-primary" : "bg-primary text-primary-foreground",
        )}
        aria-hidden="true"
      >
        VC
      </span>
      {showText ? (
        <span
          className={cn(
            "hidden font-display text-[1.05rem] font-semibold leading-none tracking-tight min-[380px]:inline",
            inverted ? "text-primary-foreground" : "text-foreground",
          )}
        >
          Volunteer Connect
        </span>
      ) : null}
    </span>
  )
}
