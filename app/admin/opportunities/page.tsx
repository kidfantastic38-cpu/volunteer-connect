"use client"

import { useEffect, useState } from "react"
import { Briefcase } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { AdminConfirm, AdminError, AdminHeader, AdminLoading } from "@/components/admin-ui"
import { Button } from "@/components/ui/button"
import { Chip, EmptyState } from "@/components/ui-bits"
import { adminApi, type AdminOppRow } from "@/lib/admin/client"

export default function AdminOpportunitiesPage() {
  const [rows, setRows] = useState<AdminOppRow[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState<{ id: string; status: "published" | "closed" | "archived"; title: string } | null>(null)

  const load = () => {
    void adminApi
      .opportunities()
      .then((data) => setRows(data.opportunities))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load opportunities."))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <AppShell requiredRole="admin">
      <AdminHeader title="Opportunities" description="Moderate listings without changing employer ownership." />
      <AdminError message={error} />
      {loading ? (
        <AdminLoading />
      ) : rows.length === 0 ? (
        <EmptyState icon={<Briefcase className="size-6" />} title="No opportunities" description="Published and draft listings will appear here." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Organization</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Deadline</th>
                <th className="px-4 py-3">Applications</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3 font-medium">{row.title}</td>
                  <td className="px-4 py-3">{row.organizationName}</td>
                  <td className="px-4 py-3 capitalize">{row.type}</td>
                  <td className="px-4 py-3">
                    <Chip>{row.status}</Chip>
                  </td>
                  <td className="px-4 py-3">{new Date(row.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{row.deadline || "—"}</td>
                  <td className="px-4 py-3">{row.applicants}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(["closed", "archived"] as const).map((status) => (
                        <Button key={status} size="sm" variant="ghost" onClick={() => setPending({ id: row.id, status, title: row.title })}>
                          {status}
                        </Button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <AdminConfirm
        open={!!pending}
        title={`${pending?.status === "archived" ? "Archive" : "Close"} this opportunity?`}
        description={`“${pending?.title ?? ""}” will change status. Employer ownership is not changed.`}
        confirmLabel={pending?.status === "archived" ? "Archive" : "Close"}
        onClose={() => setPending(null)}
        onConfirm={() => {
          if (!pending) return
          const next = pending
          setPending(null)
          void adminApi
            .patchOpportunity(next.id, next.status)
            .then(load)
            .catch((err: unknown) => setError(err instanceof Error ? err.message : "Update failed."))
        }}
      />
    </AppShell>
  )
}
