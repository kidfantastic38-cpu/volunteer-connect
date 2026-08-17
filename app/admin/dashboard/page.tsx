"use client"

import { useEffect, useState } from "react"
import { Briefcase, Building2, FileText, Sparkles, UserCheck, Users } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { AdminError, AdminHeader, AdminLoading } from "@/components/admin-ui"
import { ButtonLink } from "@/components/button-link"
import { adminApi } from "@/lib/admin/client"

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Record<string, number> | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    void adminApi
      .stats()
      .then((data) => setStats(data.stats))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load overview."))
  }, [])

  const cards = [
    { key: "totalStudents", label: "Total Students", icon: Users },
    { key: "totalEmployers", label: "Total Employers", icon: Building2 },
    { key: "verifiedEmployers", label: "Verified Employers", icon: UserCheck },
    { key: "pendingEmployerVerifications", label: "Pending Employer Verifications", icon: UserCheck },
    { key: "totalOpportunities", label: "Total Opportunities", icon: Briefcase },
    { key: "publishedOpportunities", label: "Published Opportunities", icon: Briefcase },
    { key: "totalApplications", label: "Total Applications", icon: FileText },
    { key: "pendingSkillVerifications", label: "Pending Skill Verifications", icon: Sparkles },
  ]

  return (
    <AppShell requiredRole="admin">
      <AdminHeader
        title="Admin overview"
        description="Live platform totals from PostgreSQL."
        actions={
          <ButtonLink href="/admin/verifications" variant="outline" size="sm">
            Review employers
          </ButtonLink>
        }
      />
      <AdminError message={error} />
      {!stats ? (
        <AdminLoading label="Loading dashboard…" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <div key={card.key} className="rounded-2xl border border-border bg-card p-5">
              <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                <card.icon className="size-5" aria-hidden="true" />
              </span>
              <p className="mt-3 font-display text-3xl font-bold">{stats[card.key] ?? 0}</p>
              <p className="text-sm text-muted-foreground">{card.label}</p>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  )
}
