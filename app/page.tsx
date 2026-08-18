import Image from "next/image"
import Link from "next/link"
import { MarketingHeader } from "@/components/marketing-header"
import { Logo } from "@/components/logo"
import { ButtonLink } from "@/components/button-link"

const steps = [
  {
    title: "Create an account",
    body: "Register as a student or as an organisation. Students start a personal record; organisations wait for review before they can post.",
  },
  {
    title: "Add what you have already done",
    body: "School, volunteering, internships, projects, and awards. Formal employment is not required.",
  },
  {
    title: "List the skills those activities used",
    body: "Name the skills, attach a certificate or reference where you have one, and ask someone to confirm them.",
  },
  {
    title: "Use the record to apply",
    body: "Print a CV, share a public page, and apply for jobs, internships, scholarships, volunteering, and training listed here.",
  },
]

const recordItems = [
  { title: "School and qualifications", body: "Institutions, courses, and grades you choose to include." },
  { title: "Volunteering and work", body: "Community service, internships, and jobs — treated as experience, not as a lesser category." },
  { title: "Projects and evidence", body: "What you built or organised, with photos, links, or certificates attached." },
  { title: "Skills", body: "Skills named from that work, with optional confirmation from a person or organisation." },
]

export default function Page() {
  return (
    <div className="min-h-screen">
      <MarketingHeader />

      <section>
        <div className="mx-auto grid max-w-6xl items-end gap-8 px-4 py-8 sm:gap-12 sm:px-6 sm:py-14 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:py-20">
          <div>
            <p className="mb-4 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-accent">Sierra Leone</p>
            <h1 className="font-display text-[1.85rem] font-semibold leading-[1.15] tracking-tight text-balance sm:text-[2.35rem] md:text-5xl">
              Keep a record of the work you have already done.
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground text-pretty sm:mt-5 sm:text-[1.05rem]">
              Volunteer Connect is for young people who volunteer, study, and take on projects — and need a way to show
              that when they apply for jobs, internships, scholarships, and training in Sierra Leone.
            </p>
            <div className="mt-6 flex w-full flex-col gap-2 sm:mt-8 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
              <ButtonLink href="/register" sizeUp className="w-full justify-center sm:w-auto">
                Create an account
              </ButtonLink>
              <ButtonLink href="/login" variant="outline" sizeUp className="w-full justify-center sm:w-auto">
                Log in
              </ButtonLink>
            </div>
          </div>
          <figure className="min-w-0 w-full">
            <div className="relative aspect-[16/10] w-full overflow-hidden border border-border sm:aspect-[4/3]">
              <Image
                src="/volunteer-connect-hero.jpg"
                alt="Hands of several people forming a circle, each holding soil and a young seedling"
                fill
                className="object-cover object-center"
                sizes="(min-width: 768px) 42vw, 100vw"
                quality={85}
                priority
              />
            </div>
            <figcaption className="mt-2.5 text-xs leading-relaxed text-muted-foreground">
              Community work counts here the same way classroom study does.
            </figcaption>
          </figure>
        </div>
      </section>

      <section id="how" className="border-t border-border">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">How it works</h2>
            <p className="mt-3 max-w-sm text-muted-foreground text-pretty">
              Four steps. You can skip parts and come back. Nothing here asks you to invent a career story.
            </p>
          </div>
          <ol className="divide-y divide-border border-y border-border">
            {steps.map((s, i) => (
              <li key={s.title} className="grid gap-2 py-7 sm:grid-cols-[3.5rem_1fr] sm:gap-8">
                <span className="font-display text-xl text-primary/80">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="font-display text-lg font-semibold">{s.title}</h3>
                  <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-muted-foreground text-pretty">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="record" className="border-t border-border bg-card/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="grid items-start gap-8 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] md:gap-12">
            <div className="max-w-xl">
              <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">What goes on your record</h2>
              <p className="mt-3 text-muted-foreground text-pretty">
                One place for school, volunteering, and projects — then a CV and a page you can share when you apply.
              </p>
            </div>
            <figure className="min-w-0 w-full">
              <div className="relative aspect-[16/10] w-full overflow-hidden border border-border sm:aspect-[3/2]">
                <Image
                  src="/volunteer-connect-community.jpg"
                  alt="Volunteers standing in a circle with their hands stacked together"
                  fill
                  className="object-cover object-center"
                  sizes="(min-width: 768px) 38vw, 100vw"
                  quality={85}
                />
              </div>
              <figcaption className="mt-2.5 text-xs leading-relaxed text-muted-foreground">
                Volunteering and group projects sit on the record with school and paid work.
              </figcaption>
            </figure>
          </div>
          <dl className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {recordItems.map((item) => (
              <div key={item.title} className="border-t border-border pt-5">
                <dt className="font-display text-base font-semibold">{item.title}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">{item.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="organisations" className="border-t border-border">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:items-start md:gap-16">
          <div>
            <p className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-accent">Organisations</p>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
              Post an opening. Read a record, not a slogan.
            </h2>
            <p className="mt-4 max-w-md text-muted-foreground text-pretty">
              Companies, NGOs, schools, and public bodies in Sierra Leone can list jobs, internships, scholarships,
              volunteering, and training. Applications sit against listed skills and evidence. New organisation accounts
              are reviewed before they can publish.
            </p>
            <ButtonLink href="/register?role=employer" sizeUp className="mt-7 w-full justify-center sm:w-auto">
              Create an organisation account
            </ButtonLink>
          </div>
          <ul className="space-y-5 border-l border-border pl-6 text-sm leading-relaxed text-muted-foreground">
            <li>
              <span className="block font-medium text-foreground">Openings you actually run</span>
              Jobs, internships, scholarships, volunteering, and short courses — not a marketplace of invented roles.
            </li>
            <li>
              <span className="block font-medium text-foreground">Applications you can check</span>
              See the skills a person listed, and whether a certificate or reference is attached.
            </li>
            <li>
              <span className="block font-medium text-foreground">A review before you post</span>
              Volunteer Connect checks organisation details so students are not applying into a void.
            </li>
          </ul>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-16 sm:flex-row sm:items-end sm:justify-between sm:px-6">
          <div className="max-w-lg">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
              Start with what you have.
            </h2>
            <p className="mt-2 text-sm text-muted-foreground text-pretty">
              A school name, a volunteering role, or a project is enough to begin.
            </p>
          </div>
          <ButtonLink href="/register" sizeUp className="w-full justify-center sm:w-auto">
            Create an account
          </ButtonLink>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-8 sm:flex-row sm:items-center sm:px-6">
          <Link href="/" aria-label="Volunteer Connect home">
            <Logo />
          </Link>
          <p className="text-sm text-muted-foreground">Freetown, Sierra Leone</p>
        </div>
      </footer>
    </div>
  )
}
