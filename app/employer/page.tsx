"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Briefcase, Plus, ChevronRight } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { OrgTrustBadge } from "@/components/org-badge"
import { VerificationBanner } from "@/components/verification-banner"
import { usePrototype, oppTypeLabel } from "@/components/prototype-store"
import { ButtonLink } from "@/components/button-link"
import { Chip, EmptyState } from "@/components/ui-bits"
import { apiGetOrganization, apiUpdateEmployerOpportunity, apiArchiveOpportunity } from "@/lib/auth/client"
import { Button } from "@/components/ui/button"

export default function EmployerDashboard() {
  const { user, opportunities, organization, setOrganization, refreshMarketplace } = usePrototype()
  const verified = organization?.verificationStatus === "approved"

  useEffect(() => {
    void apiGetOrganization()
      .then(setOrganization)
      .catch(() => undefined)
  }, [setOrganization])
  const mine = opportunities.filter((o) => organization && o.organizationId === organization.id)
  const totalApplicants = mine.reduce((sum, o) => sum + (o.applicants ?? 0), 0)
  const newApplicants = totalApplicants

  const stats = [
    { label: "Openings posted", value: mine.length },
    { label: "Applications", value: totalApplicants },
    { label: "New applications", value: newApplicants },
  ]

  return (
    <AppShell requiredRole="employer">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            {organization?.name || user?.name || "Organisation"}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <p className="text-sm text-muted-foreground">
              Openings you have posted, and applications received.
            </p>
            <OrgTrustBadge status={organization?.verificationStatus} />
          </div>
        </div>
        {verified ? (
          <ButtonLink href="/employer/post">
            <Plus className="size-4" aria-hidden="true" /> Post opportunity
          </ButtonLink>
        ) : (
          <ButtonLink href="/employer/organization" variant="outline">
            Complete organization profile
          </ButtonLink>
        )}
      </div>
      <VerificationBanner status={organization?.verificationStatus} />

      <div className="mb-6 grid grid-cols-1 gap-px overflow-hidden border border-border bg-border sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-card px-5 py-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="mt-1 font-display text-2xl font-semibold tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Your opportunities</h2>
          <Link href="/employer/candidates" className="inline-flex items-center text-sm font-medium text-primary hover:underline">
            View candidates <ChevronRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        {mine.length === 0 ? (
          <EmptyState
            icon={<Briefcase className="size-6" aria-hidden="true" />}
            title="No openings posted yet"
            description="Post a job, internship, scholarship, volunteering role, or training place."
            action={
              verified ? (
                <ButtonLink href="/employer/post">Post an opportunity</ButtonLink>
              ) : (
                <ButtonLink href="/employer/organization" variant="outline">
                  Complete organization profile
                </ButtonLink>
              )
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {mine.map((o) => (
              <div key={o.id} className="flex flex-col gap-3 rounded-xl border border-border p-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-card-foreground text-pretty">{o.title}</p>
                    <Chip tone="accent">{oppTypeLabel[o.type]}</Chip>
                    <Chip tone="muted">{o.status || "published"}</Chip>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {o.location} · Closes {o.deadline} · {o.applicants ?? 0} applicants
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {o.status === "draft" ? (
                      <Button variant="outline" onClick={() => void apiUpdateEmployerOpportunity(o.id, { status: "published" }).then(() => refreshMarketplace())}>
                        Publish
                      </Button>
                    ) : null}
                    {o.status === "published" ? (
                      <Button variant="outline" onClick={() => void apiUpdateEmployerOpportunity(o.id, { status: "closed" }).then(() => refreshMarketplace())}>
                        Close
                      </Button>
                    ) : null}
                    <Button variant="ghost" onClick={() => void apiArchiveOpportunity(o.id).then(() => refreshMarketplace())}>
                      Archive
                    </Button>
                    <ButtonLink href="/employer/candidates" variant="outline" className="justify-center">
                      Review
                    </ButtonLink>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  )
}
