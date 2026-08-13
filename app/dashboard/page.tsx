"use client"

import Link from "next/link"
import {
  Award,
  ChevronRight,
  Compass,
  FileText,
  GraduationCap,
  HeartHandshake,
  LayoutGrid,
  Share2,
  Sparkles,
} from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { ButtonLink } from "@/components/button-link"
import { Chip, MatchRing, ProgressBar, SkillBar } from "@/components/ui-bits"
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
  const topMatches = [...opportunities]
    .map((o) => ({ o, score: store.matchScore(o) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)

  const stats = [
    { label: "Education", value: education.length, icon: GraduationCap, href: "/profile?tab=education" },
    { label: "Experiences", value: experiences.length, icon: HeartHandshake, href: "/profile?tab=experience" },
    { label: "Projects", value: projects.length, icon: LayoutGrid, href: "/profile?tab=projects" },
    { label: "Achievements", value: achievements.length, icon: Award, href: "/profile?tab=achievements" },
  ]

  const checklist = [
    { key: "basics", label: "Complete your basics", href: "/profile" },
    { key: "education", label: "Add your education", href: "/profile?tab=education" },
    { key: "experience", label: "Add an experience", href: "/profile?tab=experience" },
    { key: "projects", label: "Add a project", href: "/profile?tab=projects" },
    { key: "achievements", label: "Add an achievement", href: "/profile?tab=achievements" },
    { key: "skills", label: "Confirm your skills", href: "/profile?tab=skills" },
  ] as const

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-balance">
            Welcome back, {user.name.split(" ")[0]}
          </h1>
          {user.headline ? <p className="mt-1 text-sm text-muted-foreground text-pretty">{user.headline}</p> : null}
        </div>
        <ButtonLink href="/cv">
          <FileText className="size-4" aria-hidden="true" />
          Generate CV
        </ButtonLink>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Completion */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-semibold">Profile strength</h2>
                <p className="text-sm text-muted-foreground">A stronger profile means better matches.</p>
              </div>
              <span className="font-display text-2xl font-bold text-primary">{completion}%</span>
            </div>
            <ProgressBar value={completion} />
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {checklist.map((c) => {
                const done = onboarding[c.key as keyof typeof onboarding]
                return (
                  <Link
                    key={c.key}
                    href={c.href}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
                      done ? "border-success/30 bg-success/5" : "border-border hover:bg-muted",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-5 place-items-center rounded-full text-[10px] font-bold",
                        done ? "bg-success text-success-foreground" : "border border-border text-muted-foreground",
                      )}
                    >
                      {done ? "✓" : ""}
                    </span>
                    <span className={cn(done ? "text-foreground" : "text-muted-foreground")}>{c.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((s) => (
              <Link key={s.label} href={s.href} className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary">
                <s.icon className="size-5 text-primary" aria-hidden="true" />
                <p className="mt-3 font-display text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </Link>
            ))}
          </div>

          {/* Top matches */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-semibold">Recommended for you</h2>
                <p className="text-sm text-muted-foreground">Matched to your skills and interests.</p>
              </div>
              <Link href="/opportunities" className="inline-flex items-center text-sm font-medium text-primary hover:underline">
                See all <ChevronRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
            <ul className="space-y-3">
              {topMatches.map(({ o, score }) => (
                <li key={o.id}>
                  <Link
                    href="/opportunities"
                    className="flex items-center gap-4 rounded-xl border border-border p-3 transition-colors hover:bg-muted"
                  >
                    <MatchRing value={score} size={52} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium">{o.title}</p>
                        <Chip tone="accent">{oppTypeLabel[o.type]}</Chip>
                      </div>
                      <p className="truncate text-sm text-muted-foreground">
                        {o.org} · {o.location}
                      </p>
                    </div>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-1 font-display text-lg font-semibold">Your skills</h2>
            <p className="mb-4 text-sm text-muted-foreground">{skills.length} skills detected</p>
            {skills.length > 0 ? (
              <div className="space-y-3">
                {skills.slice(0, 5).map((s) => (
                  <SkillBar key={s.id} name={s.name} level={s.level} verified={s.verified} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Add experiences to detect skills.</p>
            )}
            <ButtonLink href="/profile?tab=skills" variant="outline" className="mt-4 w-full">
              Manage skills
            </ButtonLink>
          </div>

          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
            <Sparkles className="size-6 text-primary" aria-hidden="true" />
            <h2 className="mt-3 font-display text-base font-semibold">Ready to share?</h2>
            <p className="mt-1 text-sm text-muted-foreground text-pretty">
              Generate a polished CV and a shareable portfolio from your profile in one click.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <ButtonLink href="/cv">
                <FileText className="size-4" aria-hidden="true" />
                Build my CV
              </ButtonLink>
              <ButtonLink href="/portfolio" variant="outline">
                <Share2 className="size-4" aria-hidden="true" />
                View portfolio
              </ButtonLink>
            </div>
          </div>

          <ButtonLink href="/opportunities" variant="outline" className="w-full">
            <Compass className="size-4" aria-hidden="true" />
            Explore opportunities
          </ButtonLink>
        </div>
      </div>
    </div>
  )
}
