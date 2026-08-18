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
    <span className={cn("inline-flex min-w-0 max-w-full items-center gap-2 sm:gap-2.5", className)}>
      <span
        className={cn(
          "grid size-8 shrink-0 place-items-center rounded-sm font-display text-[11px] font-semibold tracking-wide",
          inverted ? "bg-primary-foreground text-primary" : "bg-primary text-primary-foreground",
        )}
        aria-hidden="true"
      >
        VC
      </span>
      {showText ? (
        <span
          className={cn(
            "min-w-0 truncate font-display text-[0.8125rem] font-semibold leading-none tracking-tight whitespace-nowrap sm:overflow-visible sm:text-[1.05rem]",
            inverted ? "text-primary-foreground" : "text-foreground",
          )}
        >
          Volunteer Connect
        </span>
      ) : null}
    </span>
  )
}
