"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, Loader2 } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { VerificationBanner } from "@/components/verification-banner"
import { usePrototype, type OppType } from "@/components/prototype-store"
import { Button } from "@/components/ui/button"
import { ButtonLink } from "@/components/button-link"
import { Field, TextInput, TextArea, SelectInput } from "@/components/form-controls"
import { apiPublishOpportunity } from "@/lib/auth/client"

export default function PostOpportunityPage() {
  const { organization, refreshMarketplace } = usePrototype()
  const router = useRouter()
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const verified = organization?.verificationStatus === "approved"
  const [form, setForm] = useState({
    title: "",
    org: "",
    type: "job" as OppType,
    location: "",
    remote: false,
    compensation: "",
    deadline: "",
    description: "",
    skills: "",
  })

  const submit = (e: React.FormEvent, status: "draft" | "published" = "published") => {
    e.preventDefault()
    if (!verified) return
    setError("")
    setSubmitting(true)
    void apiPublishOpportunity({
      title: form.title,
      description: form.description,
      type: form.type,
      location: form.location || (form.remote ? "Remote" : ""),
      remote: form.remote,
      compensation: form.compensation || undefined,
      deadline: form.deadline || "Open",
      skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
      status,
    })
      .then(() => refreshMarketplace())
      .then(() => setDone(true))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Could not save this opportunity.")
      })
      .finally(() => setSubmitting(false))
  }

  if (done) {
    return (
      <AppShell requiredRole="employer">
        <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-success/15 text-success">
            <Check className="size-7" aria-hidden="true" />
          </div>
          <h1 className="mt-4 font-display text-xl font-bold">Opportunity published</h1>
          <p className="mt-1 text-sm text-muted-foreground text-pretty">
            {form.title} is now live and being matched to candidates by skill fit.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Button variant="outline" onClick={() => setDone(false)}>
              Post another
            </Button>
            <Button onClick={() => router.push("/employer/candidates")}>See matched candidates</Button>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell requiredRole="employer">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-2xl font-bold tracking-tight">Post an opportunity</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Describe the role and the skills you need — we&apos;ll surface the best-matched candidates.
        </p>
        <div className="mt-4">
          <VerificationBanner status={organization?.verificationStatus} />
        </div>
        {!verified ? (
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">
              Your organization verification is pending. You can complete your profile, but posting opportunities will
              be unlocked after approval.
            </p>
            <ButtonLink href="/employer/organization" className="mt-4">
              Go to organization profile
            </ButtonLink>
          </div>
        ) : (
        <form onSubmit={submit} className="mt-6 flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 sm:p-6">
          <Field label="Opportunity title" htmlFor="op-title">
            <TextInput id="op-title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Sustainability Programme Assistant" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Organisation" htmlFor="op-org">
              <TextInput id="op-org" required value={form.org} onChange={(e) => setForm({ ...form, org: e.target.value })} placeholder="EarthWise Foundation" />
            </Field>
            <Field label="Type" htmlFor="op-type">
              <SelectInput id="op-type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as OppType })}>
                <option value="job">Job</option>
                <option value="internship">Internship</option>
                <option value="scholarship">Scholarship</option>
                <option value="volunteering">Volunteering</option>
                <option value="training">Training</option>
              </SelectInput>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Location" htmlFor="op-loc">
              <TextInput id="op-loc" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Freetown, Sierra Leone" />
            </Field>
            <Field label="Compensation (optional)" htmlFor="op-comp">
              <TextInput id="op-comp" value={form.compensation} onChange={(e) => setForm({ ...form, compensation: e.target.value })} placeholder="£23,000 / year" />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.remote}
              onChange={(e) => setForm({ ...form, remote: e.target.checked })}
              className="size-4 rounded border-input accent-primary"
            />
            <span className="text-foreground">This opportunity is remote-friendly</span>
          </label>
          <Field label="Application deadline" htmlFor="op-deadline">
            <TextInput id="op-deadline" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          </Field>
          <Field label="Description" htmlFor="op-desc">
            <TextArea id="op-desc" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What will the person do and what impact will they make?" />
          </Field>
          <Field label="Required skills" htmlFor="op-skills" hint="Comma separated — used to match and rank candidates.">
            <TextInput id="op-skills" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="Leadership, Communication, Organization" />
          </Field>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => router.push("/employer")}>
              Cancel
            </Button>
            {error ? <p className="self-center text-sm text-destructive">{error}</p> : null}
            <Button type="button" variant="outline" disabled={!verified || submitting} onClick={(e) => submit(e, "draft")}>
              Save draft
            </Button>
            <Button type="submit" disabled={!verified || submitting}>
              {submitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
              {submitting ? "Publishing…" : "Publish opportunity"}
            </Button>
          </div>
        </form>
        )}
      </div>
    </AppShell>
  )
}
