"use client"

import { Briefcase } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { ButtonLink } from "@/components/button-link"
import { Button } from "@/components/ui/button"
import { usePrototype, oppTypeLabel, type ApplicationStatus } from "@/components/prototype-store"
import { Chip, EmptyState } from "@/components/ui-bits"
import { apiWithdrawApplication } from "@/lib/auth/client"

const COLUMNS: { keys: ApplicationStatus[]; label: string; tone: "muted" | "primary" | "accent" | "success" }[] = [
  { keys: ["saved"], label: "Saved", tone: "muted" },
  { keys: ["submitted", "applied"], label: "Submitted", tone: "primary" },
  { keys: ["under_review", "interview", "shortlisted"], label: "In review", tone: "accent" },
  { keys: ["accepted", "offer"], label: "Accepted", tone: "success" },
]

function canWithdraw(status: ApplicationStatus) {
  return status === "submitted" || status === "applied" || status === "under_review" || status === "interview" || status === "shortlisted"
}

export default function ApplicationsPage() {
  const { applications, opportunities, refreshMarketplace } = usePrototype()

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
        <p className="text-sm text-muted-foreground">Track every opportunity from saved to accepted. Status comes from the server.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map((col) => {
          const items = applications.filter((a) => col.keys.includes(a.status))
          return (
            <div key={col.label} className="rounded-2xl border border-border bg-secondary/30 p-3">
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
                    const title = o?.title || a.opportunityTitle || "Opportunity"
                    const org = o?.org || a.organizationName || ""
                    return (
                      <div key={a.id || a.opportunityId} className="rounded-xl border border-border bg-card p-3">
                        <p className="text-sm font-medium text-card-foreground text-pretty">{title}</p>
                        <p className="text-xs text-muted-foreground">{org}</p>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <Chip tone="muted">{o ? oppTypeLabel[o.type] : a.status}</Chip>
                          {a.id && !a.id.startsWith("saved:") && canWithdraw(a.status) ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                void apiWithdrawApplication(a.id!).then(() => refreshMarketplace())
                              }}
                            >
                              Withdraw
                            </Button>
                          ) : null}
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
