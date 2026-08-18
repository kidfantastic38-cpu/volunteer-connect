"use client"

import { useMemo } from "react"
import { BadgeCheck, Lightbulb, ListChecks, TrendingUp } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { usePrototype } from "@/components/prototype-store"
import { ButtonLink } from "@/components/button-link"
import { Chip, ProgressBar } from "@/components/ui-bits"

export default function SkillsPage() {
  const { skills, opportunities, experiences, projects } = usePrototype()

  const stats = useMemo(() => {
    const verified = skills.filter((s) => s.verified).length
    const avg = skills.length ? skills.reduce((a, s) => a + s.level, 0) / skills.length : 0
    const byCat = new Map<string, { total: number; count: number; verified: number }>()
    for (const s of skills) {
      const cur = byCat.get(s.category) ?? { total: 0, count: 0, verified: 0 }
      cur.total += s.level
      cur.count += 1
      if (s.verified) cur.verified += 1
      byCat.set(s.category, cur)
    }
    const categories = [...byCat.entries()]
      .map(([name, v]) => ({ name, avg: v.total / v.count, count: v.count, verified: v.verified }))
      .sort((a, b) => b.avg - a.avg)
    return { verified, avg, categories }
  }, [skills])

  // Skill gap: most in-demand skills across opportunities the user doesn't have.
  const gaps = useMemo(() => {
    const mine = new Set(skills.map((s) => s.name.toLowerCase()))
    const demand = new Map<string, number>()
    for (const o of opportunities) {
      for (const sk of o.skills) {
        if (!mine.has(sk.toLowerCase())) demand.set(sk, (demand.get(sk) ?? 0) + 1)
      }
    }
    return [...demand.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [skills, opportunities])

  const strongest = stats.categories[0]

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Skills</h1>
        <p className="text-sm text-muted-foreground text-pretty">
          Listed from your profile, with evidence where you added it.
        </p>
      </div>

      {skills.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
          <p className="font-display text-lg font-semibold">No skills listed</p>
          <p className="mt-1 text-sm text-muted-foreground">Add experience on your profile, then name the skills it used.</p>
          <ButtonLink href="/profile" className="mt-4">
            Go to profile
          </ButtonLink>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={<ListChecks className="size-5" />} label="Listed" value={String(skills.length)} />
            <StatCard
              icon={<BadgeCheck className="size-5" />}
              label="Verified"
              value={`${stats.verified}/${skills.length}`}
              tone="success"
            />
            <StatCard icon={<TrendingUp className="size-5" />} label="Avg. proficiency" value={`${stats.avg.toFixed(1)}/5`} />
            <StatCard
              icon={<Lightbulb className="size-5" />}
              label="Strongest area"
              value={strongest?.name ?? "—"}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Category breakdown */}
            <section className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
              <h2 className="font-display text-lg font-semibold">By category</h2>
              <p className="mt-1 text-sm text-muted-foreground">Average proficiency across each skill area.</p>
              <div className="mt-5 space-y-4">
                {stats.categories.map((c) => (
                  <div key={c.name}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="font-medium">{c.name}</span>
                      <span className="text-muted-foreground">
                        {c.count} {c.count === 1 ? "skill" : "skills"} · {c.verified} verified
                      </span>
                    </div>
                    <ProgressBar value={(c.avg / 5) * 100} />
                  </div>
                ))}
              </div>
            </section>

            {/* Gap analysis */}
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display text-lg font-semibold">Asked for on current openings</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Skills that appear on openings and are not yet on your record.
              </p>
              {gaps.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  None of the current openings ask for a skill you have not listed.
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {gaps.map((g) => (
                    <li key={g.name} className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium">{g.name}</span>
                      <Chip tone="outline">{g.count} roles</Chip>
                    </li>
                  ))}
                </ul>
              )}
              <ButtonLink href="/opportunities" variant="outline" size="sm" className="mt-5 w-full justify-center">
                See openings
              </ButtonLink>
            </section>
          </div>

          {/* All skills with provenance */}
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold">Skills and where they come from</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Each skill is tied to an experience or project you added.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {skills.map((s) => (
                <div key={s.id} className="rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{s.name}</span>
                    {s.verified ? <Chip tone="success">Verified</Chip> : <Chip tone="muted">Self-reported</Chip>}
                  </div>
                  <div className="mt-2 flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`h-1.5 flex-1 rounded-full ${i < s.level ? "bg-primary" : "bg-muted"}`}
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {s.category} · from {s.source}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Drawn from {experiences.length} experiences and {projects.length} projects.
            </p>
          </section>
        </div>
      )}
    </AppShell>
  )
}

function StatCard({
  icon,
  label,
  value,
  tone = "primary",
}: {
  icon: React.ReactNode
  label: string
  value: string
  tone?: "primary" | "success"
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <span
        className={`grid size-9 place-items-center rounded-lg ${
          tone === "success" ? "bg-success/15 text-success" : "bg-primary/10 text-primary"
        }`}
      >
        {icon}
      </span>
      <p className="mt-3 font-display text-2xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}
