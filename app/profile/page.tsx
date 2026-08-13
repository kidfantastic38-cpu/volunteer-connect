"use client"

import { useState } from "react"
import { Pencil, MapPin, Mail } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { usePrototype } from "@/components/prototype-store"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/modal"
import { Field, TextInput, TextArea } from "@/components/form-controls"
import { Chip } from "@/components/ui-bits"
import {
  EducationSection,
  ExperienceSection,
  ProjectSection,
  AchievementSection,
  SkillSection,
} from "@/components/profile-sections"

export default function ProfilePage() {
  const { user, updateProfile, setOnboardingStep } = usePrototype()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    name: user?.name ?? "",
    headline: user?.headline ?? "",
    location: user?.location ?? "",
    about: user?.about ?? "",
    interests: (user?.interests ?? []).join(", "),
  })

  const openEditor = () => {
    setForm({
      name: user?.name ?? "",
      headline: user?.headline ?? "",
      location: user?.location ?? "",
      about: user?.about ?? "",
      interests: (user?.interests ?? []).join(", "),
    })
    setOpen(true)
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfile({
      name: form.name,
      headline: form.headline,
      location: form.location,
      about: form.about,
      interests: form.interests.split(",").map((s) => s.trim()).filter(Boolean),
    })
    setOnboardingStep("basics", true)
    setOpen(false)
  }

  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Your profile</h1>
          <p className="text-sm text-muted-foreground">
            Everything here powers your CV, portfolio and opportunity matches.
          </p>
        </div>
      </div>

      {/* Identity card */}
      <section className="mb-6 rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div
              className="grid size-16 shrink-0 place-items-center rounded-2xl font-display text-xl font-bold text-primary-foreground"
              style={{ backgroundColor: "var(--primary)" }}
              aria-hidden="true"
            >
              {(user?.name ?? "?")
                .split(" ")
                .map((p) => p[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-card-foreground">{user?.name || "Your name"}</h2>
              <p className="text-sm text-primary">{user?.headline || "Add a headline"}</p>
              <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                {user?.location ? (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5" aria-hidden="true" /> {user.location}
                  </span>
                ) : null}
                {user?.email ? (
                  <span className="inline-flex items-center gap-1">
                    <Mail className="size-3.5" aria-hidden="true" /> {user.email}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={openEditor}>
            <Pencil className="size-4" aria-hidden="true" /> Edit
          </Button>
        </div>

        {user?.about ? <p className="mt-4 text-sm leading-relaxed text-card-foreground/80">{user.about}</p> : null}

        {(user?.interests ?? []).length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {user!.interests.map((i) => (
              <Chip key={i} tone="primary">
                {i}
              </Chip>
            ))}
          </div>
        ) : null}
      </section>

      <div className="flex flex-col gap-6">
        <ExperienceSection />
        <ProjectSection />
        <SkillSection />
        <AchievementSection />
        <EducationSection />
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Edit profile"
        description="Your basic details and personal statement."
      >
        <form onSubmit={submit} className="flex flex-col gap-4">
          <Field label="Full name" htmlFor="pf-name">
            <TextInput id="pf-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Headline" htmlFor="pf-headline" hint="A short line that sums you up.">
            <TextInput id="pf-headline" value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} placeholder="Aspiring community leader" />
          </Field>
          <Field label="Location" htmlFor="pf-loc">
            <TextInput id="pf-loc" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Manchester, UK" />
          </Field>
          <Field label="Personal statement" htmlFor="pf-about">
            <TextArea id="pf-about" value={form.about} onChange={(e) => setForm({ ...form, about: e.target.value })} placeholder="Tell your story in a few sentences." />
          </Field>
          <Field label="Interests" htmlFor="pf-interests" hint="Comma separated.">
            <TextInput id="pf-interests" value={form.interests} onChange={(e) => setForm({ ...form, interests: e.target.value })} placeholder="Sustainability, Youth work" />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save changes</Button>
          </div>
        </form>
      </Modal>
    </AppShell>
  )
}
