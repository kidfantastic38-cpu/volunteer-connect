"use client"

import Link from "next/link"
import { Briefcase, Users, Eye, Plus, ChevronRight } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { usePrototype, oppTypeLabel } from "@/components/prototype-store"
import { ButtonLink } from "@/components/button-link"
import { Chip, EmptyState } from "@/components/ui-bits"

export default function EmployerDashboard() {
  const { user, opportunities } = usePrototype()
  const mine = opportunities.filter((o) => o.providerId === "me")
  const totalApplicants = mine.reduce((sum, o) => sum + (o.applicants ?? 0), 0)

  const stats = [
    { label: "Live opportunities", value: mine.length, icon: Briefcase },
    { label: "Total applicants", value: totalApplicants, icon: Users },
    { label: "Profile views", value: mine.length * 47, icon: Eye },
  ]

  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            {user?.name ? `${user.name}'s dashboard` : "Provider dashboard"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Post opportunities and discover evidence-backed young talent.
          </p>
        </div>
        <ButtonLink href="/employer/post">
          <Plus className="size-4" aria-hidden="true" /> Post opportunity
        </ButtonLink>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
            <div className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
              <s.icon className="size-5" aria-hidden="true" />
            </div>
            <p className="mt-3 font-display text-3xl font-bold">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
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
            title="No opportunities posted yet"
            description="Post your first role, internship, scholarship or volunteering opportunity to start matching with candidates."
            action={<ButtonLink href="/employer/post">Post an opportunity</ButtonLink>}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {mine.map((o) => (
              <div key={o.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-card-foreground">{o.title}</p>
                    <Chip tone="accent">{oppTypeLabel[o.type]}</Chip>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {o.location} · Closes {o.deadline}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-display text-lg font-bold text-primary">{o.applicants ?? 0}</p>
                    <p className="text-xs text-muted-foreground">applicants</p>
                  </div>
                  <ButtonLink href="/employer/candidates" variant="outline" size="sm">
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
