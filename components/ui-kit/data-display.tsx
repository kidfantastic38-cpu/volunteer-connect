import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/* ---------------------------------- Avatar ---------------------------------- */

const avatarSizes = { sm: "size-8 text-xs", md: "size-10 text-sm", lg: "size-14 text-lg" }
const avatarTones = ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"]

export function Avatar({
  name,
  size = "md",
  tone,
  src,
}: {
  name: string
  size?: keyof typeof avatarSizes
  tone?: string
  src?: string
}) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
  const color = tone ?? avatarTones[name.length % avatarTones.length]
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src || "/placeholder.svg"} alt={name} className={cn("shrink-0 rounded-full object-cover", avatarSizes[size])} />
  }
  return (
    <span
      className={cn("grid shrink-0 place-items-center rounded-full font-semibold text-primary-foreground", avatarSizes[size])}
      style={{ backgroundColor: `var(--${color})` }}
      aria-hidden="true"
    >
      {initials}
    </span>
  )
}

/* ----------------------------------- Table ---------------------------------- */

export type Column<T> = {
  key: string
  header: ReactNode
  cell: (row: T) => ReactNode
  align?: "left" | "right" | "center"
  className?: string
}

export function DataTable<T>({
  columns,
  rows,
  getKey,
  caption,
  empty,
}: {
  columns: Column<T>[]
  rows: T[]
  getKey: (row: T) => string
  caption?: string
  empty?: ReactNode
}) {
  const alignClass = (a?: "left" | "right" | "center") =>
    a === "right" ? "text-right" : a === "center" ? "text-center" : "text-left"
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-border">
      <table className="w-full border-collapse text-sm">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead>
          <tr className="border-b border-border bg-muted/50">
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                className={cn("px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap", alignClass(c.align))}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-muted-foreground">
                {empty ?? "No records to display."}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={getKey(row)} className="border-b border-border last:border-0 transition-colors hover:bg-muted/40">
                {columns.map((c) => (
                  <td key={c.key} className={cn("px-4 py-3 text-foreground", alignClass(c.align), c.className)}>
                    {c.cell(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

/* ----------------------------------- List ----------------------------------- */

export function DataList({ children, className }: { children: ReactNode; className?: string }) {
  return <ul className={cn("divide-y divide-border rounded-xl border border-border bg-card", className)}>{children}</ul>
}

export function DataListItem({
  leading,
  title,
  subtitle,
  trailing,
}: {
  leading?: ReactNode
  title: ReactNode
  subtitle?: ReactNode
  trailing?: ReactNode
}) {
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      {leading ? <div className="shrink-0">{leading}</div> : null}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{title}</p>
        {subtitle ? <p className="truncate text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </li>
  )
}

/* -------------------------------- Stat card --------------------------------- */

export function StatCard({
  label,
  value,
  delta,
  icon,
}: {
  label: string
  value: ReactNode
  delta?: { value: string; positive?: boolean }
  icon?: ReactNode
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-e1">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        {icon ? <span className="text-muted-foreground">{icon}</span> : null}
      </div>
      <p className="mt-2 font-display text-2xl font-bold text-foreground">{value}</p>
      {delta ? (
        <p className={cn("mt-1 text-xs font-medium", delta.positive ? "text-success" : "text-destructive")}>
          {delta.positive ? "▲" : "▼"} {delta.value}
        </p>
      ) : null}
    </div>
  )
}

/* ------------------------------ Mini bar chart ------------------------------ */

export function MiniBarChart({
  data,
  className,
}: {
  data: { label: string; value: number }[]
  className?: string
}) {
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <div className={cn("flex items-end gap-2", className)} role="img" aria-label="Bar chart">
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex h-32 w-full items-end">
            <div
              className="w-full rounded-t-md bg-primary/80 transition-all hover:bg-primary"
              style={{ height: `${(d.value / max) * 100}%` }}
              title={`${d.label}: ${d.value}`}
            />
          </div>
          <span className="text-xs text-muted-foreground">{d.label}</span>
        </div>
      ))}
    </div>
  )
}
