import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export function Logo({ className, showText = true }: { className?: string; showText?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
        <Sparkles className="size-4" aria-hidden="true" />
      </span>
      {showText && (
        <span className="font-display text-base font-bold tracking-tight text-foreground">
          Volunteer<span className="text-primary">Connect</span>
        </span>
      )}
    </span>
  )
}
