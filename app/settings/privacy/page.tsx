"use client"

import { ArrowLeft, Globe, Link2, Lock } from "lucide-react"
import Link from "next/link"
import { AppShell } from "@/components/app-shell"
import { usePrototype, type Visibility } from "@/components/prototype-store"
import { Toggle } from "@/components/form-controls"
import { cn } from "@/lib/utils"

const visibilityOptions: { value: Visibility; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: "public",
    label: "Public",
    description: "Anyone with the link can view, and it can appear in search engines.",
    icon: <Globe className="size-5" aria-hidden="true" />,
  },
  {
    value: "unlisted",
    label: "Unlisted",
    description: "Only people with the direct link can view. Not indexed or searchable.",
    icon: <Link2 className="size-5" aria-hidden="true" />,
  },
  {
    value: "private",
    label: "Private",
    description: "Only you can view. Employers you apply to still receive your CV.",
    icon: <Lock className="size-5" aria-hidden="true" />,
  },
]

export default function PrivacyPage() {
  const { privacy, updatePrivacy, portfolio, updatePortfolio } = usePrototype()

  return (
    <AppShell>
      <Link
        href="/settings"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> Back to settings
      </Link>

      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight">Privacy &amp; portfolio visibility</h1>
        <p className="text-sm text-muted-foreground text-pretty">
          Decide who can discover your profile and how much of your portfolio is shared.
        </p>
      </div>

      <div className="mx-auto max-w-2xl space-y-6">
        {/* Discoverability */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold">Discoverability</h2>
          <div className="mt-2 divide-y divide-border">
            <Toggle
              checked={privacy.searchable}
              onChange={(v) => updatePrivacy({ searchable: v })}
              label="Show my profile in search"
              description="Let opportunity providers find you when searching for candidates."
            />
            <Toggle
              checked={privacy.showToEmployers}
              onChange={(v) => updatePrivacy({ showToEmployers: v })}
              label="Visible to employers"
              description="Allow verified employers to view your full profile and evidence."
            />
            <Toggle
              checked={privacy.shareAnalytics}
              onChange={(v) => updatePrivacy({ shareAnalytics: v })}
              label="Share anonymous analytics"
              description="Help improve matching by sharing anonymised usage data."
            />
          </div>
        </section>

        {/* Portfolio visibility */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold">Portfolio visibility</h2>
          <p className="mt-1 text-sm text-muted-foreground">Choose who can open your public portfolio link.</p>
          <div className="mt-4 space-y-3">
            {visibilityOptions.map((opt) => {
              const active = portfolio.visibility === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updatePortfolio({ visibility: opt.value })}
                  aria-pressed={active}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors",
                    active ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:bg-muted",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-10 shrink-0 place-items-center rounded-lg",
                      active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {opt.icon}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{opt.label}</span>
                    <span className="mt-0.5 block text-sm text-muted-foreground text-pretty">{opt.description}</span>
                  </span>
                </button>
              )
            })}
          </div>

          <div className="mt-4 divide-y divide-border border-t border-border pt-2">
            <Toggle
              checked={portfolio.showContact}
              onChange={(v) => updatePortfolio({ showContact: v })}
              label="Show contact details"
              description="Display a contact button on your public portfolio."
            />
            <Toggle
              checked={portfolio.showEvidence}
              onChange={(v) => updatePortfolio({ showEvidence: v })}
              label="Show verified evidence"
              description="Reveal certificates and references attached to your work."
            />
          </div>
        </section>
      </div>
    </AppShell>
  )
}
