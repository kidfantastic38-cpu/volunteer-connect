"use client"

import { useEffect, useState } from "react"
import { Building2, Loader2 } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { OrgTrustBadge } from "@/components/org-badge"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui-bits"
import { Modal } from "@/components/modal"
import { Textarea } from "@/components/form-controls"
import { apiListVerifications, apiReviewVerification } from "@/lib/auth/client"
import type { VerificationListItem, VerificationStatus } from "@/lib/org/types"

export default function AdminEmployersPage() {
  const [requests, setRequests] = useState<VerificationListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [busyId, setBusyId] = useState<string | null>(null)
  const [moreInfo, setMoreInfo] = useState<VerificationListItem | null>(null)
  const [notes, setNotes] = useState("")

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

  return (
    <AppShell requiredRole="admin">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight">Employer verification</h1>
        <p className="text-sm text-muted-foreground">
          Approve organizations before they can post opportunities or receive applications.
        </p>
      </div>

      {error ? (
        <p className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Loading verification requests…
        </p>
      ) : requests.length === 0 ? (
        <EmptyState
          icon={<Building2 className="size-6" aria-hidden="true" />}
          title="No employer requests"
          description="New employer registrations will appear here for review."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Organization</th>
                <th className="px-4 py-3 font-medium">Owner</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Website</th>
                <th className="px-4 py-3 font-medium">Registration</th>
                <th className="px-4 py-3 font-medium">Submitted</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {requests.map((item) => (
                <tr key={item.requestId}>
                  <td className="px-4 py-3 font-medium">{item.organizationName}</td>
                  <td className="px-4 py-3">{item.ownerName}</td>
                  <td className="px-4 py-3">{item.organizationEmail || item.ownerEmail}</td>
                  <td className="px-4 py-3">
                    {item.website ? (
                      <a href={item.website} className="text-primary hover:underline" target="_blank" rel="noreferrer">
                        {item.website.replace(/^https?:\/\//, "")}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3">{item.registrationNumber || "—"}</td>
                  <td className="px-4 py-3">{new Date(item.submittedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <OrgTrustBadge status={item.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      <Button
                        size="sm"
                        disabled={busyId === item.organizationId || item.status === "approved"}
                        onClick={() => review(item, "approved")}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === item.organizationId || item.status === "rejected"}
                        onClick={() => review(item, "rejected")}
                      >
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

      <Modal
        open={!!moreInfo}
        onClose={() => setMoreInfo(null)}
        title="Request more information"
        description={moreInfo ? `Ask ${moreInfo.organizationName} for extra details.` : ""}
      >
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What should the employer provide?"
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setMoreInfo(null)}>
            Cancel
          </Button>
          <Button
            disabled={!moreInfo}
            onClick={() => moreInfo && review(moreInfo, "more_info", notes)}
          >
            Send request
          </Button>
        </div>
      </Modal>
    </AppShell>
  )
}
