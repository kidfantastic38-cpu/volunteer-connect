"use client"

import { Fragment, type ReactNode } from "react"
import Link from "next/link"
import { ChevronRight, ChevronLeft, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

/* -------------------------------- Breadcrumbs -------------------------------- */

export type Crumb = { label: string; href?: string }

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm">
        {items.map((item, i) => {
          const last = i === items.length - 1
          return (
            <Fragment key={`${item.label}-${i}`}>
              <li>
                {item.href && !last ? (
                  <Link
                    href={item.href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className={cn(last ? "font-medium text-foreground" : "text-muted-foreground")} aria-current={last ? "page" : undefined}>
                    {item.label}
                  </span>
                )}
              </li>
              {!last ? (
                <li aria-hidden="true">
                  <ChevronRight className="size-3.5 text-muted-foreground/60" />
                </li>
              ) : null}
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}

/* ----------------------------------- Tabs ----------------------------------- */

export type TabItem = { id: string; label: string; badge?: ReactNode }

export function Tabs({
  items,
  value,
  onChange,
  className,
}: {
  items: TabItem[]
  value: string
  onChange: (id: string) => void
  className?: string
}) {
  return (
    <div className={cn("flex gap-1 overflow-x-auto border-b border-border", className)} role="tablist">
      {items.map((item) => {
        const active = item.id === value
        return (
          <button
            key={item.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={cn(
              "-mb-px flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              active
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
            )}
          >
            {item.label}
            {item.badge != null ? (
              <span className="grid min-w-5 place-items-center rounded-full bg-muted px-1.5 text-xs font-semibold text-muted-foreground">
                {item.badge}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

/* -------------------------------- Pagination -------------------------------- */

function pageRange(current: number, total: number): (number | "…")[] {
  const pages: (number | "…")[] = []
  const push = (n: number | "…") => pages.push(n)
  const window = 1
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - window && i <= current + window)) {
      push(i)
    } else if (pages[pages.length - 1] !== "…") {
      push("…")
    }
  }
  return pages
}

export function Pagination({
  page,
  total,
  onChange,
}: {
  page: number
  total: number
  onChange: (page: number) => void
}) {
  const pages = pageRange(page, total)
  const btn = "grid size-9 place-items-center rounded-lg border border-border text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
  return (
    <nav aria-label="Pagination" className="flex items-center gap-1.5">
      <button className={cn(btn, "hover:bg-muted")} onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="Previous page">
        <ChevronLeft className="size-4" aria-hidden="true" />
      </button>
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="grid size-9 place-items-center text-muted-foreground">
            <MoreHorizontal className="size-4" aria-hidden="true" />
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              btn,
              p === page ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted",
            )}
          >
            {p}
          </button>
        ),
      )}
      <button className={cn(btn, "hover:bg-muted")} onClick={() => onChange(page + 1)} disabled={page >= total} aria-label="Next page">
        <ChevronRight className="size-4" aria-hidden="true" />
      </button>
    </nav>
  )
}
