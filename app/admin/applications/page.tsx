"use client"

import { useEffect, useState } from "react"
import { FileText } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { AdminError, AdminHeader, AdminLoading } from "@/components/admin-ui"
import { Button } from "@/components/ui/button"
import { Chip, EmptyState } from "@/components/ui-bits"
import { adminApi, type AdminAppRow, type AdminEmployerRow, type AdminOppRow } from "@/lib/admin/client"

export default function AdminApplicationsPage() {
  const [rows, setRows] = useState<AdminAppRow[]>([])
  const [employers, setEmployers] = useState<AdminEmployerRow[]>([])
  const [opps, setOpps] = useState<AdminOppRow[]>([])
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("")
  const [organizationId, setOrganizationId] = useState("")
  const [opportunityId, setOpportunityId] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  const load = () => {
    const params = new URLSearchParams()
    if (query.trim()) params.set("q", query.trim())
    if (status) params.set("status", status)
    if (organizationId) params.set("organizationId", organizationId)
    if (opportunityId) params.set("opportunityId", opportunityId)
    void adminApi
      .applications(params.toString() ? `?${params}` : "")
      .then((data) => setRows(data.applications))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load applications."))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    void adminApi.employers().then((data) => setEmployers(data.employers)).catch(() => undefined)
    void adminApi.opportunities().then((data) => setOpps(data.opportunities)).catch(() => undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, organizationId, opportunityId])

  return (
    <AppShell requiredRole="admin">
      <AdminHeader title="Applications" description="Platform-level application summaries for support and moderation." />
      <AdminError message={error} />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
          placeholder="Search student, opportunity, or organization"
          className="flex-1 rounded-xl border border-input bg-card px-3 py-2 text-sm"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-input bg-card px-3 py-2 text-sm">
          <option value="">All statuses</option>
          <option value="submitted">Submitted</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="withdrawn">Withdrawn</option>
        </select>
        <select value={organizationId} onChange={(e) => setOrganizationId(e.target.value)} className="rounded-xl border border-input bg-card px-3 py-2 text-sm">
          <option value="">All organizations</option>
          {employers.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
        <select value={opportunityId} onChange={(e) => setOpportunityId(e.target.value)} className="rounded-xl border border-input bg-card px-3 py-2 text-sm">
          <option value="">All opportunities</option>
          {opps.map((opp) => (
            <option key={opp.id} value={opp.id}>
              {opp.title}
            </option>
          ))}
        </select>
        <Button onClick={() => { setLoading(true); load() }}>Search</Button>
      </div>
      {loading ? (
        <AdminLoading />
      ) : rows.length === 0 ? (
        <EmptyState icon={<FileText className="size-6" />} title="No applications" description="No matching records." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Opportunity</th>
                <th className="px-4 py-3">Organization</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Applied</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3">
                    {row.studentName}
                    <p className="text-xs text-muted-foreground">{row.studentEmail}</p>
                  </td>
                  <td className="px-4 py-3">{row.opportunityTitle}</td>
                  <td className="px-4 py-3">{row.organizationName}</td>
                  <td className="px-4 py-3">
                    <Chip>{row.status}</Chip>
                  </td>
                  <td className="px-4 py-3">{new Date(row.appliedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  )
}
