"use client"

import { useState } from "react"
import { MapPin, ShieldCheck, ExternalLink, Mail } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { ButtonLink } from "@/components/button-link"
import { Button } from "@/components/ui/button"
import { Chip, MatchRing, VerifiedBadge } from "@/components/ui-bits"
import { Modal } from "@/components/modal"

type Candidate = {
  id: string
  name: string
  headline: string
  location: string
  match: number
  verifiedSkills: string[]
  otherSkills: string[]
  highlight: string
  hours: number
}

const CANDIDATES: Candidate[] = [
  {
    id: "c1",
    name: "Amara Okafor",
    headline: "Aspiring community & sustainability leader",
    location: "Manchester, UK",
    match: 92,
    verifiedSkills: ["Leadership", "Communication", "Organization", "Teamwork"],
    otherSkills: ["Content Creation", "Analytics"],
    highlight: "Led a campus recycling drive that diverted 1.2 tonnes of waste and won a regional award.",
    hours: 240,
  },
  {
    id: "c2",
    name: "Diego Fernandes",
    headline: "Youth football coach & mentor",
    location: "Leeds, UK",
    match: 81,
    verifiedSkills: ["Leadership", "Teamwork", "Communication"],
    otherSkills: ["Problem Solving"],
    highlight: "Coached a youth football team for two seasons and coordinated weekend tournaments.",
    hours: 180,
  },
  {
    id: "c3",
    name: "Priya Sharma",
    headline: "STEM ambassador & event organiser",
    location: "Remote",
    match: 74,
    verifiedSkills: ["Organization", "Communication"],
    otherSkills: ["Technical", "Creativity"],
    highlight: "Ran coding workshops for 60+ younger students and managed the event logistics end to end.",
    hours: 120,
  },
  {
    id: "c4",
    name: "Samuel Ako",
    headline: "Food bank volunteer & fundraiser",
    location: "Birmingham, UK",
    match: 68,
    verifiedSkills: ["Teamwork", "Organization"],
    otherSkills: ["Communication"],
    highlight: "Volunteered 200+ hours and raised £3,400 through a community fundraising campaign.",
    hours: 210,
  },
]

export default function CandidatesPage() {
  const [selected, setSelected] = useState<Candidate | null>(null)
  const [contacted, setContacted] = useState<Record<string, boolean>>({})

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight">Matched candidates</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ranked by verified skill fit for your posted opportunities.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {CANDIDATES.map((c) => (
          <article key={c.id} className="flex flex-col rounded-2xl border border-border bg-card p-5">
            <div className="flex items-start gap-4">
              <div
                className="grid size-12 shrink-0 place-items-center rounded-xl font-display font-bold text-primary-foreground"
                style={{ backgroundColor: "var(--primary)" }}
                aria-hidden="true"
              >
                {c.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-display font-semibold text-card-foreground">{c.name}</h2>
                <p className="text-sm text-primary">{c.headline}</p>
                <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3.5" aria-hidden="true" /> {c.location} · {c.hours} volunteer hrs
                </p>
              </div>
              <MatchRing value={c.match} />
            </div>

            <p className="mt-3 text-sm text-card-foreground/80">{c.highlight}</p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {c.verifiedSkills.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-medium text-success"
                >
                  <ShieldCheck className="size-3" aria-hidden="true" /> {s}
                </span>
              ))}
              {c.otherSkills.map((s) => (
                <Chip key={s} tone="muted">
                  {s}
                </Chip>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
              <Button size="sm" variant="outline" className="flex-1" onClick={() => setSelected(c)}>
                <ExternalLink className="size-4" aria-hidden="true" /> View portfolio
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={() => setContacted((m) => ({ ...m, [c.id]: true }))}
                disabled={contacted[c.id]}
              >
                <Mail className="size-4" aria-hidden="true" /> {contacted[c.id] ? "Contacted" : "Contact"}
              </Button>
            </div>
          </article>
        ))}
      </div>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name ?? ""}
        description={selected?.headline}
      >
        {selected ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/40 p-3">
              <MatchRing value={selected.match} />
              <div>
                <p className="text-sm font-medium text-card-foreground">{selected.match}% skill match</p>
                <VerifiedBadge label={`${selected.verifiedSkills.length} verified skills`} />
              </div>
            </div>
            <p className="text-sm leading-relaxed text-card-foreground/80">{selected.highlight}</p>
            <div className="flex flex-wrap gap-1.5">
              {[...selected.verifiedSkills, ...selected.otherSkills].map((s) => (
                <Chip key={s} tone="primary">
                  {s}
                </Chip>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              In the live product, this opens the candidate&apos;s full evidence-backed portfolio with references and certificates.
            </p>
            <div className="flex justify-end">
              <ButtonLink href="/portfolio">Open sample portfolio</ButtonLink>
            </div>
          </div>
        ) : null}
      </Modal>
    </AppShell>
  )
}
