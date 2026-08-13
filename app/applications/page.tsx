"use client"

import { Briefcase } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { ButtonLink } from "@/components/button-link"
import { usePrototype, oppTypeLabel, type ApplicationStatus } from "@/components/prototype-store"
import { Chip, EmptyState } from "@/components/ui-bits"

const COLUMNS: { key: ApplicationStatus; label: string; tone: "muted" | "primary" | "accent" | "success" }[] = [
  { key: "saved", label: "Saved", tone: "muted" },
  { key: "applied", label: "Applied", tone: "primary" },
  { key: "interview", label: "Interview", tone: "accent" },
  { key: "offer", label: "Offer", tone: "success" },
]

export default function ApplicationsPage() {
  const { applications, opportunities } = usePrototype()

  const oppById = (id: string) => opportunities.find((o) => o.id === id)

  if (applications.length === 0) {
    return (
      <AppShell>
        <h1 className="mb-6 font-display text-2xl font-bold text-foreground">Applications</h1>
        <EmptyState
          icon={<Briefcase className="size-6" aria-hidden="true" />}
          title="No applications yet"
          description="Save and apply to opportunities and they'll show up here in a simple pipeline."
          action={<ButtonLink href="/opportunities">Browse opportunities</ButtonLink>}
        />
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Applications</h1>
        <p className="text-sm text-muted-foreground">Track every opportunity from saved to offer.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map((col) => {
          const items = applications.filter((a) => a.status === col.key)
          return (
            <div key={col.key} className="rounded-2xl border border-border bg-secondary/30 p-3">
              <div className="mb-3 flex items-center justify-between px-1">
                <span className="text-sm font-semibold text-foreground">{col.label}</span>
                <Chip tone={col.tone}>{items.length}</Chip>
              </div>
              <div className="flex flex-col gap-2">
                {items.length === 0 ? (
                  <p className="px-1 py-4 text-center text-xs text-muted-foreground">Nothing here yet</p>
                ) : (
                  items.map((a) => {
                    const o = oppById(a.opportunityId)
                    if (!o) return null
                    return (
                      <div key={a.opportunityId} className="rounded-xl border border-border bg-card p-3">
                        <p className="text-sm font-medium text-card-foreground text-pretty">{o.title}</p>
                        <p className="text-xs text-muted-foreground">{o.org}</p>
                        <div className="mt-2">
                          <Chip tone="muted">{oppTypeLabel[o.type]}</Chip>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>
    </AppShell>
  )
}
