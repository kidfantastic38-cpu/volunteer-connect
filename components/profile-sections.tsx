"use client"

import { useState } from "react"
import { Plus, Trash2, ShieldCheck, Clock3, LinkIcon, FileText, Award, ImageIcon, Users } from "lucide-react"
import {
  usePrototype,
  experienceTypeLabel,
  type ExperienceType,
  type EvidenceType,
} from "@/components/prototype-store"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/modal"
import { Field, TextInput, TextArea, SelectInput } from "@/components/form-controls"
import { Chip, VerifiedBadge } from "@/components/ui-bits"

/* ------------------------------ shared helpers ----------------------------- */

function SectionShell({
  id,
  title,
  count,
  onAdd,
  addLabel,
  children,
}: {
  id: string
  title: string
  count: number
  onAdd: () => void
  addLabel: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-24 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="font-display text-lg font-semibold text-card-foreground">
          {title} <span className="text-muted-foreground">({count})</span>
        </h2>
        <Button size="sm" variant="outline" onClick={onAdd}>
          <Plus className="size-4" aria-hidden="true" /> {addLabel}
        </Button>
      </div>
      {children}
    </section>
  )
}

function EmptyRow({ text }: { text: string }) {
  return (
    <p className="rounded-xl border border-dashed border-border bg-secondary/40 px-4 py-6 text-center text-sm text-muted-foreground">
      {text}
    </p>
  )
}

const evidenceIcon: Record<EvidenceType, typeof FileText> = {
  certificate: Award,
  reference: Users,
  photo: ImageIcon,
  link: LinkIcon,
  document: FileText,
}

function EvidenceList({ items }: { items: { id: string; type: EvidenceType; label: string; status: string }[] }) {
  if (items.length === 0) return null
  return (
    <ul className="mt-3 flex flex-wrap gap-2">
      {items.map((e) => {
        const Icon = evidenceIcon[e.type]
        const verified = e.status === "verified"
        return (
          <li
            key={e.id}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/50 px-2.5 py-1 text-xs text-secondary-foreground"
          >
            <Icon className="size-3.5" aria-hidden="true" />
            {e.label}
            {verified ? (
              <ShieldCheck className="size-3.5 text-success" aria-label="Verified" />
            ) : (
              <Clock3 className="size-3.5 text-muted-foreground" aria-label="Pending verification" />
            )}
          </li>
        )
      })}
    </ul>
  )
}

function RowCard({
  children,
  onDelete,
}: {
  children: React.ReactNode
  onDelete: () => void
}) {
  return (
    <div className="rounded-xl border border-border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">{children}</div>
        <Button variant="ghost" size="icon" aria-label="Remove entry" onClick={onDelete}>
          <Trash2 className="size-4 text-muted-foreground" aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}

/* -------------------------------- Education -------------------------------- */

export function EducationSection() {
  const { education, addEducation, removeEducation, setOnboardingStep } = usePrototype()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    institution: "",
    qualification: "",
    field: "",
    start: "",
    end: "",
    grade: "",
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    addEducation({ ...form })
    setOnboardingStep("education", true)
    setForm({ institution: "", qualification: "", field: "", start: "", end: "", grade: "" })
    setOpen(false)
  }

  return (
    <SectionShell id="education" title="Education" count={education.length} onAdd={() => setOpen(true)} addLabel="Add">
      {education.length === 0 ? (
        <EmptyRow text="Add your schools, colleges or courses to start building your profile." />
      ) : (
        <div className="flex flex-col gap-3">
          {education.map((ed) => (
            <RowCard key={ed.id} onDelete={() => removeEducation(ed.id)}>
              <p className="font-medium text-card-foreground">{ed.qualification}</p>
              <p className="text-sm text-muted-foreground">
                {ed.institution} · {ed.field}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {ed.start} – {ed.end || "Present"}
                {ed.grade ? ` · ${ed.grade}` : ""}
              </p>
              {ed.description ? <p className="mt-2 text-sm text-card-foreground/80">{ed.description}</p> : null}
            </RowCard>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add education" description="Schools, colleges, courses or qualifications.">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <Field label="Institution" htmlFor="ed-inst">
            <TextInput id="ed-inst" required value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} placeholder="Riverside Community College" />
          </Field>
          <Field label="Qualification" htmlFor="ed-qual">
            <TextInput id="ed-qual" required value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} placeholder="A-Levels" />
          </Field>
          <Field label="Subject / field" htmlFor="ed-field">
            <TextInput id="ed-field" value={form.field} onChange={(e) => setForm({ ...form, field: e.target.value })} placeholder="Biology, Psychology" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start year" htmlFor="ed-start">
              <TextInput id="ed-start" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} placeholder="2022" />
            </Field>
            <Field label="End year" htmlFor="ed-end">
              <TextInput id="ed-end" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} placeholder="2024 or leave blank" />
            </Field>
          </div>
          <Field label="Grade (optional)" htmlFor="ed-grade">
            <TextInput id="ed-grade" value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} placeholder="AAB" />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">Save education</Button>
          </div>
        </form>
      </Modal>
    </SectionShell>
  )
}

