import type { Metadata } from "next"
import Link from "next/link"
import {
  Briefcase,
  Building2,
  ClipboardList,
  Compass,
  FileCheck,
  FileText,
  GraduationCap,
  HeartHandshake,
  ListChecks,
  Mail,
  MapPin,
  Share2,
  User,
  Users,
} from "lucide-react"
import { MarketingHeader } from "@/components/marketing-header"
import { Logo } from "@/components/logo"
import { ButtonLink } from "@/components/button-link"

export const metadata: Metadata = {
  title: "About — Volunteer Connect",
  description:
    "Volunteer Connect helps young people in Sierra Leone turn volunteering, school projects, internships, and practical work into skills, evidence, a CV, a portfolio, and opportunities.",
}

const pipeline = ["Experience", "Skills", "Evidence", "CV / Portfolio", "Opportunities"]

const audiences = [
  {
    icon: GraduationCap,
    title: "Students & Graduates",
    body: "Build a professional profile from your education, experiences, skills, and achievements.",
  },
  {
    icon: Briefcase,
    title: "Young Job Seekers",
    body: "Show what you can do even when you have limited formal work experience.",
  },
  {
    icon: Building2,
    title: "Employers & Organizations",
    body: "Create opportunities and discover candidates based on skills and experience.",
  },
  {
    icon: HeartHandshake,
    title: "Volunteers & Project Participants",
    body: "Turn volunteering, projects, leadership activities, and practical work into professional evidence.",
  },
]

