"use client"

import { useState } from "react"
import { ArrowLeft, Share2, Check, MapPin, ExternalLink, Pencil, EyeOff, Mail } from "lucide-react"
import { usePrototype, experienceTypeLabel, type PortfolioTheme } from "@/components/prototype-store"
import { Button } from "@/components/ui/button"
import { ButtonLink } from "@/components/button-link"
import { Chip, SkillBar, VerifiedBadge } from "@/components/ui-bits"
import { Logo } from "@/components/logo"

const themeAccent: Record<PortfolioTheme, { accent: string; heroFrom: string }> = {
  aurora: { accent: "var(--primary)", heroFrom: "from-secondary/60" },
  minimal: { accent: "var(--foreground)", heroFrom: "from-muted/60" },
  bold: { accent: "var(--accent)", heroFrom: "from-accent/20" },
}

export default function PortfolioPage() {
  const { user, education, experiences, projects, achievements, skills, portfolio } = usePrototype()
  const [copied, setCopied] = useState(false)
  const theme = themeAccent[portfolio.theme]

  const share = async () => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/p/${portfolio.slug || "portfolio"}`
        : ""
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      /* ignore */
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const verifiedCount = skills.filter((s) => s.verified).length

  return (
    <div className="min-h-dvh bg-background">
      {/* Owner toolbar */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
          <ButtonLink href="/dashboard" variant="ghost" size="sm">
            <ArrowLeft className="size-4" aria-hidden="true" /> Back to dashboard
          </ButtonLink>
          <div className="flex items-center gap-2">
            <Chip tone={portfolio.published ? "success" : "muted"}>
              {portfolio.published ? "Published" : "Draft"}
            </Chip>
            {portfolio.visibility !== "public" ? (
              <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:inline-flex">
                <EyeOff className="size-3.5" aria-hidden="true" /> {portfolio.visibility}
              </span>
            ) : null}
            <ButtonLink href="/portfolio/edit" variant="outline" size="sm">
              <Pencil className="size-4" aria-hidden="true" /> Edit
            </ButtonLink>
            <Button size="sm" onClick={share}>
              {copied ? <Check className="size-4" aria-hidden="true" /> : <Share2 className="size-4" aria-hidden="true" />}
              {copied ? "Link copied" : "Share"}
            </Button>
          </div>
        </div>
      </div>

      {/* Public hero */}
      <header className={`border-b border-border bg-gradient-to-b ${theme.heroFrom} to-background`}>
        <div className="mx-auto max-w-4xl px-4 py-12">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <div
              className="grid size-20 shrink-0 place-items-center rounded-2xl font-display text-2xl font-bold text-primary-foreground"
              style={{ backgroundColor: theme.accent }}
              aria-hidden="true"
            >
              {(user?.name ?? "?")
                .split(" ")
                .map((p) => p[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground text-balance">{user?.name}</h1>
              <p className="text-lg" style={{ color: theme.accent }}>
                {user?.headline}
              </p>
              {user?.location ? (
                <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="size-3.5" aria-hidden="true" /> {user.location}
                </p>
              ) : null}
            </div>
          </div>

          {portfolio.tagline ? (
            <p className="mt-6 max-w-2xl text-pretty text-lg font-medium text-foreground/90">{portfolio.tagline}</p>
          ) : null}
          {user?.about ? (
            <p className="mt-3 max-w-2xl text-pretty leading-relaxed text-foreground/80">{user.about}</p>
          ) : null}

          {portfolio.showContact && user?.email ? (
            <a
              href={`mailto:${user.email}`}
              className="mt-5 inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
            >
              <Mail className="size-4" aria-hidden="true" /> {user.email}
            </a>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-6 text-sm">
            <Stat value={experiences.length} label="Experiences" />
            <Stat value={projects.length} label="Projects" />
            <Stat value={achievements.length} label="Achievements" />
            <Stat value={verifiedCount} label="Verified skills" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_260px]">
          <div className="flex flex-col gap-8">
            {experiences.length > 0 ? (
              <Section title="Experience">
                <div className="flex flex-col gap-4">
                  {experiences.map((ex) => (
                    <article key={ex.id} className="rounded-2xl border border-border bg-card p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display font-semibold text-card-foreground">{ex.role}</h3>
                        <Chip tone="primary">{experienceTypeLabel[ex.type]}</Chip>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {ex.organization} · {ex.start} – {ex.end || "Present"}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-card-foreground/80">{ex.description}</p>
                      {ex.skills.length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {ex.skills.map((s) => (
                            <Chip key={s} tone="muted">
                              {s}
                            </Chip>
                          ))}
                        </div>
                      ) : null}
                    </article>
                  ))}
                </div>
              </Section>
            ) : null}

            {projects.length > 0 ? (
              <Section title="Projects">
                <div className="grid gap-4 sm:grid-cols-2">
                  {projects.map((p) => (
                    <article key={p.id} className="rounded-2xl border border-border bg-card p-5">
                      <h3 className="font-display font-semibold text-card-foreground">{p.title}</h3>
                      <p className="text-sm text-muted-foreground">{p.role}</p>
                      <p className="mt-2 text-sm leading-relaxed text-card-foreground/80">{p.description}</p>
                      {p.outcome ? <p className="mt-2 text-sm font-medium text-success">{p.outcome}</p> : null}
                      {p.link ? (
                        <a
                          href={p.link}
                          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                        >
                          View project <ExternalLink className="size-3.5" aria-hidden="true" />
                        </a>
                      ) : null}
                    </article>
                  ))}
                </div>
              </Section>
            ) : null}

            {achievements.length > 0 ? (
              <Section title="Achievements">
                <div className="flex flex-col gap-3">
                  {achievements.map((a) => (
                    <article key={a.id} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5">
                      <div className="min-w-0">
                        <h3 className="font-display font-semibold text-card-foreground">{a.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {a.issuer} · {a.date}
                        </p>
                        <p className="mt-1 text-sm text-card-foreground/80">{a.description}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </Section>
            ) : null}
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-8">
            {skills.length > 0 ? (
              <Section title="Skills">
                <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
                  {skills.slice(0, 8).map((s) => (
                    <SkillBar key={s.id} name={s.name} level={s.level} verified={s.verified} />
                  ))}
                </div>
              </Section>
            ) : null}

            {education.length > 0 ? (
              <Section title="Education">
                <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5">
                  {education.map((ed) => (
                    <div key={ed.id}>
                      <p className="font-medium text-card-foreground">{ed.qualification}</p>
                      <p className="text-sm text-muted-foreground">{ed.institution}</p>
                      <p className="text-xs text-muted-foreground">
                        {ed.start} – {ed.end || "Present"}
                      </p>
                    </div>
                  ))}
                </div>
              </Section>
            ) : null}

            {portfolio.showEvidence ? (
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
                <VerifiedBadge label="Evidence-backed" />
                <p className="mt-2 text-sm text-card-foreground/80">
                  Skills and achievements on this portfolio are supported by references, certificates and verified records.
                </p>
              </div>
            ) : null}
          </aside>
        </div>

        <footer className="mt-12 flex items-center justify-center gap-2 border-t border-border pt-6 text-sm text-muted-foreground">
          <Logo className="text-foreground" />
          <span>· Portfolio built with VOLUNTEER CONNECT</span>
        </footer>
      </main>
    </div>
  )
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <p className="font-display text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 font-display text-xl font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  )
}
