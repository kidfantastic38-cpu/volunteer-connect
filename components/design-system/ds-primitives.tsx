import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export function DsSection({
  id,
  eyebrow,
  title,
  description,
  children,
}: {
  id: string
  eyebrow: string
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-border py-14 first:border-t-0 first:pt-0">
      <div className="mb-8 max-w-2xl">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
        <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-balance sm:text-3xl">{title}</h2>
        {description ? <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">{description}</p> : null}
      </div>
      {children}
    </section>
  )
}

export function Subhead({ children }: { children: ReactNode }) {
  return (
    <h3 className="mb-4 mt-10 font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground first:mt-0">
      {children}
    </h3>
  )
}

/** A color swatch with its token name, Tailwind class, and usage note. */
export function Swatch({
  name,
  token,
  className,
  textClassName,
  note,
}: {
  name: string
  token: string
  className: string
  textClassName?: string
  note?: string
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-e1">
      <div className={cn("flex h-20 items-end p-3", className, textClassName)}>
        <span className="text-xs font-medium opacity-90">{name}</span>
      </div>
      <div className="space-y-0.5 px-3 py-2.5">
        <p className="font-mono text-xs font-medium text-foreground">{token}</p>
        {note ? <p className="text-xs leading-snug text-muted-foreground">{note}</p> : null}
      </div>
    </div>
  )
}

/** A labeled specimen frame used to display a live component example. */
export function Specimen({
  label,
  children,
  className,
}: {
  label?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-e1">
      {label ? <p className="mb-4 font-mono text-xs text-muted-foreground">{label}</p> : null}
      <div className={cn("flex flex-wrap items-center gap-3", className)}>{children}</div>
    </div>
  )
}

/** A single documented token row: visual sample + name + value/usage. */
export function TokenRow({
  sample,
  name,
  value,
  usage,
}: {
  sample: ReactNode
  name: string
  value: string
  usage?: string
}) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-3">
      <div className="flex w-24 shrink-0 items-center justify-center">{sample}</div>
      <div className="min-w-0 flex-1">
        <p className="font-mono text-xs font-medium text-foreground">{name}</p>
        {usage ? <p className="truncate text-xs text-muted-foreground">{usage}</p> : null}
      </div>
      <p className="shrink-0 font-mono text-xs text-muted-foreground">{value}</p>
    </div>
  )
}