const features = [
  {
    icon: User,
    title: "Build Your Profile",
    body: "Bring education, volunteering, projects, and achievements into one record you can keep updating.",
  },
  {
    icon: ClipboardList,
    title: "Track Your Experience",
    body: "Log internships, leadership, competitions, and practical work — not only paid jobs.",
  },
  {
    icon: ListChecks,
    title: "Build Your Skills",
    body: "Name the skills those activities used, and set the level you can honestly stand behind.",
  },
  {
    icon: FileCheck,
    title: "Add Evidence",
    body: "Attach a certificate, photo, link, or named reference so others can see how a skill was earned.",
  },
  {
    icon: FileText,
    title: "Create Your CV",
    body: "Build a CV from the same record, then print it or save it as a PDF.",
  },
  {
    icon: Share2,
    title: "Build Your Portfolio",
    body: "Publish a public page you can share when you apply, with the sections you choose to show.",
  },
  {
    icon: Compass,
    title: "Discover Opportunities",
    body: "Find jobs, internships, scholarships, volunteering, and training scored against skills on your record.",
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />

      <main>
        <section className="px-4 pb-4 pt-10 sm:px-6 sm:pt-14">
          <div className="mx-auto max-w-lg text-center md:max-w-2xl">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-accent">About</p>
            <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Volunteer Connect
            </h1>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground text-pretty">
              A record of real experience for young people in Sierra Leone.
            </p>
          </div>
        </section>

        <section className="px-4 py-8 sm:px-6 sm:py-10">
          <div className="mx-auto max-w-lg md:max-w-2xl">
            <h2 className="mb-4 font-display text-2xl font-semibold tracking-tight">Why We Built This</h2>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-e2 sm:p-7">
              <p className="text-[0.975rem] leading-relaxed text-foreground/90 text-pretty">
                Many students and young people gain valuable experience through volunteering, school projects,
                internships, leadership activities, competitions, and practical work, but often struggle to identify,
                organize, and communicate the skills they have developed.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-primary/[0.05] px-4 py-12 dark:bg-primary/10 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-lg md:max-w-2xl">
            <h2 className="mb-4 font-display text-2xl font-semibold tracking-tight">What We Want</h2>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-e2 sm:p-7">
              <p className="text-[0.975rem] leading-relaxed text-foreground/90 text-pretty">
                Volunteer Connect helps young people turn real experiences into skills, evidence, professional CVs,
                digital portfolios, and opportunities.
              </p>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Core idea</p>
              <ol className="mt-3 flex flex-wrap items-center gap-2">
                {pipeline.map((step, i) => (
                  <li key={step} className="flex items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
                      {step}
                    </span>
                    {i < pipeline.length - 1 ? (
                      <span className="text-muted-foreground" aria-hidden="true">
                        →
                      </span>
                    ) : null}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-lg md:max-w-4xl">
            <h2 className="mb-6 font-display text-2xl font-semibold tracking-tight md:text-center">Who It Is For</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {audiences.map((item) => (
                <article key={item.title} className="rounded-2xl border border-border bg-card p-5 shadow-e2 sm:p-6">
                  <span className="grid size-11 place-items-center rounded-full bg-primary/10 text-primary">
                    <item.icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-primary/[0.05] px-4 py-12 dark:bg-primary/10 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-lg md:max-w-4xl">
            <h2 className="mb-6 font-display text-2xl font-semibold tracking-tight md:text-center">
              What You Can Do
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {features.map((item) => (
                <article key={item.title} className="rounded-2xl border border-border bg-card p-5 shadow-e2 sm:p-6">
                  <span className="grid size-11 place-items-center rounded-full bg-primary/10 text-primary">
                    <item.icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-lg md:max-w-2xl">
            <h2 className="mb-4 font-display text-2xl font-semibold tracking-tight">The Team</h2>
            <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-e2 sm:p-8">
              <span className="mx-auto grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
                <Users className="size-6" aria-hidden="true" />
              </span>
              <p className="mt-4 font-display text-2xl font-semibold tracking-tight">FANTASTIC FOUR</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
                The project team behind Volunteer Connect.
              </p>
            </div>
          </div>
        </section>

        <section className="px-4 pb-12 sm:px-6 sm:pb-16">
          <div className="mx-auto max-w-lg md:max-w-2xl">
            <h2 className="mb-4 font-display text-2xl font-semibold tracking-tight">Contact</h2>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-e2 sm:p-7">
              <ul className="space-y-4">
                <li>
                  <a
                    href="mailto:support@volunteerconnect.org"
                    className="flex items-start gap-3 rounded-lg py-1 text-sm hover:text-primary"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                      <Mail className="size-4" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                        Email
                      </span>
                      <span className="mt-0.5 block font-medium">support@volunteerconnect.org</span>
                    </span>
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                    <MapPin className="size-4" aria-hidden="true" />
                  </span>
                  <span className="text-sm">
                    <span className="block text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                      Location
                    </span>
                    <span className="mt-0.5 block font-medium">Freetown, Sierra Leone</span>
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-primary px-4 py-14 text-primary-foreground sm:px-6 sm:py-16">
          <div className="mx-auto max-w-lg text-center md:max-w-2xl">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
              TURN YOUR EXPERIENCE INTO OPPORTUNITY.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-primary-foreground/85 text-pretty">
              Build your profile, showcase your skills, and discover opportunities that match what you can do.
            </p>
            <ButtonLink
              href="/register"
              sizeUp
              className="mt-8 w-full justify-center bg-background text-foreground tracking-[0.14em] hover:bg-background/90 sm:w-auto"
            >
              GET STARTED
            </ButtonLink>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-background">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Link href="/" aria-label="Volunteer Connect home">
            <Logo />
          </Link>
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <Link href="/" className="inline-flex min-h-11 items-center hover:text-foreground">
              Home
            </Link>
            <Link href="/about" className="inline-flex min-h-11 items-center hover:text-foreground">
              About
            </Link>
            <Link href="/opportunities" className="inline-flex min-h-11 items-center hover:text-foreground">
              Opportunities
            </Link>
            <Link href="/login" className="inline-flex min-h-11 items-center hover:text-foreground">
              Login
            </Link>
          </nav>
          <p className="text-sm text-muted-foreground">Freetown, Sierra Leone</p>
        </div>
      </footer>
    </div>
  )
}