/* ------------------------------- Experiences ------------------------------- */

export function ExperienceSection() {
  const { experiences, addExperience, removeExperience, setOnboardingStep } = usePrototype()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    type: "volunteer" as ExperienceType,
    role: "",
    organization: "",
    location: "",
    start: "",
    end: "",
    hours: "",
    description: "",
    skills: "",
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    addExperience({
      type: form.type,
      role: form.role,
      organization: form.organization,
      location: form.location,
      start: form.start,
      end: form.end,
      current: !form.end,
      hours: form.hours ? Number(form.hours) : undefined,
      description: form.description,
      skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
      evidence: [],
    })
    setOnboardingStep("experience", true)
    setForm({ type: "volunteer", role: "", organization: "", location: "", start: "", end: "", hours: "", description: "", skills: "" })
    setOpen(false)
  }

  return (
    <SectionShell id="experience" title="Experience" count={experiences.length} onAdd={() => setOpen(true)} addLabel="Add">
      {experiences.length === 0 ? (
        <EmptyRow text="Add volunteering, internships and work experience — this is where your skills come from." />
      ) : (
        <div className="flex flex-col gap-3">
          {experiences.map((ex) => (
            <RowCard key={ex.id} onDelete={() => removeExperience(ex.id)}>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-card-foreground">{ex.role}</p>
                <Chip tone={ex.type === "volunteer" ? "success" : ex.type === "internship" ? "accent" : "primary"}>
                  {experienceTypeLabel[ex.type]}
                </Chip>
                {ex.current ? <Chip tone="muted">Current</Chip> : null}
              </div>
              <p className="text-sm text-muted-foreground">
                {ex.organization} · {ex.location}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {ex.start} – {ex.end || "Present"}
                {ex.hours ? ` · ${ex.hours} hrs` : ""}
              </p>
              <p className="mt-2 text-sm text-card-foreground/80">{ex.description}</p>
              {ex.skills.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {ex.skills.map((s) => (
                    <Chip key={s} tone="muted">{s}</Chip>
                  ))}
                </div>
              ) : null}
              <EvidenceList items={ex.evidence} />
            </RowCard>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add experience" description="Volunteering, internships or work experience.">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <Field label="Type" htmlFor="ex-type">
            <SelectInput id="ex-type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as ExperienceType })}>
              <option value="volunteer">Volunteering</option>
              <option value="internship">Internship</option>
              <option value="work">Work experience</option>
            </SelectInput>
          </Field>
          <Field label="Role / title" htmlFor="ex-role">
            <TextInput id="ex-role" required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Youth Mentor" />
          </Field>
          <Field label="Organisation" htmlFor="ex-org">
            <TextInput id="ex-org" required value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} placeholder="Bright Futures Trust" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Location" htmlFor="ex-loc">
              <TextInput id="ex-loc" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Manchester, UK" />
            </Field>
            <Field label="Hours (optional)" htmlFor="ex-hours">
              <TextInput id="ex-hours" type="number" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} placeholder="120" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start (YYYY-MM)" htmlFor="ex-start">
              <TextInput id="ex-start" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} placeholder="2023-01" />
            </Field>
            <Field label="End (blank = current)" htmlFor="ex-end">
              <TextInput id="ex-end" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} placeholder="2023-09" />
            </Field>
          </div>
          <Field label="What did you do?" htmlFor="ex-desc" hint="Focus on what you achieved and the impact you made.">
            <TextArea id="ex-desc" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Mentored 12 teenagers weekly..." />
          </Field>
          <Field label="Skills used" htmlFor="ex-skills" hint="Comma separated.">
            <TextInput id="ex-skills" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="Mentoring, Communication, Organization" />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">Save experience</Button>
          </div>
        </form>
      </Modal>
    </SectionShell>
  )
}

