"use client"

import Link from "next/link"
import { ChevronRight, FileText } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { ButtonLink } from "@/components/button-link"
import { Chip, ProgressBar, SkillBar } from "@/components/ui-bits"
import { oppTypeLabel, profileCompletion, usePrototype } from "@/components/prototype-store"
import { cn } from "@/lib/utils"

export default function DashboardPage() {
  return (
    <AppShell>
      <DashboardContent />
    </AppShell>
  )
}

function DashboardContent() {
  const store = usePrototype()
  const { user, onboarding, education, experiences, projects, achievements, skills, opportunities } = store
  if (!user) return null

  const completion = profileCompletion({ onboarding })
  const firstName = user.name.split(" ")[0]
  const topMatches = [...opportunities]
    .map((o) => ({ o, score: store.matchScore(o) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)

  const stats = [
    { label: "Education", value: education.length, href: "/profile?tab=education" },
    { label: "Experience", value: experiences.length, href: "/profile?tab=experience" },
    { label: "Projects", value: projects.length, href: "/profile?tab=projects" },
    { label: "Awards", value: achievements.length, href: "/profile?tab=achievements" },
  ]

  const checklist = [
    { key: "basics", label: "Basics", href: "/profile" },
    { key: "education", label: "Education", href: "/profile?tab=education" },
    { key: "experience", label: "Experience", href: "/profile?tab=experience" },
    { key: "projects", label: "A project", href: "/profile?tab=projects" },
    { key: "achievements", label: "An award", href: "/profile?tab=achievements" },
    { key: "skills", label: "Skills", href: "/profile?tab=skills" },
  ] as const

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-balance">{firstName}</h1>
          <p className="mt-1 max-w-md text-sm text-muted-foreground text-pretty">
            {user.headline || "Your record, and openings that fit what you have listed."}
          </p>
        </div>
        <ButtonLink href="/cv" variant="outline">
          <FileText className="size-4" aria-hidden="true" />
          Open CV
        </ButtonLink>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <section>
            <div className="mb-3 flex items-baseline justify-between gap-4">
              <h2 className="font-display text-lg font-semibold">Your record</h2>
              <span className="text-sm tabular-nums text-muted-foreground">{completion}% complete</span>
            </div>
            <ProgressBar value={completion} className="h-1.5" />
            <ul className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2">
              {checklist.map((c) => {
                const done = onboarding[c.key as keyof typeof onboarding]
                return (
                  <li key={c.key}>
                    <Link
                      href={c.href}
                      className="flex items-center gap-2 py-1 text-sm hover:text-foreground"
                    >
                      <span
                        className={cn(
                          "size-1.5 shrink-0 rounded-full",
                          done ? "bg-primary" : "bg-border",
                        )}
                        aria-hidden="true"
                      />
                      <span className={done ? "text-foreground" : "text-muted-foreground"}>{c.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>

          <dl className="grid grid-cols-2 gap-px overflow-hidden border border-border bg-border sm:grid-cols-4">
            {stats.map((s) => (
              <Link
                key={s.label}
                href={s.href}
                className="bg-card px-4 py-4 transition-colors hover:bg-muted"
              >
                <dt className="text-xs text-muted-foreground">{s.label}</dt>
                <dd className="mt-1 font-display text-2xl font-semibold tabular-nums">{s.value}</dd>
              </Link>
            ))}
          </dl>

          <section>
            <div className="mb-3 flex items-baseline justify-between gap-4">
              <h2 className="font-display text-lg font-semibold">Openings that fit</h2>
              <Link href="/opportunities" className="inline-flex items-center text-sm text-primary hover:underline">
                All openings <ChevronRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
            <ul className="divide-y divide-border border-y border-border">
              {topMatches.map(({ o, score }) => (
                <li key={o.id}>
                  <Link href="/opportunities" className="flex items-start gap-4 py-4 transition-colors hover:bg-muted/40">
                    <span className="w-10 shrink-0 pt-0.5 text-sm tabular-nums text-muted-foreground">{score}%</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-medium">{o.title}</p>
                        <Chip tone="muted">{oppTypeLabel[o.type]}</Chip>
                      </div>
                      <p className="truncate text-sm text-muted-foreground">
                        {o.org} · {o.location}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-8">
          <section>
            <h2 className="mb-1 font-display text-lg font-semibold">Skills</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              {skills.length === 0
                ? "None listed yet."
                : `${skills.length} on your record`}
            </p>
            {skills.length > 0 ? (
              <div className="space-y-3">
                {skills.slice(0, 5).map((s) => (
                  <SkillBar key={s.id} name={s.name} level={s.level} verified={s.verified} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Add experience, then name the skills it used.</p>
            )}
            <ButtonLink href="/profile?tab=skills" variant="outline" className="mt-4 w-full">
              Edit skills
            </ButtonLink>
          </section>

          <section className="border-t border-border pt-6">
            <h2 className="font-display text-base font-semibold">CV and public page</h2>
            <p className="mt-1 text-sm text-muted-foreground text-pretty">
              Built from the same record. Print a CV or share a link.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <ButtonLink href="/cv" variant="outline">
                CV
              </ButtonLink>
              <ButtonLink href="/portfolio" variant="outline">
                Public page
              </ButtonLink>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
