"use client"

import { useEffect, useState } from "react"
import { Building2 } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { AdminConfirm, AdminError, AdminHeader, AdminLoading, AdminStack, AdminCard } from "@/components/admin-ui"
import { OrgTrustBadge } from "@/components/org-badge"
import { Modal } from "@/components/modal"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui-bits"
import { adminApi, type AdminEmployerRow, type AdminVerificationHistory } from "@/lib/admin/client"

export default function AdminEmployersPage() {
  const [rows, setRows] = useState<AdminEmployerRow[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [detail, setDetail] = useState<AdminEmployerRow | null>(null)
  const [history, setHistory] = useState<AdminVerificationHistory[]>([])
  const [pending, setPending] = useState<AdminEmployerRow | null>(null)

  const load = () => {
    void adminApi
      .employers()
      .then((data) => setRows(data.employers))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load employers."))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const openDetail = (row: AdminEmployerRow) => {
    setDetail(row)
    setHistory([])
    void adminApi
      .employer(row.id)
      .then((data) => {
        setDetail(data.employer)
        setHistory(data.history)
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load organization."))
  }

  return (
    <AppShell requiredRole="admin">
      <AdminHeader title="Employers" description="Organizations, owners, and verification status." />
      <AdminError message={error} />
      {loading ? (
        <AdminLoading />
      ) : rows.length === 0 ? (
        <EmptyState icon={<Building2 className="size-6" />} title="No employers yet" description="Employer registrations will appear here." />
      ) : (
        <AdminStack
          mobile={rows.map((row) => (
            <AdminCard key={row.id}>
              <p className="font-medium">{row.name}</p>
              <p className="text-sm text-muted-foreground">{row.ownerName}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <OrgTrustBadge status={row.verificationStatus as "pending" | "approved" | "rejected" | "more_info"} />
                {row.suspended ? <p className="text-xs text-destructive">Suspended</p> : null}
              </div>
              <p className="mt-2 text-sm">{row.organizationEmail}</p>
              <p className="text-xs text-muted-foreground">{row.organizationType} · {new Date(row.createdAt).toLocaleDateString()}</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => openDetail(row)}>
                  View
                </Button>
                <Button variant={row.suspended ? "outline" : "ghost"} disabled={busy === row.id} onClick={() => setPending(row)}>
                  {row.suspended ? "Unsuspend" : "Suspend"}
                </Button>
              </div>
            </AdminCard>
          ))}
          desktop={
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Organization</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Registered</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3 font-medium">{row.name}</td>
                  <td className="px-4 py-3">
                    {row.ownerName}
                    <p className="text-xs text-muted-foreground">{row.ownerEmail}</p>
                  </td>
                  <td className="px-4 py-3">{row.organizationType}</td>
                  <td className="px-4 py-3">{row.organizationEmail}</td>
                  <td className="px-4 py-3">
                    <OrgTrustBadge status={row.verificationStatus as "pending" | "approved" | "rejected" | "more_info"} />
                    {row.suspended ? <p className="text-xs text-destructive">Suspended</p> : null}
                  </td>
                  <td className="px-4 py-3">{new Date(row.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      <Button size="sm" variant="outline" onClick={() => openDetail(row)}>
                        View
                      </Button>
                      <Button size="sm" variant={row.suspended ? "outline" : "ghost"} disabled={busy === row.id} onClick={() => setPending(row)}>
                        {row.suspended ? "Unsuspend" : "Suspend"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          }
        />
      )}
      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail?.name || "Organization"}>
        {detail ? (
          <div className="space-y-3 text-sm">
            <p>
              <span className="text-muted-foreground">Owner:</span> {detail.ownerName} ({detail.ownerEmail})
            </p>
            <p>
              <span className="text-muted-foreground">Type:</span> {detail.organizationType}
            </p>
            <p>
              <span className="text-muted-foreground">Email:</span> {detail.organizationEmail}
            </p>
            <p>
              <span className="text-muted-foreground">Phone:</span> {detail.phone || "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Website:</span> {detail.website || "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Registration no.:</span> {detail.registrationNumber || "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Address:</span> {detail.address || "—"}
            </p>
            <h3 className="pt-2 font-medium">Verification history</h3>
            {history.length === 0 ? (
              <p className="text-muted-foreground">No verification records.</p>
            ) : (
              <ul className="space-y-2">
                {history.map((item) => (
                  <li key={item.id} className="rounded-lg border border-border px-3 py-2">
                    <p className="capitalize">{item.status.replace("_", " ")}</p>
                    <p className="text-xs text-muted-foreground">{new Date(item.submittedAt).toLocaleString()}</p>
                    {item.notes ? <p className="mt-1">{item.notes}</p> : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </Modal>
      <AdminConfirm
        open={!!pending}
        title={pending?.suspended ? "Unsuspend organization?" : "Suspend organization?"}
        description="This does not delete the organization or its listings. Suspended employers cannot post until restored."
        confirmLabel={pending?.suspended ? "Unsuspend" : "Suspend"}
        busy={!!pending && busy === pending.id}
        onClose={() => setPending(null)}
        onConfirm={() => {
          if (!pending) return
          setBusy(pending.id)
          void adminApi
            .patchEmployer(pending.id, { suspended: !pending.suspended })
            .then(() => {
              setPending(null)
              load()
            })
            .catch((err: unknown) => setError(err instanceof Error ? err.message : "Update failed."))
            .finally(() => setBusy(null))
        }}
      />
    </AppShell>
  )
}
