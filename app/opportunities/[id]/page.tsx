"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Building2,
  Calendar,
  Check,
  CircleDollarSign,
  MapPin,
  Users,
  X,
} from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { usePrototype, oppTypeLabel } from "@/components/prototype-store"
import { Button } from "@/components/ui/button"
import { ButtonLink } from "@/components/button-link"
import { Chip, MatchRing, EmptyState } from "@/components/ui-bits"
import { Modal } from "@/components/modal"

export default function OpportunityDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { opportunities, matchScore, skills, applications, setApplication, user } = usePrototype()

  const opportunity = opportunities.find((o) => o.id === id)
  const [showApply, setShowApply] = useState(false)
  const [note, setNote] = useState("")
  const [applied, setApplied] = useState(false)

  if (!opportunity) {
    return (
      <AppShell>
        <EmptyState
          icon={<X className="size-6" aria-hidden="true" />}
          title="Opportunity not found"
          description="This opportunity may have closed or been removed."
          action={<ButtonLink href="/opportunities">Back to opportunities</ButtonLink>}
        />
      </AppShell>
    )
  }

  const score = matchScore(opportunity)
  const status = applications.find((a) => a.opportunityId === opportunity.id)?.status
  const saved = status === "saved"
  const alreadyApplied = status === "applied" || status === "interview" || status === "offer"

  // Per-skill breakdown: which required skills the user has vs. gaps.
  const mySkills = new Map(skills.map((s) => [s.name.toLowerCase(), s]))
  const breakdown = opportunity.skills.map((req) => {
    const mine = mySkills.get(req.toLowerCase())
    return { name: req, has: !!mine, level: mine?.level ?? 0, verified: mine?.verified ?? false }
  })
  const matched = breakdown.filter((b) => b.has)
  const gaps = breakdown.filter((b) => !b.has)

  const related = opportunities
    .filter((o) => o.id !== opportunity.id && o.type === opportunity.type)
    .slice(0, 3)

  const submit = () => {
    setApplication(opportunity.id, "applied")
    setApplied(true)
  }

  return (
    <AppShell>
      <button
        onClick={() => router.back()}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> Back
      </button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Chip tone="accent">{oppTypeLabel[opportunity.type]}</Chip>
              {opportunity.remote ? <Chip tone="muted">Remote</Chip> : null}
              {alreadyApplied ? <Chip tone="success">{statusLabel(status!)}</Chip> : null}
            </div>
            <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-balance">{opportunity.title}</h1>
            <p className="mt-1 text-muted-foreground">{opportunity.org}</p>

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-4" aria-hidden="true" /> {opportunity.location}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="size-4" aria-hidden="true" /> Closes {opportunity.deadline}
              </span>
              {opportunity.compensation ? (
                <span className="inline-flex items-center gap-1.5">
                  <CircleDollarSign className="size-4" aria-hidden="true" /> {opportunity.compensation}
                </span>
              ) : null}
              {typeof opportunity.applicants === "number" ? (
                <span className="inline-flex items-center gap-1.5">
                  <Users className="size-4" aria-hidden="true" /> {opportunity.applicants} applicants
                </span>
              ) : null}
            </div>
          </div>

          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold">About this opportunity</h2>
            <p className="mt-2 leading-relaxed text-card-foreground/80">{opportunity.description}</p>
            <p className="mt-3 leading-relaxed text-card-foreground/80">
              You&apos;ll work alongside an experienced team, gaining hands-on experience and mentoring. This is a great
              fit for someone eager to grow their {opportunity.skills[0]?.toLowerCase()} and{" "}
              {opportunity.skills[1]?.toLowerCase() ?? "teamwork"} skills while making a real impact.
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold">Skills &amp; profile match</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              How your verified profile lines up with what this role needs.
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <p className="mb-2 text-sm font-medium text-success">You already have ({matched.length})</p>
                <div className="space-y-2">
                  {matched.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No direct matches yet — see the gaps below.</p>
                  ) : (
                    matched.map((m) => (
                      <div key={m.name} className="flex items-center justify-between rounded-lg bg-success/10 px-3 py-2">
                        <span className="inline-flex items-center gap-2 text-sm font-medium">
                          <Check className="size-4 text-success" aria-hidden="true" /> {m.name}
                          {m.verified ? <Chip tone="success">Verified</Chip> : null}
                        </span>
                        <div className="flex gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span
                              key={i}
                              className={`h-1.5 w-5 rounded-full ${i < m.level ? "bg-success" : "bg-success/25"}`}
                            />
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {gaps.length > 0 ? (
                <div>
                  <p className="mb-2 text-sm font-medium text-muted-foreground">Skills to build ({gaps.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {gaps.map((g) => (
                      <Chip key={g.name} tone="outline">
                        {g.name}
                      </Chip>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Add experiences or evidence for these to raise your match score.
                  </p>
                </div>
              ) : null}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 text-center">
            <div className="mx-auto w-fit">
              <MatchRing value={score} size={88} />
            </div>
            <p className="mt-3 font-display text-lg font-semibold">{score}% match</p>
            <p className="text-sm text-muted-foreground text-pretty">
              {score >= 70 ? "Strong fit for your profile" : score >= 40 ? "A good growth opportunity" : "A stretch — but worth exploring"}
            </p>

            <div className="mt-5 flex flex-col gap-2">
              {alreadyApplied ? (
                <ButtonLink href="/applications" className="w-full">
                  Track application
                </ButtonLink>
              ) : (
                <Button className="w-full" onClick={() => setShowApply(true)}>
                  Apply now
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setApplication(opportunity.id, "saved")}
                disabled={saved || alreadyApplied}
              >
                {saved ? (
                  <>
                    <BookmarkCheck className="size-4 text-primary" aria-hidden="true" /> Saved
                  </>
                ) : (
                  <>
                    <Bookmark className="size-4" aria-hidden="true" /> Save for later
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <Building2 className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="font-medium">{opportunity.org}</p>
                <p className="text-sm text-muted-foreground">Opportunity provider</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-card-foreground/80">
              A verified organisation on VolunteerConnect committed to developing young talent.
            </p>
          </div>

          {related.length > 0 ? (
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-display text-sm font-semibold">Similar opportunities</h3>
              <div className="mt-3 space-y-3">
                {related.map((r) => (
                  <Link
                    key={r.id}
                    href={`/opportunities/${r.id}`}
                    className="block rounded-lg border border-border p-3 transition-colors hover:bg-muted"
                  >
                    <p className="text-sm font-medium text-card-foreground">{r.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.org} · {matchScore(r)}% match
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Apply modal */}
      <Modal
        open={showApply}
        onClose={() => {
          setShowApply(false)
          setApplied(false)
          setNote("")
        }}
        title={applied ? "Application submitted" : `Apply — ${opportunity.title}`}
        description={applied ? undefined : `${opportunity.org} · ${opportunity.location}`}
      >
        {applied ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="grid size-14 place-items-center rounded-full bg-success/15 text-success">
              <Check className="size-7" aria-hidden="true" />
            </div>
            <p className="max-w-sm text-sm text-muted-foreground text-pretty">
              {opportunity.org} received your profile, CV and portfolio. Track progress from your applications.
            </p>
            <div className="flex gap-2">
              <ButtonLink href="/applications">Track application</ButtonLink>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowApply(false)
                  setApplied(false)
                }}
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-border p-3 text-sm">
              <p className="font-medium text-card-foreground">Applying as {user?.name}</p>
              <p className="text-muted-foreground">Your CV and shareable portfolio attach automatically.</p>
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
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowApply(false)}>
                Cancel
              </Button>
              <Button onClick={submit}>Submit application</Button>
            </div>
          </div>
        )}
      </Modal>
    </AppShell>
  )
}

function statusLabel(s: string) {
  return (
    { saved: "Saved", applied: "Applied", interview: "Interview stage", offer: "Offer received", rejected: "Not selected" }[
      s
    ] ?? s
  )
}
