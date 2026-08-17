"use client"

import { useEffect, useState } from "react"
import { MapPin, ShieldCheck, ExternalLink, Mail } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { VerificationBanner } from "@/components/verification-banner"
import { ButtonLink } from "@/components/button-link"
import { Button } from "@/components/ui/button"
import { Chip, MatchRing, VerifiedBadge } from "@/components/ui-bits"
import { Modal } from "@/components/modal"
import { usePrototype } from "@/components/prototype-store"
import { apiEmployerCandidates, apiUpdateApplication, type ApiCandidate } from "@/lib/auth/client"

export default function CandidatesPage() {
  const { organization } = usePrototype()
  const [candidates, setCandidates] = useState<ApiCandidate[]>([])
  const [selected, setSelected] = useState<ApiCandidate | null>(null)
  const [contacted, setContacted] = useState<Record<string, boolean>>({})
  const verified = organization?.verificationStatus === "approved"

  useEffect(() => {
    if (!verified) return
    void apiEmployerCandidates().then(setCandidates)
  }, [verified])

  return (
    <AppShell requiredRole="employer">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight">Applicants</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          People who applied to your organization&apos;s opportunities. Ranked by a platform recommendation score, not a scientifically validated model.
        </p>
      </div>
      <VerificationBanner status={organization?.verificationStatus} />
      {!verified ? (
        <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
          Applicant lists unlock after your organization is verified.
        </div>
      ) : null}

      {verified && candidates.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
          No applications yet. Once students apply, they will appear here.
        </div>
      ) : null}

      {verified ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {candidates.map((c) => (
            <article key={c.applicationId} className="flex flex-col rounded-2xl border border-border bg-card p-5">
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
                  <p className="text-sm text-primary">{c.headline || c.opportunityTitle}</p>
                  <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3.5" aria-hidden="true" /> {c.location || "Location hidden"}
                    {c.hours ? ` · ${c.hours} volunteer hrs` : ""}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {c.opportunityTitle} · {c.status}
                  </p>
                </div>
                <MatchRing value={c.match} />
              </div>

              {c.about ? <p className="mt-3 text-sm text-card-foreground/80">{c.about}</p> : null}

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
                  <ExternalLink className="size-4" aria-hidden="true" /> View summary
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => setContacted((m) => ({ ...m, [c.applicationId]: true }))}
                  disabled={contacted[c.applicationId] || !c.showContact}
                >
                  <Mail className="size-4" aria-hidden="true" />{" "}
                  {!c.showContact ? "Contact hidden" : contacted[c.applicationId] ? "Contacted" : "Contact"}
                </Button>
              </div>
            </article>
          ))}
        </div>
      ) : null}

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
                <p className="text-sm font-medium text-card-foreground">{selected.match}% recommendation score</p>
                <VerifiedBadge label={`${selected.verifiedSkills.length} officially verified skills`} />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Applied to {selected.opportunityTitle}</p>
            {selected.about ? <p className="text-sm leading-relaxed text-card-foreground/80">{selected.about}</p> : null}
            {selected.coverMessage ? (
              <p className="text-sm text-card-foreground/80">Cover note: {selected.coverMessage}</p>
            ) : null}
            {selected.email ? <p className="text-sm">Contact: {selected.email}</p> : null}
            <div className="flex flex-wrap gap-1.5">
              {[...selected.verifiedSkills, ...selected.otherSkills].map((s) => (
                <Chip key={s} tone="primary">
                  {s}
                </Chip>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {["under_review", "shortlisted", "accepted", "rejected"].map((status) => (
                <Button
                  key={status}
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    void apiUpdateApplication(selected.applicationId, status).then(() =>
                      apiEmployerCandidates().then(setCandidates),
                    )
                  }}
                >
                  Mark {status}
                </Button>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              {selected.portfolioSlug ? (
                <ButtonLink href={`/p/${selected.portfolioSlug}`}>Open public portfolio</ButtonLink>
              ) : (
                <p className="self-center text-xs text-muted-foreground">
                  {selected.cvAvailable
                    ? "Portfolio is available to signed-in viewers only."
                    : "This student has not published a public portfolio."}
                </p>
              )}
            </div>
          </div>
        ) : null}
      </Modal>
    </AppShell>
  )
}
