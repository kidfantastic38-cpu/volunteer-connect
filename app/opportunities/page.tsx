"use client"

import { useMemo, useState } from "react"
import { Search, MapPin, Calendar, Bookmark, BookmarkCheck, Check } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import {
  usePrototype,
  oppTypeLabel,
  type OppType,
  type Opportunity,
  type ApplicationStatus,
} from "@/components/prototype-store"
import { Button } from "@/components/ui/button"
import { ButtonLink } from "@/components/button-link"
import { OrgTrustBadge } from "@/components/org-badge"
import { Chip, MatchRing, EmptyState } from "@/components/ui-bits"
import { Modal } from "@/components/modal"

const FILTERS: (OppType | "all")[] = ["all", "job", "internship", "scholarship", "volunteering", "training"]

export default function OpportunitiesPage() {
  const { opportunities, matchScore, applications, setApplication, orgBadges } = usePrototype()
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<OppType | "all">("all")
  const [selected, setSelected] = useState<Opportunity | null>(null)

  const statusFor = (id: string): ApplicationStatus | undefined =>
    applications.find((a) => a.opportunityId === id)?.status

  const ranked = useMemo(() => {
    return opportunities
      .map((o) => ({ o, score: matchScore(o) }))
      .filter(({ o }) => (filter === "all" ? true : o.type === filter))
      .filter(({ o }) =>
        query.trim()
          ? `${o.title} ${o.org} ${o.skills.join(" ")}`.toLowerCase().includes(query.toLowerCase())
          : true,
      )
      .sort((a, b) => b.score - a.score)
  }, [opportunities, matchScore, filter, query])

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-foreground">Openings</h1>
        <p className="text-sm text-muted-foreground">
          Jobs, internships, scholarships, volunteering, and training — scored against the skills on your record.
        </p>
      </div>

      {/* Search + filters */}
      <div className="mb-6 flex flex-col gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search roles, organisations or skills"
            aria-label="Search opportunities"
            className="w-full rounded-xl border border-input bg-card py-3 pl-10 pr-4 text-base outline-none ring-ring/40 focus-visible:ring-2 md:text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`min-h-11 rounded-full px-3.5 py-2 text-sm font-medium capitalize transition-colors ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "all" ? "All" : oppTypeLabel[f]}
            </button>
          ))}
        </div>
      </div>

      {ranked.length === 0 ? (
        <EmptyState
          icon={<Search className="size-6" aria-hidden="true" />}
          title="No matches found"
          description="Try clearing your search or filters, or add more skills to your profile to widen your matches."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {ranked.map(({ o, score }) => {
            const status = statusFor(o.id)
            const saved = status === "saved"
            return (
              <article key={o.id} className="flex flex-col rounded-2xl border border-border bg-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Chip tone="accent">{oppTypeLabel[o.type]}</Chip>
                      {o.remote ? <Chip tone="muted">Remote</Chip> : null}
                    </div>
                    <h3 className="mt-2 font-display text-lg font-semibold text-card-foreground text-balance">
                      {o.title}
                    </h3>
                    <p className="inline-flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                      {o.org}
                      <OrgTrustBadge status={orgBadges[o.org.toLowerCase()]} />
                    </p>
                  </div>
                  <MatchRing value={score} size={48} />
                </div>

                <p className="mt-3 line-clamp-2 text-sm text-card-foreground/80">{o.description}</p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {o.skills.slice(0, 4).map((s) => (
                    <Chip key={s} tone="muted">
                      {s}
                    </Chip>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5" aria-hidden="true" /> {o.location}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="size-3.5" aria-hidden="true" /> Closes {o.deadline}
                  </span>
                  {o.compensation ? <span className="font-medium text-card-foreground/80">{o.compensation}</span> : null}
                </div>

                <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-center">
                  <ButtonLink href={`/opportunities/${o.id}`} className="w-full justify-center sm:flex-1">
                    {status && status !== "saved" && status !== "withdrawn" && status !== "rejected" ? "View application" : "View details"}
                  </ButtonLink>
                  <div className="flex gap-2">
                    <Button variant="outline" className="min-w-0 flex-1" onClick={() => setSelected(o)}>
                      Apply
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label={saved ? "Saved" : "Save opportunity"}
                      onClick={() => setApplication(o.id, "saved")}
                    >
                      {saved ? (
                        <BookmarkCheck className="size-4 text-primary" aria-hidden="true" />
                      ) : (
                        <Bookmark className="size-4" aria-hidden="true" />
                      )}
                    </Button>
                  </div>
                </div>
                {status && status !== "saved" ? (
                  <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-success">
                    <Check className="size-3.5" aria-hidden="true" /> {statusLabel(status)}
                  </p>
                ) : null}
              </article>
            )
          })}
        </div>
      )}

      <ApplyModal opportunity={selected} onClose={() => setSelected(null)} />
    </AppShell>
  )
}

function statusLabel(s: ApplicationStatus) {
  return {
    saved: "Saved",
    submitted: "Submitted",
    applied: "Submitted",
    under_review: "Under review",
    interview: "Under review",
    shortlisted: "Shortlisted",
    accepted: "Accepted",
    offer: "Accepted",
    rejected: "Not selected",
    withdrawn: "Withdrawn",
  }[s]
}

function ApplyModal({ opportunity, onClose }: { opportunity: Opportunity | null; onClose: () => void }) {
  const { matchScore, setApplication, applications, user } = usePrototype()
  const [note, setNote] = useState("")
  const [done, setDone] = useState(false)

  if (!opportunity) return null
  const score = matchScore(opportunity)
  const status = applications.find((a) => a.opportunityId === opportunity.id)?.status
  const alreadyApplied = Boolean(status && status !== "saved" && status !== "withdrawn" && status !== "rejected")

  const apply = () => {
    setApplication(opportunity.id, "applied", note)
    setDone(true)
  }

  return (
    <Modal
      open={!!opportunity}
      onClose={() => {
        setDone(false)
        setNote("")
        onClose()
      }}
      title={opportunity.title}
      description={`${opportunity.org} · ${opportunity.location}`}
    >
      {done || alreadyApplied ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <div className="grid size-14 place-items-center rounded-full bg-success/15 text-success">
            <Check className="size-7" aria-hidden="true" />
          </div>
          <p className="font-display text-lg font-semibold text-card-foreground">Application submitted</p>
          <p className="max-w-sm text-sm text-muted-foreground text-pretty">
            {opportunity.org} received your profile, CV and portfolio. You can track progress from your dashboard.
          </p>
          <Button
            onClick={() => {
              setDone(false)
              onClose()
            }}
          >
            Done
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/40 p-3">
            <MatchRing value={score} />
            <div>
              <p className="text-sm font-medium text-card-foreground">{score}% skills match</p>
              <p className="text-xs text-muted-foreground">Based on your verified skills and interests.</p>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-card-foreground/80">{opportunity.description}</p>

          <div className="flex flex-wrap gap-1.5">
            {opportunity.skills.map((s) => (
              <Chip key={s} tone="primary">
                {s}
              </Chip>
            ))}
          </div>

          <div className="rounded-xl border border-border p-3 text-sm">
            <p className="font-medium text-card-foreground">Applying as {user?.name}</p>
            <p className="text-muted-foreground">Your CV and shareable portfolio will be attached automatically.</p>
          </div>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">Message to the provider (optional)</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Why you're a great fit..."
              className="rounded-xl border border-input bg-card px-3 py-2 text-sm outline-none ring-ring/40 focus-visible:ring-2"
            />
          </label>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={apply} className="w-full sm:w-auto">Submit application</Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
