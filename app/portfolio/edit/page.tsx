"use client"

import { Check, ExternalLink, Globe, Rocket } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { ButtonLink } from "@/components/button-link"
import { usePrototype, type PortfolioTheme, type Visibility } from "@/components/prototype-store"
import { Field, TextInput, TextArea, Toggle } from "@/components/form-controls"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui-bits"

const themes: { id: PortfolioTheme; label: string; swatch: string; note: string }[] = [
  { id: "aurora", label: "Aurora", swatch: "var(--primary)", note: "Indigo gradient, energetic and modern." },
  { id: "minimal", label: "Minimal", swatch: "var(--foreground)", note: "Understated, content-first, monochrome." },
  { id: "bold", label: "Bold", swatch: "var(--accent)", note: "Warm amber highlights that stand out." },
]

const visibilities: { id: Visibility; label: string; note: string }[] = [
  { id: "public", label: "Public", note: "Anyone with the link, indexed and searchable." },
  { id: "unlisted", label: "Unlisted", note: "Only people you share the link with." },
  { id: "private", label: "Private", note: "Only you can view it while you keep building." },
]

export default function PortfolioBuilderPage() {
  const { portfolio, updatePortfolio, publishPortfolio } = usePrototype()

  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Portfolio builder</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Design how your evidence-backed portfolio looks and who can see it.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ButtonLink href="/portfolio" variant="outline" size="sm">
            <ExternalLink className="size-4" aria-hidden="true" /> Preview
          </ButtonLink>
          {portfolio.published ? (
            <Chip tone="success">
              <Check className="mr-1 inline size-3.5" aria-hidden="true" /> Live
            </Chip>
          ) : (
            <Button size="sm" onClick={publishPortfolio}>
              <Rocket className="size-4" aria-hidden="true" /> Publish
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Theme */}
        <section className="rounded-xl border border-border bg-card p-5 shadow-e1">
          <h2 className="font-display text-base font-semibold">Theme</h2>
          <p className="mt-1 text-sm text-muted-foreground">Pick a look that matches your story.</p>
          <div className="mt-4 space-y-2">
            {themes.map((t) => {
              const active = portfolio.theme === t.id
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => updatePortfolio({ theme: t.id })}
                  className={
                    "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors " +
                    (active ? "border-primary bg-primary/5" : "border-border hover:bg-muted")
                  }
                >
                  <span
                    className="size-8 shrink-0 rounded-lg"
                    style={{ backgroundColor: t.swatch }}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-foreground">{t.label}</span>
                    <span className="block text-xs text-muted-foreground">{t.note}</span>
                  </span>
                  {active ? <Check className="size-4 text-primary" aria-hidden="true" /> : null}
                </button>
              )
            })}
          </div>
        </section>

        {/* Visibility */}
        <section className="rounded-xl border border-border bg-card p-5 shadow-e1">
          <h2 className="font-display text-base font-semibold">Visibility</h2>
          <p className="mt-1 text-sm text-muted-foreground">Control who can reach your portfolio.</p>
          <div className="mt-4 space-y-2">
            {visibilities.map((v) => {
              const active = portfolio.visibility === v.id
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => updatePortfolio({ visibility: v.id })}
                  className={
                    "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors " +
                    (active ? "border-primary bg-primary/5" : "border-border hover:bg-muted")
                  }
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-foreground">{v.label}</span>
                    <span className="block text-xs text-muted-foreground">{v.note}</span>
                  </span>
                  {active ? <Check className="size-4 text-primary" aria-hidden="true" /> : null}
                </button>
              )
            })}
          </div>
        </section>

        {/* Details */}
        <section className="rounded-xl border border-border bg-card p-5 shadow-e1 lg:col-span-2">
          <h2 className="font-display text-base font-semibold">Details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Public link" htmlFor="slug" hint="Your portfolio address on VOLUNTEER CONNECT.">
              <div className="flex items-center rounded-lg border border-input bg-background pl-3 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30">
                <Globe className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span className="pl-2 text-sm text-muted-foreground">vc.app/</span>
                <input
                  id="slug"
                  value={portfolio.slug}
                  onChange={(e) =>
                    updatePortfolio({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })
                  }
                  className="h-10 flex-1 bg-transparent px-1 text-sm text-foreground outline-none"
                />
              </div>
            </Field>
            <Field label="Tagline" htmlFor="tagline" hint="A one-line headline shown at the top.">
              <TextArea
                id="tagline"
                value={portfolio.tagline}
                onChange={(e) => updatePortfolio({ tagline: e.target.value })}
                className="min-h-10"
                rows={2}
              />
            </Field>
          </div>

          <div className="mt-2 divide-y divide-border">
            <Toggle
              id="show-contact"
              checked={portfolio.showContact}
              onChange={(v) => updatePortfolio({ showContact: v })}
              label="Show contact email"
              description="Let employers reach out to you directly from the portfolio."
            />
            <Toggle
              id="show-evidence"
              checked={portfolio.showEvidence}
              onChange={(v) => updatePortfolio({ showEvidence: v })}
              label="Show evidence badge"
              description="Highlight that your skills are backed by verified records."
            />
          </div>
        </section>
      </div>
    </AppShell>
  )
}
