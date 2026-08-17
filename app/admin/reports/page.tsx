"use client"

import { useEffect, useState } from "react"
import { AppShell } from "@/components/app-shell"
import { AdminError, AdminHeader, AdminLoading } from "@/components/admin-ui"
import { adminApi, type AdminReports } from "@/lib/admin/client"

function StatList({ title, data }: { title: string; data: Record<string, number> }) {
  const entries = Object.entries(data)
  const max = Math.max(1, ...entries.map(([, n]) => n))
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h2 className="font-display text-base font-semibold">{title}</h2>
      {entries.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">No data yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {entries.map(([label, n]) => (
            <li key={label}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="capitalize">{label.replaceAll("_", " ")}</span>
                <span className="font-medium">{n}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${Math.round((n / max) * 100)}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<AdminReports | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    void adminApi
      .reports()
      .then((data) => setReports(data.reports))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load reports."))
  }, [])

  return (
    <AppShell requiredRole="admin">
      <AdminHeader title="Reports" description="Server-side aggregates from PostgreSQL. These numbers are not fabricated." />
      <AdminError message={error} />
      {!reports ? (
        <AdminLoading label="Loading reports…" />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <StatList title="Students vs employers" data={reports.usersByRole} />
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display text-base font-semibold">Verified employers</h2>
            <p className="mt-3 font-display text-3xl font-bold">{reports.verifiedEmployers}</p>
            <p className="text-sm text-muted-foreground">Organizations with approved verification.</p>
          </section>
          <StatList title="Opportunities by type" data={reports.opportunitiesByType} />
          <StatList title="Published vs closed opportunities" data={reports.opportunitiesByStatus} />
          <StatList title="Applications by opportunity type" data={reports.applicationsByOpportunityType} />
          <StatList title="Application status distribution" data={reports.applicationsByStatus} />
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display text-base font-semibold">User growth</h2>
            {reports.userGrowth.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">No registrations yet.</p>
            ) : (
              <ul className="mt-4 space-y-2 text-sm">
                {reports.userGrowth.map((row) => (
                  <li key={row.month} className="flex justify-between">
                    <span>{row.month}</span>
                    <span className="font-medium">{row.n}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display text-base font-semibold">Most common skills</h2>
            {reports.commonSkills.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">No student skills yet.</p>
            ) : (
              <ul className="mt-4 space-y-2 text-sm">
                {reports.commonSkills.map((row) => (
                  <li key={row.name} className="flex justify-between">
                    <span>{row.name}</span>
                    <span className="font-medium">{row.n}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </AppShell>
  )
}
