"use client"

import { Briefcase, FolderTree, TrendingUp, UserCheck, Users } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { usePrototype } from "@/components/prototype-store"
import { ButtonLink } from "@/components/button-link"
import { Chip } from "@/components/ui-bits"

export default function AdminOverviewPage() {
  const { adminUsers, opportunities, categories } = usePrototype()

  const students = adminUsers.filter((u) => u.role === "student").length
  const employers = adminUsers.filter((u) => u.role === "employer").length
  const pending = adminUsers.filter((u) => u.status === "pending").length
  const activeCats = categories.filter((c) => c.active).length

  const recent = [...adminUsers].slice(-4).reverse()

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight">Platform overview</h1>
        <p className="text-sm text-muted-foreground">A snapshot of activity across VolunteerConnect.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={<Users className="size-5" />} label="Students" value={students} />
        <Stat icon={<Briefcase className="size-5" />} label="Employers" value={employers} />
        <Stat icon={<UserCheck className="size-5" />} label="Pending approval" value={pending} tone="accent" />
        <Stat icon={<TrendingUp className="size-5" />} label="Live opportunities" value={opportunities.length} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Recent sign-ups</h2>
            <ButtonLink href="/admin/users" variant="ghost" size="sm">
              View all
            </ButtonLink>
          </div>
          <div className="mt-4 divide-y divide-border">
            {recent.map((u) => (
              <div key={u.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{u.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Chip tone="muted">{u.role}</Chip>
                  <StatusChip status={u.status} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <FolderTree className="size-5 text-primary" aria-hidden="true" />
            <h2 className="font-display text-lg font-semibold">Taxonomy</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {activeCats} of {categories.length} skill categories active.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((c) => (
              <Chip key={c.id} tone={c.active ? "primary" : "muted"}>
                {c.name}
              </Chip>
            ))}
          </div>
          <ButtonLink href="/admin/categories" variant="outline" size="sm" className="mt-5 w-full justify-center">
            Manage categories
          </ButtonLink>
        </section>
      </div>
    </AppShell>
  )
}

function Stat({
  icon,
  label,
  value,
  tone = "primary",
}: {
  icon: React.ReactNode
  label: string
  value: number
  tone?: "primary" | "accent"
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <span
        className={`grid size-9 place-items-center rounded-lg ${
          tone === "accent" ? "bg-accent/25 text-accent-foreground" : "bg-primary/10 text-primary"
        }`}
      >
        {icon}
      </span>
      <p className="mt-3 font-display text-3xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

export function StatusChip({ status }: { status: "active" | "pending" | "suspended" }) {
  const map = {
    active: { tone: "success" as const, label: "Active" },
    pending: { tone: "accent" as const, label: "Pending" },
    suspended: { tone: "muted" as const, label: "Suspended" },
  }
  const { tone, label } = map[status]
  return <Chip tone={tone}>{label}</Chip>
}
