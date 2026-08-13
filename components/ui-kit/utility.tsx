"use client"

import { Component, type ReactNode } from "react"
import { Loader2, AlertOctagon, RotateCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

/* --------------------------------- Spinner ---------------------------------- */

const spinnerSizes = { sm: "size-4", md: "size-6", lg: "size-9" }

export function Spinner({
  size = "md",
  label = "Loading",
  className,
}: {
  size?: keyof typeof spinnerSizes
  label?: string
  className?: string
}) {
  return (
    <span role="status" className={cn("inline-flex items-center gap-2 text-muted-foreground", className)}>
      <Loader2 className={cn("animate-spin text-primary", spinnerSizes[size])} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  )
}

/* --------------------------------- Skeleton --------------------------------- */

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} aria-hidden="true" />
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  )
}

/* ------------------------------ Error boundary ------------------------------ */

export function ErrorFallback({
  title = "Something went wrong",
  description = "An unexpected error occurred while rendering this section. Try again.",
  onRetry,
}: {
  title?: string
  description?: string
  onRetry?: () => void
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-10 text-center"
    >
      <span className="mb-3 grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive">
        <AlertOctagon className="size-6" aria-hidden="true" />
      </span>
      <p className="font-display text-base font-semibold text-foreground">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground text-pretty">{description}</p>
      {onRetry ? (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          <RotateCw className="size-4" aria-hidden="true" /> Try again
        </Button>
      ) : null}
    </div>
  )
}

type EBProps = { children: ReactNode; fallback?: ReactNode }
type EBState = { hasError: boolean }

export class ErrorBoundary extends Component<EBProps, EBState> {
  constructor(props: EBProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): EBState {
    return { hasError: true }
  }

  reset = () => this.setState({ hasError: false })

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <ErrorFallback onRetry={this.reset} />
    }
    return this.props.children
  }
}
