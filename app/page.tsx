import Image from "next/image"
import {
  ArrowRight,
  Award,
  BadgeCheck,
  Compass,
  FileText,
  GraduationCap,
  HeartHandshake,
  LayoutGrid,
  Sparkles,
  Target,
  UserPlus,
} from "lucide-react"
import { MarketingHeader } from "@/components/marketing-header"
import { Logo } from "@/components/logo"
import { Chip } from "@/components/ui-bits"
import { ButtonLink } from "@/components/button-link"

const steps = [
  {
    icon: UserPlus,
    title: "Register & set up",
    body: "Create an account, pick your goal, and build your basic profile in minutes.",
  },
  {
    icon: Compass,
    title: "Guided onboarding",
    body: "We walk you through adding education, experiences, projects and achievements.",
  },
  {
    icon: Sparkles,
    title: "Skills extracted",
    body: "Your activities are translated into structured, evidence-backed skills.",
  },
  {
    icon: FileText,
    title: "CV & portfolio",
    body: "Generate a professional CV and a shareable digital portfolio automatically.",
  },
  {
    icon: Target,
    title: "Get matched",
    body: "Discover jobs, internships, scholarships, volunteering and training that fit you.",
  },
]

const features = [
  { icon: GraduationCap, title: "Education tracking", body: "Log qualifications, grades and academic achievements." },
  { icon: HeartHandshake, title: "Experience library", body: "Volunteering, internships and work experience in one place." },
  { icon: LayoutGrid, title: "Projects & evidence", body: "Attach references, certificates, photos and links as proof." },
  { icon: BadgeCheck, title: "Verified skills", body: "Turn what you did into skills employers can trust." },
  { icon: FileText, title: "Instant CV", body: "A polished, recruiter-ready CV built from your profile." },
  { icon: Award, title: "Digital portfolio", body: "A shareable page that shows your impact at a glance." },
]

export default function Page() {
  return (
    <div className="min-h-screen">
      <MarketingHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
          <div>
            <Chip tone="primary" className="mb-4">
              <Sparkles className="size-3" aria-hidden="true" /> Career readiness for young people
            </Chip>
            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-balance sm:text-5xl">
              Turn your experience into <span className="text-primary">opportunity</span>.
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground text-pretty">
              VolunteerConnect transforms your volunteering, internships, projects and achievements into structured
              skills, a professional CV, a digital portfolio, and opportunities matched to you.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink href="/register" sizeUp>
                Get started free <ArrowRight className="size-4" aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href="/demo" variant="outline" sizeUp>
                Explore a demo profile
              </ButtonLink>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
              <div>
                <p className="font-display text-xl font-bold text-foreground">12k+</p>
                <p>young people</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div>
                <p className="font-display text-xl font-bold text-foreground">3,400</p>
                <p>opportunities</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div>
                <p className="font-display text-xl font-bold text-foreground">85%</p>
                <p>felt job-ready</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
              <Image
                src="/hero-students.png"
                alt="Young volunteers collaborating on a community project"
                width={720}
                height={560}
                className="h-auto w-full object-cover"
                sizes="(min-width: 768px) 50vw, 100vw"
                priority
              />
            </div>
            <div className="absolute -bottom-5 -left-5 hidden rounded-xl border border-border bg-card p-4 shadow-e3 sm:block">
              <div className="flex items-center gap-3">
                <div className="grid size-9 place-items-center rounded-lg bg-success/15 text-success">
                  <BadgeCheck className="size-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">7 verified skills</p>
                  <p className="text-xs text-muted-foreground">extracted from your activities</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-10 max-w-2xl">
            <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              From first sign-up to job-ready
            </h2>
            <p className="mt-2 text-muted-foreground text-pretty">
              A guided journey that meets you where you are — no formal work experience required.
            </p>
          </div>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map((s, i) => (
              <li key={s.title} className="relative rounded-xl border border-border bg-card p-5">
                <span className="font-display text-xs font-bold text-primary">STEP {i + 1}</span>
                <div className="mt-3 grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <s.icon className="size-5" aria-hidden="true" />
                </div>
                <h3 className="mt-3 font-display text-base font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground text-pretty">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-10 max-w-2xl">
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Everything you need to prove your potential
          </h2>
          <p className="mt-2 text-muted-foreground text-pretty">
            Built for students, graduates and volunteers with limited formal work experience.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border border-border bg-card p-6">
              <div className="grid size-10 place-items-center rounded-lg bg-accent/25 text-accent-foreground">
                <f.icon className="size-5" aria-hidden="true" />
              </div>
              <h3 className="mt-4 font-display text-base font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground text-pretty">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Employers */}
      <section id="employers" className="border-t border-border bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-16 sm:px-6 md:grid-cols-2">
          <div>
            <Chip className="mb-4 bg-primary-foreground/15 text-primary-foreground">For employers & providers</Chip>
            <h2 className="font-display text-2xl font-bold tracking-tight text-balance sm:text-3xl">
              Publish opportunities. Discover motivated talent.
            </h2>
            <p className="mt-3 max-w-md text-primary-foreground/80 text-pretty">
              Post jobs, internships, scholarships, volunteering and training — then find candidates whose verified
              skills and evidence actually match what you need.
            </p>
            <ButtonLink href="/register?role=employer" variant="secondary" sizeUp className="mt-6">
              Post an opportunity <ArrowRight className="size-4" aria-hidden="true" />
            </ButtonLink>
          </div>
          <div className="grid gap-3">
            {["Skills-based candidate matching", "Evidence-backed profiles you can trust", "Reach young people early in their journey"].map(
              (t) => (
                <div
                  key={t}
                  className="flex items-center gap-3 rounded-xl bg-primary-foreground/10 px-4 py-3 text-sm font-medium"
                >
                  <BadgeCheck className="size-5 shrink-0" aria-hidden="true" />
                  {t}
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
        <h2 className="mx-auto max-w-2xl font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          Your experience already counts. Let&apos;s prove it.
        </h2>
        <ButtonLink href="/register" sizeUp className="mx-auto mt-8">
          Create your free profile <ArrowRight className="size-4" aria-hidden="true" />
        </ButtonLink>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <Logo />
          <p className="text-sm text-muted-foreground">
            A career-readiness platform prototype. Built for young people.
          </p>
          <a href="/design-system" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
            Design system
          </a>
        </div>
      </footer>
    </div>
  )
}
