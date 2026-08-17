"use client"

import { useEffect, useState } from "react"
import { Building2, Loader2 } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { AdminError, AdminHeader } from "@/components/admin-ui"
import { OrgTrustBadge } from "@/components/org-badge"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui-bits"
import { Modal } from "@/components/modal"
import { Textarea } from "@/components/form-controls"
import { apiListVerifications, apiReviewVerification } from "@/lib/auth/client"
import type { VerificationListItem, VerificationStatus } from "@/lib/org/types"

export default function AdminVerificationsPage() {
  const [requests, setRequests] = useState<VerificationListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [busyId, setBusyId] = useState<string | null>(null)
  const [moreInfo, setMoreInfo] = useState<VerificationListItem | null>(null)
  const [notes, setNotes] = useState("")
  const [filter, setFilter] = useState<VerificationStatus | "all">("all")

  useEffect(() => {
    void apiListVerifications()
      .then(setRequests)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load requests."))
      .finally(() => setLoading(false))
  }, [])

  const review = (item: VerificationListItem, status: VerificationStatus, reviewNotes?: string) => {
    setBusyId(item.organizationId)
    setError("")
    void apiReviewVerification({ organizationId: item.organizationId, status, notes: reviewNotes })
      .then(setRequests)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not update verification."))
      .finally(() => {
        setBusyId(null)
        setMoreInfo(null)
        setNotes("")
      })
  }

  const visible = requests.filter((item) => filter === "all" || item.status === filter)

  return (
    <AppShell requiredRole="admin">
      <AdminHeader title="Employer verification" description="Approve, reject, or request more information. Status is stored server-side." />
      <AdminError message={error} />
      <div className="mb-4 flex flex-wrap gap-2">
        {(["all", "pending", "approved", "rejected", "more_info"] as const).map((value) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium capitalize ${
              filter === value ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground"
            }`}
          >
            {value.replace("_", " ")}
          </button>
        ))}
      </div>
      {loading ? (
        <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading verification requests…
        </p>
      ) : visible.length === 0 ? (
        <EmptyState icon={<Building2 className="size-6" />} title="No requests" description="Nothing in this queue." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Organization</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visible.map((item) => (
                <tr key={item.requestId}>
                  <td className="px-4 py-3 font-medium">{item.organizationName}</td>
                  <td className="px-4 py-3">{item.ownerName}</td>
                  <td className="px-4 py-3">{item.organizationEmail || item.ownerEmail}</td>
                  <td className="px-4 py-3">{new Date(item.submittedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <OrgTrustBadge status={item.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      <Button size="sm" disabled={busyId === item.organizationId} onClick={() => review(item, "approved")}>
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" disabled={busyId === item.organizationId} onClick={() => review(item, "rejected")}>
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={busyId === item.organizationId}
                        onClick={() => {
                          setMoreInfo(item)
                          setNotes(item.notes)
                        }}
                      >
                        Request more information
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={!!moreInfo} onClose={() => setMoreInfo(null)} title="Request more information">
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What should the employer provide?" />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setMoreInfo(null)}>
            Cancel
          </Button>
          <Button disabled={!moreInfo} onClick={() => moreInfo && review(moreInfo, "more_info", notes)}>
            Send request
          </Button>
        </div>
      </Modal>
    </AppShell>
  )
}
