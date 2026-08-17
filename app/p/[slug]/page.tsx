import { notFound } from "next/navigation"
import { MapPin, Mail, ExternalLink } from "lucide-react"
import { findUserById } from "@/lib/auth/db"
import { getPublicPortfolioBySlug } from "@/lib/auth/public-portfolio"
import { readSession } from "@/lib/auth/session"
import { Chip, SkillBar, VerifiedBadge } from "@/components/ui-bits"
import { Logo } from "@/components/logo"

const themeAccent: Record<string, { accent: string; heroFrom: string }> = {
  aurora: { accent: "var(--primary)", heroFrom: "from-secondary/60" },
  minimal: { accent: "var(--foreground)", heroFrom: "from-muted/60" },
  bold: { accent: "var(--accent)", heroFrom: "from-accent/20" },
}

export default async function PublicPortfolioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const clean = String(slug ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 80)
  const session = await readSession()
  const viewer = session ? await findUserById(session.sub) : null
  const portfolio = clean ? await getPublicPortfolioBySlug(clean, viewer) : null
  if (!portfolio) notFound()

  const theme = themeAccent[portfolio.theme] ?? themeAccent.aurora
  const verifiedCount = portfolio.skills.filter((s) => s.verified).length

  return (
    <div className="min-h-dvh bg-background">
      <header className={`border-b border-border bg-gradient-to-b ${theme.heroFrom} to-background`}>
        <div className="mx-auto max-w-4xl px-4 py-12">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <div
              className="grid size-20 shrink-0 place-items-center rounded-2xl font-display text-2xl font-bold text-primary-foreground"
              style={{ backgroundColor: theme.accent }}
              aria-hidden="true"
            >
              {portfolio.name
                .split(" ")
                .map((part) => part[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground text-balance">{portfolio.name}</h1>
              <p className="text-lg" style={{ color: theme.accent }}>
                {portfolio.headline}
              </p>
              {portfolio.location ? (
                <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="size-3.5" aria-hidden="true" /> {portfolio.location}
                </p>
              ) : null}
            </div>
          </div>
          {portfolio.tagline ? (
            <p className="mt-6 max-w-2xl text-pretty text-lg font-medium text-foreground/90">{portfolio.tagline}</p>
          ) : null}
          {portfolio.about ? (
            <p className="mt-3 max-w-2xl text-pretty leading-relaxed text-foreground/80">{portfolio.about}</p>
          ) : null}
          {portfolio.email ? (
            <a
              href={`mailto:${portfolio.email}`}
              className="mt-5 inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
            >
              <Mail className="size-4" aria-hidden="true" /> {portfolio.email}
            </a>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-6 text-sm">
            <Stat value={portfolio.experiences.length} label="Experiences" />
            <Stat value={portfolio.projects.length} label="Projects" />
            <Stat value={portfolio.achievements.length} label="Achievements" />
            <Stat value={verifiedCount} label="Verified skills" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_260px]">
          <div className="flex flex-col gap-8">
            {portfolio.experiences.length > 0 ? (
              <Section title="Experience">
                {portfolio.experiences.map((item) => (
                  <article key={`${item.role}-${item.organization}`} className="rounded-2xl border border-border bg-card p-5">
                    <h3 className="font-display font-semibold text-card-foreground">{item.role}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.organization} · {item.start} – {item.end || "Present"}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-card-foreground/80">{item.description}</p>
                    {item.skills.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {item.skills.map((skill) => (
                          <Chip key={skill} tone="muted">
                            {skill}
                          </Chip>
                        ))}
                      </div>
                    ) : null}
                  </article>
                ))}
              </Section>
            ) : null}

            {portfolio.projects.length > 0 ? (
              <Section title="Projects">
                <div className="grid gap-4 sm:grid-cols-2">
                  {portfolio.projects.map((item) => (
                    <article key={item.title} className="rounded-2xl border border-border bg-card p-5">
                      <h3 className="font-display font-semibold text-card-foreground">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.role}</p>
                      <p className="mt-2 text-sm leading-relaxed text-card-foreground/80">{item.description}</p>
                      {item.outcome ? <p className="mt-2 text-sm font-medium text-success">{item.outcome}</p> : null}
                      {item.link ? (
                        <a href={item.link} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                          View project <ExternalLink className="size-3.5" aria-hidden="true" />
                        </a>
                      ) : null}
                    </article>
                  ))}
                </div>
              </Section>
            ) : null}

            {portfolio.achievements.length > 0 ? (
              <Section title="Achievements">
                {portfolio.achievements.map((item) => (
                  <article key={item.title} className="rounded-2xl border border-border bg-card p-5">
                    <h3 className="font-display font-semibold text-card-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.issuer} · {item.date}
                    </p>
                    <p className="mt-1 text-sm text-card-foreground/80">{item.description}</p>
                  </article>
                ))}
              </Section>
            ) : null}
          </div>

          <aside className="flex flex-col gap-8">
            {portfolio.skills.length > 0 ? (
              <Section title="Skills">
                <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
                  {portfolio.skills.slice(0, 8).map((skill) => (
                    <SkillBar key={skill.name} name={skill.name} level={skill.level} verified={skill.verified} />
                  ))}
                </div>
              </Section>
            ) : null}
            {portfolio.education.length > 0 ? (
              <Section title="Education">
                <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5">
                  {portfolio.education.map((item) => (
                    <div key={`${item.institution}-${item.qualification}`}>
                      <p className="font-medium text-card-foreground">{item.qualification}</p>
                      <p className="text-sm text-muted-foreground">{item.institution}</p>
                    </div>
                  ))}
                </div>
              </Section>
            ) : null}
            {portfolio.showEvidence ? (
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
                <VerifiedBadge label="Evidence-backed" />
                <p className="mt-2 text-sm text-card-foreground/80">
                  Skills on this portfolio can be self-declared, evidence-backed, or officially verified by the platform.
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
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  )
}
