"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Check,
  GraduationCap,
  HeartHandshake,
  LayoutGrid,
  ListChecks,
  Plus,
  User,
} from "lucide-react"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { Field, Input, Select, Textarea } from "@/components/form-controls"
import { SelectWithOther } from "@/components/select-with-other"
import {
  FIELD_OF_STUDY_OPTIONS,
  INSTITUTION_OPTIONS,
  LOCATION_OPTIONS,
  QUALIFICATION_OPTIONS,
} from "@/lib/profile/field-options"
import { Button } from "@/components/ui/button"
import { Chip, ProgressBar, SkillBar } from "@/components/ui-bits"
import {
  usePrototype,
  type ExperienceType,
  type Skill,
} from "@/components/prototype-store"
import { cn } from "@/lib/utils"

const stepMeta = [
  { key: "basics", label: "About you", icon: User },
  { key: "education", label: "Education", icon: GraduationCap },
  { key: "experience", label: "Experience", icon: HeartHandshake },
  { key: "projects", label: "Projects", icon: LayoutGrid },
  { key: "achievements", label: "Achievements", icon: Award },
  { key: "skills", label: "Skills", icon: ListChecks },
] as const

export default function OnboardingPage() {
  const router = useRouter()
  usePrototype()
  const [step, setStep] = useState(0)

  const next = () => setStep((s) => Math.min(stepMeta.length - 1, s + 1))
  const back = () => setStep((s) => Math.max(0, s - 1))
  const finish = () => router.push("/dashboard")

  const progress = Math.round(((step + 1) / stepMeta.length) * 100)

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <Link href="/" aria-label="Volunteer Connect home">
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={finish}
              className="min-h-11 px-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Skip for now
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Stepper */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium">
              Step {step + 1} of {stepMeta.length}: {stepMeta[step].label}
            </span>
            <span className="text-muted-foreground">{progress}%</span>
          </div>
          <ProgressBar value={progress} />
          <div className="mt-4 hidden items-center justify-between sm:flex">
            {stepMeta.map((m, i) => (
              <button
                key={m.key}
                onClick={() => setStep(i)}
                className="flex flex-col items-center gap-1.5"
                aria-current={i === step}
              >
                <span
                  className={cn(
                    "grid size-9 place-items-center rounded-full border transition-colors",
                    i < step
                      ? "border-primary bg-primary text-primary-foreground"
                      : i === step
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground",
                  )}
                >
                  {i < step ? <Check className="size-4" aria-hidden="true" /> : <m.icon className="size-4" aria-hidden="true" />}
                </span>
                <span className={cn("text-xs", i === step ? "font-medium text-foreground" : "text-muted-foreground")}>
                  {m.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          {step === 0 && <BasicsStep onNext={next} />}
          {step === 1 && <EducationStep onNext={next} onBack={back} />}
          {step === 2 && <ExperienceStep onNext={next} onBack={back} />}
          {step === 3 && <ProjectsStep onNext={next} onBack={back} />}
          {step === 4 && <AchievementsStep onNext={next} onBack={back} />}
          {step === 5 && <SkillsStep onBack={back} onFinish={finish} />}
        </div>
      </div>
    </div>
  )
}

function StepNav({
  onBack,
  onNext,
  nextLabel = "Continue",
  backLabel = "Back",
  skip,
}: {
  onBack?: () => void
  onNext: () => void
  nextLabel?: string
  backLabel?: string
  skip?: () => void
}) {
  return (
    <div className="mt-8 flex items-center justify-between">
      <div>
        {onBack && (
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="size-4" aria-hidden="true" />
            {backLabel}
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        {skip && (
          <Button variant="ghost" onClick={skip}>
            Skip
          </Button>
        )}
        <Button onClick={onNext}>
          {nextLabel}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}

function StepIntro({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6">
      <h2 className="font-display text-xl font-bold tracking-tight">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground text-pretty">{description}</p>
    </div>
  )
}

function BasicsStep({ onNext }: { onNext: () => void }) {
  const { user, updateProfile, setOnboardingStep } = usePrototype()
  const [form, setForm] = useState({
    headline: user?.headline === "New member" ? "" : user?.headline ?? "",
    location: user?.location ?? "",
    about: user?.about ?? "",
    interests: user?.interests.join(", ") ?? "",
  })

  const save = () => {
    updateProfile({
      headline: form.headline || "Aspiring professional",
      location: form.location,
      about: form.about,
      interests: form.interests
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    })
    setOnboardingStep("basics", true)
    onNext()
  }

  return (
    <div>
      <StepIntro
        title="About you"
        description="A short line about what you do, and a few interests, help openings make more sense."
      />
      <div className="space-y-4">
        <Field label="Headline" htmlFor="headline" hint="e.g. Student volunteer, Freetown">
          <Input
            id="headline"
            value={form.headline}
            onChange={(e) => setForm((f) => ({ ...f, headline: e.target.value }))}
            placeholder="Student volunteer, Freetown"
          />
        </Field>
        <Field label="Location" htmlFor="location">
          <SelectWithOther
            id="location"
            value={form.location}
            onChange={(location) => setForm((f) => ({ ...f, location }))}
            options={LOCATION_OPTIONS}
            placeholder="Select a location"
            otherPlaceholder="Enter your location"
          />
        </Field>
        <Field label="About you" htmlFor="about">
          <Textarea
            id="about"
            value={form.about}
            onChange={(e) => setForm((f) => ({ ...f, about: e.target.value }))}
            placeholder="A couple of sentences about who you are and what you care about."
          />
        </Field>
        <Field label="Interests" htmlFor="interests" hint="Comma separated — e.g. Sustainability, Marketing, Youth work">
          <Input
            id="interests"
            value={form.interests}
            onChange={(e) => setForm((f) => ({ ...f, interests: e.target.value }))}
            placeholder="Add a few interests"
          />
        </Field>
      </div>
      <StepNav onNext={save} nextLabel="Save & continue" />
    </div>
  )
}

function EducationStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { education, addEducation, removeEducation, setOnboardingStep } = usePrototype()
  const [form, setForm] = useState({ institution: "", qualification: "", field: "", location: "", start: "", end: "", grade: "" })
  const [formKey, setFormKey] = useState(0)

  const add = () => {
    if (!form.institution.trim() || !form.qualification.trim()) return
    addEducation({ ...form })
    setForm({ institution: "", qualification: "", field: "", location: "", start: "", end: "", grade: "" })
    setFormKey((key) => key + 1)
    setOnboardingStep("education", true)
  }

  const canAdd = form.institution.trim() && form.qualification.trim()

  return (
    <div>
      <StepIntro title="Your education" description="Add your schools, colleges or courses. You can add more than one." />
      {education.length > 0 && (
        <ul className="mb-5 space-y-2">
          {education.map((e) => (
            <li key={e.id} className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-sm">
              <span>
                <span className="font-medium">{e.qualification}</span> — {e.institution}
              </span>
              <button onClick={() => removeEducation(e.id)} className="text-xs text-muted-foreground hover:text-destructive">
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      <div key={formKey} className="grid gap-4 sm:grid-cols-2">
        <Field label="Institution" htmlFor="institution">
          <SelectWithOther
            id="institution"
            required
            value={form.institution}
            onChange={(institution) => setForm((f) => ({ ...f, institution }))}
            options={INSTITUTION_OPTIONS}
            placeholder="Select an institution"
            otherPlaceholder="Enter your institution"
          />
        </Field>
        <Field label="Qualification" htmlFor="qualification">
          <SelectWithOther
            id="qualification"
            required
            value={form.qualification}
            onChange={(qualification) => setForm((f) => ({ ...f, qualification }))}
            options={QUALIFICATION_OPTIONS}
            placeholder="Select a qualification"
            otherPlaceholder="Enter your qualification"
          />
        </Field>
        <Field label="Field of study" htmlFor="field">
          <SelectWithOther
            id="field"
            value={form.field}
            onChange={(field) => setForm((f) => ({ ...f, field }))}
            options={FIELD_OF_STUDY_OPTIONS}
            placeholder="Select a field of study"
            otherPlaceholder="Enter your field of study"
          />
        </Field>
        <Field label="Location" htmlFor="ed-location">
          <SelectWithOther
            id="ed-location"
            value={form.location}
            onChange={(location) => setForm((f) => ({ ...f, location }))}
            options={LOCATION_OPTIONS}
            placeholder="Select a location"
            otherPlaceholder="Enter your location"
          />
        </Field>
        <Field label="Grade (optional)" htmlFor="grade">
          <Input id="grade" value={form.grade} onChange={(e) => setForm((f) => ({ ...f, grade: e.target.value }))} placeholder="AAB / Merit / 2:1" />
        </Field>
        <Field label="Start" htmlFor="estart">
          <Input id="estart" value={form.start} onChange={(e) => setForm((f) => ({ ...f, start: e.target.value }))} placeholder="2022" />
        </Field>
        <Field label="End" htmlFor="eend">
          <Input id="eend" value={form.end} onChange={(e) => setForm((f) => ({ ...f, end: e.target.value }))} placeholder="2024 / Present" />
        </Field>
      </div>
      <Button variant="outline" onClick={add} disabled={!canAdd} className="mt-4">
        Add education
      </Button>
      <StepNav onBack={onBack} onNext={onNext} skip={onNext} />
    </div>
  )
}

function SkillTagInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [draft, setDraft] = useState("")
  const add = () => {
    const v = draft.trim()
    if (v && !value.includes(v)) onChange([...value, v])
    setDraft("")
  }
  return (
    <div>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.nativeEvent.isComposing) {
              e.preventDefault()
              add()
            }
          }}
          placeholder="Type a skill and press Enter"
        />
        <Button type="button" variant="outline" onClick={add}>
          Add
        </Button>
      </div>
      {value.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {value.map((s) => (
            <Chip key={s} tone="primary">
              {s}
              <button onClick={() => onChange(value.filter((x) => x !== s))} aria-label={`Remove ${s}`} className="ml-0.5">
                ×
              </button>
            </Chip>
          ))}
        </div>
      )}
    </div>
  )
}

function ExperienceStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { experiences, addExperience, removeExperience, setOnboardingStep } = usePrototype()
  const [form, setForm] = useState({
    type: "volunteer" as ExperienceType,
    role: "",
    organization: "",
    location: "",
    start: "",
    end: "",
    current: false,
    description: "",
    skills: [] as string[],
  })

  const add = () => {
    if (!form.role.trim() || !form.organization.trim()) return
    addExperience({ ...form, evidence: [] })
    setForm({ type: "volunteer", role: "", organization: "", location: "", start: "", end: "", current: false, description: "", skills: [] })
    setOnboardingStep("experience", true)
  }
  const canAdd = form.role.trim() && form.organization.trim()

  return (
    <div>
      <StepIntro
        title="Your experiences"
        description="Volunteering, internships, part-time jobs — anything where you contributed and learned."
      />
      {experiences.length > 0 && (
        <ul className="mb-5 space-y-2">
          {experiences.map((e) => (
            <li key={e.id} className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-sm">
              <span>
                <span className="font-medium">{e.role}</span> — {e.organization}
              </span>
              <button onClick={() => removeExperience(e.id)} className="text-xs text-muted-foreground hover:text-destructive">
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Type" htmlFor="etype">
          <Select id="etype" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as ExperienceType }))}>
            <option value="volunteer">Volunteering</option>
            <option value="internship">Internship</option>
            <option value="work">Work experience</option>
          </Select>
        </Field>
        <Field label="Role" htmlFor="erole">
          <Input id="erole" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} placeholder="Youth Mentor" />
        </Field>
        <Field label="Organization" htmlFor="eorg">
          <Input id="eorg" value={form.organization} onChange={(e) => setForm((f) => ({ ...f, organization: e.target.value }))} placeholder="Bright Futures Trust" />
        </Field>
        <Field label="Location" htmlFor="eloc">
          <Input id="eloc" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="Manchester / Remote" />
        </Field>
        <Field label="Start" htmlFor="xstart">
          <Input id="xstart" value={form.start} onChange={(e) => setForm((f) => ({ ...f, start: e.target.value }))} placeholder="2023-01" />
        </Field>
        <Field label="End" htmlFor="xend">
          <Input id="xend" value={form.end} onChange={(e) => setForm((f) => ({ ...f, end: e.target.value }))} placeholder="Present" />
        </Field>
      </div>
      <div className="mt-4 space-y-4">
        <Field label="What did you do?" htmlFor="edesc">
          <Textarea id="edesc" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Describe your responsibilities and impact." />
        </Field>
        <div>
          <p className="mb-1.5 text-sm font-medium">Skills you used</p>
          <SkillTagInput value={form.skills} onChange={(skills) => setForm((f) => ({ ...f, skills }))} />
        </div>
      </div>
      <Button variant="outline" onClick={add} disabled={!canAdd} className="mt-4">
        Add experience
      </Button>
      <StepNav onBack={onBack} onNext={onNext} skip={onNext} />
    </div>
  )
}

function ProjectsStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { projects, addProject, removeProject, setOnboardingStep } = usePrototype()
  const [form, setForm] = useState({
    title: "",
    category: "community" as "school" | "community" | "personal",
    role: "",
    description: "",
    outcome: "",
    skills: [] as string[],
  })

  const add = () => {
    if (!form.title.trim()) return
    addProject({ ...form, evidence: [] })
    setForm({ title: "", category: "community", role: "", description: "", outcome: "", skills: [] })
    setOnboardingStep("projects", true)
  }

  return (
    <div>
      <StepIntro title="Projects" description="School, community or personal projects that show your initiative." />
      {projects.length > 0 && (
        <ul className="mb-5 space-y-2">
          {projects.map((p) => (
            <li key={p.id} className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-sm">
              <span className="font-medium">{p.title}</span>
              <button onClick={() => removeProject(p.id)} className="text-xs text-muted-foreground hover:text-destructive">
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title" htmlFor="ptitle">
          <Input id="ptitle" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Campus Recycling Drive" />
        </Field>
        <Field label="Category" htmlFor="pcat">
          <Select id="pcat" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as typeof form.category }))}>
            <option value="school">School</option>
            <option value="community">Community</option>
            <option value="personal">Personal</option>
          </Select>
        </Field>
        <Field label="Your role" htmlFor="prole">
          <Input id="prole" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} placeholder="Project Lead" />
        </Field>
      </div>
      <div className="mt-4 space-y-4">
        <Field label="Description" htmlFor="pdesc">
          <Textarea id="pdesc" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="What was the project about?" />
        </Field>
        <Field label="Outcome / impact" htmlFor="pout">
          <Input id="pout" value={form.outcome} onChange={(e) => setForm((f) => ({ ...f, outcome: e.target.value }))} placeholder="What changed as a result?" />
        </Field>
        <div>
          <p className="mb-1.5 text-sm font-medium">Skills demonstrated</p>
          <SkillTagInput value={form.skills} onChange={(skills) => setForm((f) => ({ ...f, skills }))} />
        </div>
      </div>
      <Button variant="outline" onClick={add} disabled={!form.title.trim()} className="mt-4">
        Add project
      </Button>
      <StepNav onBack={onBack} onNext={onNext} skip={onNext} />
    </div>
  )
}

function AchievementsStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { achievements, addAchievement, removeAchievement, setOnboardingStep } = usePrototype()
  const [form, setForm] = useState({
    title: "",
    issuer: "",
    date: "",
    category: "award" as "award" | "certification" | "leadership",
    description: "",
  })

  const add = () => {
    if (!form.title.trim()) return
    addAchievement({ ...form, evidence: [] })
    setForm({ title: "", issuer: "", date: "", category: "award", description: "" })
    setOnboardingStep("achievements", true)
  }

  return (
    <div>
      <StepIntro title="Achievements & awards" description="Certifications, awards, leadership roles and recognition." />
      {achievements.length > 0 && (
        <ul className="mb-5 space-y-2">
          {achievements.map((a) => (
            <li key={a.id} className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-sm">
              <span className="font-medium">{a.title}</span>
              <button onClick={() => removeAchievement(a.id)} className="text-xs text-muted-foreground hover:text-destructive">
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title" htmlFor="atitle">
          <Input id="atitle" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Regional Youth Green Award" />
        </Field>
        <Field label="Issuer" htmlFor="aiss">
          <Input id="aiss" value={form.issuer} onChange={(e) => setForm((f) => ({ ...f, issuer: e.target.value }))} placeholder="North West Youth Council" />
        </Field>
        <Field label="Category" htmlFor="acat">
          <Select id="acat" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as typeof form.category }))}>
            <option value="award">Award</option>
            <option value="certification">Certification</option>
            <option value="leadership">Leadership</option>
          </Select>
        </Field>
        <Field label="Date" htmlFor="adate">
          <Input id="adate" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} placeholder="2024-03" />
        </Field>
      </div>
      <Field label="Description" htmlFor="adesc">
        <Textarea id="adesc" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Why did you receive it?" />
      </Field>
      <Button variant="outline" onClick={add} disabled={!form.title.trim()} className="mt-4">
        Add achievement
      </Button>
      <StepNav onBack={onBack} onNext={onNext} skip={onNext} />
    </div>
  )
}

function categorize(name: string): Skill["category"] {
  const n = name.toLowerCase()
  if (/(lead|manage|coordinat)/.test(n)) return "Leadership"
  if (/(team|collab|volunteer)/.test(n)) return "Teamwork"
  if (/(commun|present|writ|content|market)/.test(n)) return "Communication"
  if (/(data|analy|tech|code|digital|spreadsheet)/.test(n)) return "Technical"
  if (/(organ|plan|schedul)/.test(n)) return "Organization"
  if (/(creat|design)/.test(n)) return "Creativity"
  return "Problem Solving"
}

function SkillsStep({ onBack, onFinish }: { onBack: () => void; onFinish: () => void }) {
  const { experiences, projects, skills, addSkill, setOnboardingStep } = usePrototype()

  const suggestions = useMemo(() => {
    const map = new Map<string, string>() // name -> source
    experiences.forEach((e) => e.skills.forEach((s) => !map.has(s) && map.set(s, e.role)))
    projects.forEach((p) => p.skills.forEach((s) => !map.has(s) && map.set(s, p.title)))
    const existing = new Set(skills.map((s) => s.name.toLowerCase()))
    return [...map.entries()].filter(([name]) => !existing.has(name.toLowerCase()))
  }, [experiences, projects, skills])

  const [added, setAdded] = useState<string[]>([])

  const confirm = (name: string, source: string) => {
    addSkill({ name, level: 3, category: categorize(name), source, verified: false })
    setAdded((a) => [...a, name])
  }

  const finishAll = () => {
    setOnboardingStep("skills", true)
    onFinish()
  }

  return (
    <div>
      <StepIntro
        title="Skills from what you added"
        description="Confirm these, or skip and add them later from your profile."
      />

      {suggestions.length > 0 ? (
        <div className="mb-6">
          <p className="mb-2 text-sm font-medium">Suggested from what you added</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map(([name, source]) => {
              const isAdded = added.includes(name)
              return (
                <button
                  key={name}
                  onClick={() => !isAdded && confirm(name, source)}
                  disabled={isAdded}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
                    isAdded
                      ? "border-success/40 bg-success/10 text-success"
                      : "border-border hover:border-primary hover:bg-primary/5",
                  )}
                >
                  {isAdded ? <Check className="size-3.5" aria-hidden="true" /> : <Plus className="size-3.5" aria-hidden="true" />}
                  {name}
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        <p className="mb-6 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
          Add experiences or projects with skills to get suggestions — or continue and add skills from your profile.
        </p>
      )}

      {skills.length > 0 && (
        <div className="space-y-3 rounded-xl border border-border bg-background p-4">
          <p className="text-sm font-medium">Your skill profile</p>
          {skills.map((s) => (
            <SkillBar key={s.id} name={s.name} level={s.level} verified={s.verified} />
          ))}
        </div>
      )}

      <div className="mt-8 flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back
        </Button>
        <Button onClick={finishAll}>
          Finish & view dashboard
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}