/* --------------------------------- Projects -------------------------------- */

export function ProjectSection() {
  const { projects, addProject, removeProject, setOnboardingStep } = usePrototype()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    title: "",
    category: "community" as "school" | "community" | "personal",
    role: "",
    description: "",
    outcome: "",
    link: "",
    skills: "",
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    addProject({
      title: form.title,
      category: form.category,
      role: form.role,
      description: form.description,
      outcome: form.outcome,
      link: form.link || undefined,
      skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
      evidence: [],
    })
    setOnboardingStep("projects", true)
    setForm({ title: "", category: "community", role: "", description: "", outcome: "", link: "", skills: "" })
    setOpen(false)
  }

  return (
    <SectionShell id="projects" title="Projects" count={projects.length} onAdd={() => setOpen(true)} addLabel="Add">
      {projects.length === 0 ? (
        <EmptyRow text="Add school, community or personal projects that show what you can build and lead." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {projects.map((p) => (
            <RowCard key={p.id} onDelete={() => removeProject(p.id)}>
              <p className="font-medium text-card-foreground">{p.title}</p>
              <p className="text-sm text-muted-foreground">{p.role}</p>
              <p className="mt-2 text-sm text-card-foreground/80">{p.description}</p>
              <p className="mt-2 text-sm font-medium text-success">Outcome: <span className="font-normal text-card-foreground/80">{p.outcome}</span></p>
              {p.skills.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {p.skills.map((s) => (
                    <Chip key={s} tone="muted">{s}</Chip>
                  ))}
                </div>
              ) : null}
              <EvidenceList items={p.evidence} />
            </RowCard>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add project" description="Something you built, led or created.">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <Field label="Project title" htmlFor="pr-title">
            <TextInput id="pr-title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Campus Recycling Drive" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category" htmlFor="pr-cat">
              <SelectInput id="pr-cat" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as typeof form.category })}>
                <option value="community">Community</option>
                <option value="school">School</option>
                <option value="personal">Personal</option>
              </SelectInput>
            </Field>
            <Field label="Your role" htmlFor="pr-role">
              <TextInput id="pr-role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Project Lead" />
            </Field>
          </div>
          <Field label="Description" htmlFor="pr-desc">
            <TextArea id="pr-desc" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What was the project and what did you do?" />
          </Field>
          <Field label="Outcome / impact" htmlFor="pr-out">
            <TextInput id="pr-out" value={form.outcome} onChange={(e) => setForm({ ...form, outcome: e.target.value })} placeholder="Diverted 1.2 tonnes of waste" />
          </Field>
          <Field label="Link (optional)" htmlFor="pr-link">
            <TextInput id="pr-link" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="https://" />
          </Field>
          <Field label="Skills used" htmlFor="pr-skills" hint="Comma separated.">
            <TextInput id="pr-skills" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="Leadership, Teamwork" />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">Save project</Button>
          </div>
        </form>
      </Modal>
    </SectionShell>
  )
}

/* ------------------------------- Achievements ------------------------------ */

