"use client"

import {
  ArrowLeft,
  Award,
  Check,
  GraduationCap,
  Search,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { ButtonLink } from "@/components/button-link"
import { Field, Input, Label, Select, Textarea } from "@/components/form-controls"
import { Chip, MatchRing, ProgressBar, SkillBar, VerifiedBadge } from "@/components/ui-bits"
import { DsSection, Specimen, Subhead, Swatch, TokenRow } from "@/components/design-system/ds-primitives"

const NAV = [
  { id: "principles", label: "Principles" },
  { id: "color", label: "Color" },
  { id: "typography", label: "Typography" },
  { id: "spacing", label: "Spacing" },
  { id: "radius", label: "Radius & layout" },
  { id: "elevation", label: "Elevation" },
  { id: "buttons", label: "Buttons" },
  { id: "forms", label: "Forms & inputs" },
  { id: "cards", label: "Cards" },
  { id: "indicators", label: "Badges & progress" },
]

const PRINCIPLES = [
  {
    icon: TrendingUp,
    title: "Growth over gaps",
    body: "Every screen frames experience as momentum. We show what someone has built, never what they lack.",
  },
  {
    icon: Award,
    title: "Evidence you can trust",
    body: "Verification badges, endorsements and real artifacts give young people's skills professional credibility.",
  },
  {
    icon: Sparkles,
    title: "Approachable, not childish",
    body: "Warm indigo and optimistic amber keep it youthful, while a confident type system keeps it employer-ready.",
  },
]

const SPACING = [
  { token: "space-1", px: "4px", rem: "0.25rem", w: "w-1" },
  { token: "space-2", px: "8px", rem: "0.5rem", w: "w-2" },
  { token: "space-3", px: "12px", rem: "0.75rem", w: "w-3" },
  { token: "space-4", px: "16px", rem: "1rem", w: "w-4" },
  { token: "space-6", px: "24px", rem: "1.5rem", w: "w-6" },
  { token: "space-8", px: "32px", rem: "2rem", w: "w-8" },
  { token: "space-12", px: "48px", rem: "3rem", w: "w-12" },
  { token: "space-16", px: "64px", rem: "4rem", w: "w-16" },
]

const TYPE_SCALE = [
  { cls: "text-xs", px: "12px", use: "Captions, metadata, badges" },
  { cls: "text-sm", px: "14px", use: "Body, form labels, secondary text" },
  { cls: "text-base", px: "16px", use: "Default paragraph text" },
  { cls: "text-lg", px: "18px", use: "Lead paragraphs, card titles" },
  { cls: "text-xl", px: "20px", use: "Section subheadings" },
  { cls: "text-2xl", px: "24px", use: "Page titles" },
  { cls: "text-3xl", px: "30px", use: "Dashboard headings" },
  { cls: "text-4xl", px: "36px", use: "Hero / display" },
]

const RADII = [
  { token: "rounded-md", note: "Inputs, small controls", cls: "rounded-md" },
  { token: "rounded-lg", note: "Buttons, chips", cls: "rounded-lg" },
  { token: "rounded-xl", note: "Cards, panels", cls: "rounded-xl" },
  { token: "rounded-2xl", note: "Feature cards, modals", cls: "rounded-2xl" },
  { token: "rounded-full", note: "Avatars, pills, rings", cls: "rounded-full" },
]

const ELEVATION = [
  { token: "shadow-e1", note: "Resting cards, list rows", cls: "shadow-e1" },
  { token: "shadow-e2", note: "Raised cards, hover", cls: "shadow-e2" },
  { token: "shadow-e3", note: "Dropdowns, popovers", cls: "shadow-e3" },
  { token: "shadow-e4", note: "Dialogs, sheets", cls: "shadow-e4" },
  { token: "shadow-e5", note: "Modal / command palette", cls: "shadow-e5" },
]

export default function DesignSystemPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4">
            <Logo />
            <span className="hidden text-sm text-muted-foreground sm:inline">Design System</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <ButtonLink href="/" variant="ghost" size="sm">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to app
            </ButtonLink>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-10 px-4 py-10 sm:px-6">
        <aside className="hidden w-48 shrink-0 lg:block">
          <nav aria-label="Design system sections" className="sticky top-24 space-y-1">
            {NAV.map((n) => (
              <a
                key={n.id}
                href={`#${n.id}`}
                className="block rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {n.label}
              </a>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-12 max-w-2xl">
            <Chip tone="primary">
              <Sparkles className="size-3" aria-hidden="true" />
              VOLUNTEER CONNECT
            </Chip>
            <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-balance">
              A design system for confidence and possibility
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground text-pretty">
              The tokens, type, and components that power the student career platform — built to feel empowering,
              youthful, and trustworthy while meeting WCAG 2.1 AA contrast. Everything below is driven by CSS custom
              properties, so light and dark themes stay in perfect sync.
            </p>
          </div>

          {/* PRINCIPLES */}
          <DsSection
            id="principles"
            eyebrow="Foundation"
            title="Brand principles"
            description="Three ideas guide every visual decision. When a choice is ambiguous, these win."
          >
            <div className="grid gap-4 sm:grid-cols-3">
              {PRINCIPLES.map((p) => (
                <div key={p.title} className="rounded-2xl border border-border bg-card p-5 shadow-e1">
                  <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <p.icon className="size-5" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 font-display text-base font-semibold">{p.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground text-pretty">{p.body}</p>
                </div>
              ))}
            </div>
          </DsSection>

          {/* COLOR */}
          <DsSection
            id="color"
            eyebrow="Tokens"
            title="Color system"
            description="A focused indigo/violet brand, an optimistic amber accent, calm neutrals, and clear semantic states. Toggle the theme in the header — every swatch is a live token, not a hardcoded value."
          >
            <Subhead>Brand & primary</Subhead>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Swatch name="Primary" token="--primary" className="bg-primary" textClassName="text-primary-foreground" note="Actions, links, focus" />
              <Swatch name="Primary /10" token="bg-primary/10" className="bg-primary/10" textClassName="text-primary" note="Tinted surfaces" />
              <Swatch name="Accent" token="--accent" className="bg-accent" textClassName="text-accent-foreground" note="Highlights, celebration" />
              <Swatch name="Secondary" token="--secondary" className="bg-secondary" textClassName="text-secondary-foreground" note="Quiet buttons, chips" />
            </div>

            <Subhead>Neutrals</Subhead>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Swatch name="Background" token="--background" className="bg-background border-b border-border" textClassName="text-foreground" note="App canvas" />
              <Swatch name="Card" token="--card" className="bg-card border-b border-border" textClassName="text-card-foreground" note="Surfaces" />
              <Swatch name="Muted" token="--muted" className="bg-muted" textClassName="text-muted-foreground" note="Subtle fills" />
              <Swatch name="Foreground" token="--foreground" className="bg-foreground" textClassName="text-background" note="Primary text" />
            </div>

            <Subhead>Semantic states</Subhead>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Swatch name="Success" token="--success" className="bg-success" textClassName="text-success-foreground" note="Verified, complete" />
              <Swatch name="Warning" token="--warning" className="bg-warning" textClassName="text-warning-foreground" note="Attention, pending" />
              <Swatch name="Info" token="--info" className="bg-info" textClassName="text-info-foreground" note="Tips, neutral notices" />
              <Swatch name="Destructive" token="--destructive" className="bg-destructive" textClassName="text-destructive-foreground" note="Errors, remove" />
            </div>

            <Subhead>Data visualization</Subhead>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              <Swatch name="Chart 1" token="--chart-1" className="bg-chart-1" textClassName="text-background" />
              <Swatch name="Chart 2" token="--chart-2" className="bg-chart-2" textClassName="text-accent-foreground" />
              <Swatch name="Chart 3" token="--chart-3" className="bg-chart-3" textClassName="text-background" />
              <Swatch name="Chart 4" token="--chart-4" className="bg-chart-4" textClassName="text-background" />
              <Swatch name="Chart 5" token="--chart-5" className="bg-chart-5" textClassName="text-background" />
            </div>
          </DsSection>

          {/* TYPOGRAPHY */}
          <DsSection
            id="typography"
            eyebrow="Tokens"
            title="Typography"
            description="Two families only. Space Grotesk gives headings a confident, contemporary character; Inter keeps body text highly legible at every size. Body copy uses relaxed 1.5–1.6 line height."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-6 shadow-e1">
                <p className="font-mono text-xs text-muted-foreground">font-display — Space Grotesk</p>
                <p className="mt-3 font-display text-4xl font-bold tracking-tight">Your skills, showcased</p>
                <p className="mt-2 font-display text-lg font-medium text-muted-foreground">Headings, display, brand</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6 shadow-e1">
                <p className="font-mono text-xs text-muted-foreground">font-sans — Inter</p>
                <p className="mt-3 text-lg leading-relaxed">
                  Every volunteering shift, project and achievement becomes evidence of a real, employable skill.
                </p>
                <p className="mt-2 text-sm text-muted-foreground">Body, UI, forms and long-form reading.</p>
              </div>
            </div>

            <Subhead>Type scale</Subhead>
            <div className="space-y-2">
              {TYPE_SCALE.map((t) => (
                <div key={t.cls} className="flex items-baseline gap-4 rounded-lg border border-border bg-card px-4 py-3">
                  <span className={`${t.cls} min-w-0 flex-1 truncate font-display font-semibold`}>
                    Experiences that matter
                  </span>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground">{t.cls}</span>
                  <span className="hidden w-12 shrink-0 text-right font-mono text-xs text-muted-foreground sm:block">
                    {t.px}
                  </span>
                  <span className="hidden shrink-0 text-xs text-muted-foreground md:block md:w-52">{t.use}</span>
                </div>
              ))}
            </div>

            <Subhead>Weights</Subhead>
            <div className="flex flex-wrap gap-6 rounded-xl border border-border bg-card p-6 shadow-e1">
              {[
                { w: "font-normal", n: "400 Regular" },
                { w: "font-medium", n: "500 Medium" },
                { w: "font-semibold", n: "600 Semibold" },
                { w: "font-bold", n: "700 Bold" },
              ].map((x) => (
                <div key={x.w}>
                  <p className={`${x.w} font-display text-2xl`}>Ag</p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">{x.n}</p>
                </div>
              ))}
            </div>
          </DsSection>

          {/* SPACING */}
          <DsSection
            id="spacing"
            eyebrow="Tokens"
            title="Spacing scale"
            description="An 8px base grid with a 4px half-step. Using consistent multiples keeps rhythm predictable across dense dashboards and airy marketing pages alike."
          >
            <div className="space-y-2">
              {SPACING.map((s) => (
                <TokenRow
                  key={s.token}
                  name={s.token}
                  value={`${s.px} · ${s.rem}`}
                  sample={<span className={`${s.w} h-4 rounded-sm bg-primary`} />}
                />
              ))}
            </div>
          </DsSection>

          {/* RADIUS */}
          <DsSection
            id="radius"
            eyebrow="Tokens"
            title="Radius & layout"
            description="Rounding scales from the --radius base (0.75rem). Softer corners on large surfaces reinforce the approachable, friendly feel; tighter radii keep controls crisp."
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {RADII.map((r) => (
                <div key={r.token} className="rounded-xl border border-border bg-card p-4 text-center shadow-e1">
                  <div className={`mx-auto size-16 border-2 border-primary bg-primary/10 ${r.cls}`} />
                  <p className="mt-3 font-mono text-xs font-medium">{r.token}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{r.note}</p>
                </div>
              ))}
            </div>
          </DsSection>

          {/* ELEVATION */}
          <DsSection
            id="elevation"
            eyebrow="Tokens"
            title="Elevation"
            description="Five soft, brand-tinted shadow levels. Indigo-tinted in light mode for warmth; deeper and neutral in dark mode. Higher levels signal more transient, focused surfaces."
          >
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
              {ELEVATION.map((e) => (
                <div key={e.token} className="text-center">
                  <div className={`grid h-24 place-items-center rounded-2xl bg-card ${e.cls}`}>
                    <span className="font-display text-lg font-bold text-primary">{e.token.replace("shadow-", "")}</span>
                  </div>
                  <p className="mt-3 font-mono text-xs font-medium">{e.token}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{e.note}</p>
                </div>
              ))}
            </div>
          </DsSection>

          {/* BUTTONS */}
          <DsSection
            id="buttons"
            eyebrow="Components"
            title="Buttons"
            description="Variants map to intent, sizes to density. All states — hover, focus ring, active press, and disabled — are built in and meet AA contrast."
          >
            <Subhead>Variants</Subhead>
            <Specimen label="variant=">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="link">Link</Button>
            </Specimen>

            <Subhead>Sizes</Subhead>
            <Specimen label="size=">
              <Button size="xs">Extra small</Button>
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon" aria-label="Search">
                <Search className="size-4" aria-hidden="true" />
              </Button>
            </Specimen>

            <Subhead>States</Subhead>
            <Specimen label="interactive states">
              <Button>Default</Button>
              <Button className="ring-3 ring-ring/50">Focus</Button>
              <Button disabled>Disabled</Button>
              <Button>
                <Check className="size-4" aria-hidden="true" />
                With icon
              </Button>
            </Specimen>
          </DsSection>

          {/* FORMS */}
          <DsSection
            id="forms"
            eyebrow="Components"
            title="Forms & inputs"
            description="Inputs share one base style with a clear focus ring. Fields pair labels, hints, and inline validation so guidance always feels supportive, never punitive."
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-e1">
                <Field label="Full name" htmlFor="ds-name" hint="As you'd like it shown on your CV.">
                  <Input id="ds-name" placeholder="Nehemiah Williams" defaultValue="Nehemiah Williams" />
                </Field>
                <Field label="Area of interest" htmlFor="ds-select">
                  <Select id="ds-select" defaultValue="community">
                    <option value="community">Community & social impact</option>
                    <option value="tech">Technology</option>
                    <option value="health">Healthcare</option>
                  </Select>
                </Field>
                <Field label="About you" htmlFor="ds-about" hint="A short, confident summary.">
                  <Textarea id="ds-about" placeholder="I'm a first-year student who..." />
                </Field>
              </div>
              <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-e1">
                <div>
                  <Label htmlFor="ds-focus">Focused</Label>
                  <Input id="ds-focus" className="border-ring ring-3 ring-ring/30" defaultValue="Focused input" />
                </div>
                <Field label="Email" htmlFor="ds-error" error="Enter a valid email address.">
                  <Input id="ds-error" aria-invalid defaultValue="amara@" className="border-destructive ring-3 ring-destructive/20" />
                </Field>
                <div>
                  <Label htmlFor="ds-disabled">Disabled</Label>
                  <Input id="ds-disabled" disabled defaultValue="Not editable" />
                </div>
                <div>
                  <Label htmlFor="ds-placeholder">Empty</Label>
                  <Input id="ds-placeholder" placeholder="Placeholder text" />
                </div>
              </div>
            </div>
          </DsSection>

          {/* CARDS */}
          <DsSection
            id="cards"
            eyebrow="Components"
            title="Cards"
            description="Cards are the backbone of the dashboard. They combine a surface, elevation, radius, and consistent internal spacing — shown here as the real patterns used across the product."
          >
            <div className="grid gap-4 md:grid-cols-3">
              {/* Stat card */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-e1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Volunteer hours</span>
                  <TrendingUp className="size-4 text-success" aria-hidden="true" />
                </div>
                <p className="mt-2 font-display text-3xl font-bold">148</p>
                <p className="mt-1 text-xs text-success">+12 this month</p>
              </div>

              {/* Skill / profile card */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-e1">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
                    <GraduationCap className="size-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-medium leading-tight">Leadership</p>
                    <p className="text-xs text-muted-foreground">Endorsed by 4 people</p>
                  </div>
                </div>
                <div className="mt-4">
                  <SkillBar name="Proficiency" level={4} verified />
                </div>
              </div>

              {/* Opportunity match card */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-e1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium leading-tight text-balance">Climate Action Intern</p>
                    <p className="text-xs text-muted-foreground">EarthWise Foundation</p>
                  </div>
                  <MatchRing value={92} size={48} />
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  <Chip tone="primary">Leadership</Chip>
                  <Chip tone="muted">Research</Chip>
                </div>
              </div>
            </div>
          </DsSection>

          {/* INDICATORS */}
          <DsSection
            id="indicators"
            eyebrow="Components"
            title="Badges & progress"
            description="Progress indicators and skill badges do the emotional heavy lifting — they turn effort into visible, celebrated achievement."
          >
            <Subhead>Chips & badges</Subhead>
            <Specimen label="Chip tone= / VerifiedBadge">
              <Chip tone="primary">
                <Star className="size-3" aria-hidden="true" />
                Primary
              </Chip>
              <Chip tone="accent">Accent</Chip>
              <Chip tone="success">Success</Chip>
              <Chip tone="muted">Muted</Chip>
              <Chip tone="outline">Outline</Chip>
              <VerifiedBadge />
            </Specimen>

            <Subhead>Progress</Subhead>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-6 shadow-e1">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium">Profile strength</span>
                  <span className="text-muted-foreground">78%</span>
                </div>
                <ProgressBar value={78} />
                <div className="mt-6 space-y-4">
                  <SkillBar name="Communication" level={5} verified />
                  <SkillBar name="Teamwork" level={3} />
                </div>
              </div>
              <div className="flex items-center justify-around rounded-xl border border-border bg-card p-6 shadow-e1">
                <div className="text-center">
                  <MatchRing value={92} />
                  <p className="mt-2 text-xs text-muted-foreground">Strong match</p>
                </div>
                <div className="text-center">
                  <MatchRing value={54} />
                  <p className="mt-2 text-xs text-muted-foreground">Partial</p>
                </div>
                <div className="text-center">
                  <MatchRing value={28} />
                  <p className="mt-2 text-xs text-muted-foreground">Stretch</p>
                </div>
              </div>
            </div>
          </DsSection>

          <footer className="mt-14 border-t border-border pt-8 text-sm text-muted-foreground">
            <p>
              Built on CSS custom properties and Tailwind theme tokens. Every value here flows from{" "}
              <span className="font-mono text-foreground">app/globals.css</span> — change a token once and the whole
              product updates.
            </p>
          </footer>
        </main>
      </div>
    </div>
  )
}
