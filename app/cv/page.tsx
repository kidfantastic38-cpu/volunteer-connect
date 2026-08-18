"use client"

import { useRouter } from "next/navigation"
import { Download, Printer, FileText } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { usePrototype, experienceTypeLabel, type CvTemplate } from "@/components/prototype-store"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui-bits"

const templateMeta: Record<CvTemplate, { label: string; hint: string }> = {
  modern: { label: "Modern", hint: "Bold header band, great for creative and community roles." },
  classic: { label: "Classic", hint: "Traditional serif-style structure trusted by formal employers." },
  compact: { label: "Compact", hint: "Tighter spacing to fit more experience on a single page." },
}

export default function CvPage() {
  const router = useRouter()
  const { user, education, experiences, projects, achievements, skills, cvTemplate, setCvTemplate } = usePrototype()
  const template = cvTemplate

  const hasContent = experiences.length + projects.length + education.length + achievements.length > 0

  const accent = template === "modern" ? "var(--primary)" : "var(--foreground)"
  const blockGap = template === "compact" ? "gap-4 px-4 py-5 sm:px-8 sm:py-6" : "gap-6 px-4 py-5 sm:gap-7 sm:px-8 sm:py-7"

  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">CV</h1>
          <p className="text-sm text-muted-foreground">Built from your record. Choose a layout, then print or save as PDF.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-border p-0.5" role="tablist" aria-label="Template">
            {(Object.keys(templateMeta) as CvTemplate[]).map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={template === t}
                title={templateMeta[t].hint}
                onClick={() => setCvTemplate(t)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  template === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {templateMeta[t].label}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="size-4" aria-hidden="true" /> Print
          </Button>
          <Button size="sm" onClick={() => window.print()}>
            <Download className="size-4" aria-hidden="true" /> Export PDF
          </Button>
        </div>
      </div>

      {!hasContent ? (
        <EmptyState
          icon={<FileText className="size-6" aria-hidden="true" />}
          title="Nothing on the CV yet"
          description="Add school, volunteering, or a project to your profile first."
          action={
            <Button onClick={() => router.push("/profile")}>Go to profile</Button>
          }
        />
      ) : (
        <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-border bg-card shadow-sm print:border-0 print:shadow-none">
          {/* CV header */}
          <div
            className="px-4 py-5 sm:px-8 sm:py-7"
            style={{
              backgroundColor: template === "modern" ? "var(--primary)" : "transparent",
              color: template === "modern" ? "var(--primary-foreground)" : "var(--card-foreground)",
              borderBottom: template === "classic" ? "3px solid var(--foreground)" : "none",
            }}
          >
            <h2 className="font-display text-2xl font-bold sm:text-3xl">{user?.name}</h2>
            <p className={template === "modern" ? "text-primary-foreground/85" : "text-muted-foreground"}>
              {user?.headline}
            </p>
            <p className={`mt-1 text-sm ${template === "modern" ? "text-primary-foreground/75" : "text-muted-foreground"}`}>
              {[user?.location, user?.email].filter(Boolean).join("  ·  ")}
            </p>
          </div>

          <div className={`flex flex-col text-card-foreground ${blockGap}`}>
            {user?.about ? (
              <CvBlock title="Profile" accent={accent}>
                <p className="text-sm leading-relaxed text-card-foreground/80">{user.about}</p>
              </CvBlock>
            ) : null}

            {experiences.length > 0 ? (
              <CvBlock title="Experience" accent={accent}>
                <div className="flex flex-col gap-4">
                  {experiences.map((ex) => (
                    <div key={ex.id}>
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="font-semibold">
                          {ex.role} <span className="font-normal text-muted-foreground">· {experienceTypeLabel[ex.type]}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {ex.start} – {ex.end || "Present"}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {ex.organization}
                        {ex.location ? ` · ${ex.location}` : ""}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-card-foreground/80">{ex.description}</p>
                    </div>
                  ))}
                </div>
              </CvBlock>
            ) : null}

            {projects.length > 0 ? (
              <CvBlock title="Projects" accent={accent}>
                <div className="flex flex-col gap-3">
                  {projects.map((p) => (
                    <div key={p.id}>
                      <p className="font-semibold">{p.title}</p>
                      <p className="text-sm leading-relaxed text-card-foreground/80">
                        {p.description} {p.outcome ? <span className="font-medium">— {p.outcome}</span> : null}
                      </p>
                    </div>
                  ))}
                </div>
              </CvBlock>
            ) : null}

            {skills.length > 0 ? (
              <CvBlock title="Skills" accent={accent}>
                <div className="flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <span
                      key={s.id}
                      className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-card-foreground/80"
                    >
                      {s.name}
                      {s.verified ? " ✓" : ""}
                    </span>
                  ))}
                </div>
              </CvBlock>
            ) : null}

            {achievements.length > 0 ? (
              <CvBlock title="Achievements" accent={accent}>
                <ul className="flex flex-col gap-1.5 text-sm text-card-foreground/80">
                  {achievements.map((a) => (
                    <li key={a.id}>
                      <span className="font-medium text-card-foreground">{a.title}</span> — {a.issuer}, {a.date}
                    </li>
                  ))}
                </ul>
              </CvBlock>
            ) : null}

            {education.length > 0 ? (
              <CvBlock title="Education" accent={accent}>
                <div className="flex flex-col gap-3">
                  {education.map((ed) => (
                    <div key={ed.id}>
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="font-semibold">{ed.qualification}</p>
                        <p className="text-xs text-muted-foreground">
                          {ed.start} – {ed.end || "Present"}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {ed.institution}
                        {ed.field ? ` · ${ed.field}` : ""}
                        {ed.location ? ` · ${ed.location}` : ""}
                        {ed.grade ? ` · ${ed.grade}` : ""}
                      </p>
                    </div>
                  ))}
                </div>
              </CvBlock>
            ) : null}
          </div>
        </div>
      )}
    </AppShell>
  )
}

function CvBlock({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <section>
      <h3
        className="mb-3 font-display text-sm font-bold uppercase tracking-wide"
        style={{ color: accent }}
      >
        {title}
      </h3>
      {children}
    </section>
  )
}
