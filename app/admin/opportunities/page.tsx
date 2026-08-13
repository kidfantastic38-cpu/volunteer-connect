"use client"

import { useMemo, useState } from "react"
import { Briefcase, MapPin, Search, Trash2 } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { usePrototype } from "@/components/prototype-store"
import { Chip, EmptyState } from "@/components/ui-bits"
import { TextInput } from "@/components/form-controls"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/modal"

export default function AdminOpportunitiesPage() {
  const { opportunities, removeOpportunity } = usePrototype()
  const [query, setQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [pendingRemove, setPendingRemove] = useState<string | null>(null)

  const types = useMemo(() => ["all", ...Array.from(new Set(opportunities.map((o) => o.type)))], [opportunities])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return opportunities.filter((o) => {
      const matchesType = typeFilter === "all" || o.type === typeFilter
      const matchesQuery =
        q === "" || o.title.toLowerCase().includes(q) || o.org.toLowerCase().includes(q) || o.location.toLowerCase().includes(q)
      return matchesType && matchesQuery
    })
  }, [opportunities, query, typeFilter])

  const removing = opportunities.find((o) => o.id === pendingRemove)

  return (
    <AppShell requiredRole="admin">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight">Opportunity management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review and moderate every opportunity listed across the platform.
        </p>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <TextInput
            aria-label="Search opportunities"
            placeholder="Search by title, organisation or location"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {types.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              className={
                "rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors " +
                (typeFilter === t
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground")
              }
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="size-5" aria-hidden="true" />}
          title="No opportunities found"
          description="Try adjusting your search or filters."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-e1">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Opportunity</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Type</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Location</th>
                <th className="hidden px-4 py-3 font-medium lg:table-cell">Skills</th>
                <th className="px-4 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((o) => (
                <tr key={o.id} className="align-top">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{o.title}</p>
                    <p className="text-xs text-muted-foreground">{o.org}</p>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <Chip tone="muted" className="capitalize">
                      {o.type}
                    </Chip>
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3.5" aria-hidden="true" />
                      {o.location}
                    </span>
                  </td>
                  <td className="hidden max-w-xs px-4 py-3 lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {o.skills.slice(0, 3).map((s) => (
                        <Chip key={s} tone="muted">
                          {s}
                        </Chip>
                      ))}
                      {o.skills.length > 3 ? (
                        <span className="text-xs text-muted-foreground">+{o.skills.length - 3}</span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPendingRemove(o.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                      <span className="sr-only sm:not-sr-only">Remove</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={pendingRemove !== null}
        onClose={() => setPendingRemove(null)}
        title="Remove opportunity"
        description={removing ? `"${removing.title}" will be removed from the platform for all users.` : ""}
      >
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setPendingRemove(null)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (pendingRemove) removeOpportunity(pendingRemove)
              setPendingRemove(null)
            }}
          >
            Remove opportunity
          </Button>
        </div>
      </Modal>
    </AppShell>
  )
}