export function AchievementSection() {
  const { achievements, addAchievement, removeAchievement, setOnboardingStep } = usePrototype()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    title: "",
    issuer: "",
    date: "",
    category: "award" as "award" | "certification" | "leadership",
    description: "",
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    addAchievement({ ...form, evidence: [] })
    setOnboardingStep("achievements", true)
    setForm({ title: "", issuer: "", date: "", category: "award", description: "" })
    setOpen(false)
  }

  return (
    <SectionShell id="achievements" title="Achievements" count={achievements.length} onAdd={() => setOpen(true)} addLabel="Add">
      {achievements.length === 0 ? (
        <EmptyRow text="Add awards, certifications and leadership roles you're proud of." />
      ) : (
        <div className="flex flex-col gap-3">
          {achievements.map((a) => (
            <RowCard key={a.id} onDelete={() => removeAchievement(a.id)}>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-card-foreground">{a.title}</p>
                <Chip tone="accent">{a.category}</Chip>
              </div>
              <p className="text-sm text-muted-foreground">{a.issuer} · {a.date}</p>
              <p className="mt-2 text-sm text-card-foreground/80">{a.description}</p>
              <EvidenceList items={a.evidence} />
            </RowCard>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add achievement" description="Awards, certifications and leadership.">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <Field label="Title" htmlFor="ac-title">
            <TextInput id="ac-title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Regional Youth Green Award" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Issuer" htmlFor="ac-issuer">
              <TextInput id="ac-issuer" value={form.issuer} onChange={(e) => setForm({ ...form, issuer: e.target.value })} placeholder="Youth Council" />
            </Field>
            <Field label="Date (YYYY-MM)" htmlFor="ac-date">
              <TextInput id="ac-date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} placeholder="2024-03" />
            </Field>
          </div>
          <Field label="Category" htmlFor="ac-cat">
            <SelectInput id="ac-cat" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as typeof form.category })}>
              <option value="award">Award</option>
              <option value="certification">Certification</option>
              <option value="leadership">Leadership</option>
            </SelectInput>
          </Field>
          <Field label="Description" htmlFor="ac-desc">
            <TextArea id="ac-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What was it for?" />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">Save achievement</Button>
          </div>
        </form>
      </Modal>
    </SectionShell>
  )
}

/* ---------------------------------- Skills --------------------------------- */

const SKILL_CATEGORIES = [
  "Communication",
  "Leadership",
  "Technical",
  "Teamwork",
  "Problem Solving",
  "Creativity",
  "Organization",
] as const

export function SkillSection() {
  const { skills, addSkill, removeSkill, setOnboardingStep } = usePrototype()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    name: "",
    category: "Communication" as (typeof SKILL_CATEGORIES)[number],
    level: "3",
    source: "",
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    addSkill({
      name: form.name,
      category: form.category,
      level: Number(form.level),
      source: form.source || "Self-assessed",
      verified: false,
    })
    setOnboardingStep("skills", true)
    setForm({ name: "", category: "Communication", level: "3", source: "" })
    setOpen(false)
  }

  return (
    <SectionShell id="skills" title="Skills" count={skills.length} onAdd={() => setOpen(true)} addLabel="Add">
      {skills.length === 0 ? (
        <EmptyRow text="Skills are auto-suggested from your experiences — add or refine them here." />
      ) : (
        <div className="flex flex-col gap-3">
          {skills.map((s) => (
            <div key={s.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-card-foreground">{s.name}</p>
                  {s.verified ? (
                    <VerifiedBadge label="Officially verified" />
                  ) : s.evidenceBacked ? (
                    <Chip tone="success">Evidence-backed</Chip>
                  ) : s.source && s.source !== "Self-assessed" ? (
                    <Chip tone="muted">Experience-backed</Chip>
                  ) : (
                    <Chip tone="muted">Self-assessed</Chip>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{s.category} · from {s.source}</p>
                <div className="mt-2 flex items-center gap-1" aria-label={`Proficiency ${s.level} of 5`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 w-8 rounded-full ${i < s.level ? "bg-primary" : "bg-border"}`}
                    />
                  ))}
                </div>
              </div>
              <Button variant="ghost" size="icon" aria-label={`Remove ${s.name}`} onClick={() => removeSkill(s.id)}>
                <Trash2 className="size-4 text-muted-foreground" aria-hidden="true" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add skill" description="Tag a skill and where it came from.">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <Field label="Skill name" htmlFor="sk-name">
            <TextInput id="sk-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Public speaking" />
          </Field>
          <Field label="Category" htmlFor="sk-cat">
            <SelectInput id="sk-cat" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as typeof form.category })}>
              {SKILL_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Proficiency (1–5)" htmlFor="sk-level">
            <SelectInput id="sk-level" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Source (optional)" htmlFor="sk-source">
            <TextInput id="sk-source" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="Youth Mentor role" />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">Save skill</Button>
          </div>
        </form>
      </Modal>
    </SectionShell>
  )
}
