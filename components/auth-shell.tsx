import Link from "next/link"
import type { ReactNode } from "react"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"

const notes = [
  "Students keep a record of school, volunteering, and projects.",
  "Organisations post jobs, internships, scholarships, and training.",
  "Organisation accounts are reviewed before they can publish.",
]

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative flex flex-col justify-center px-4 py-10 sm:px-8">
        <div className="absolute right-4 top-4 sm:right-8 sm:top-6">
          <ThemeToggle />
        </div>
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" className="mb-8 inline-flex" aria-label="Volunteer Connect home">
            <Logo />
          </Link>
          {children}
        </div>
      </div>
      <aside className="relative hidden flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
        <Link href="/" aria-label="Volunteer Connect home">
          <Logo inverted />
        </Link>
        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-primary-foreground/70">
            Sierra Leone
          </p>
          <h2 className="mt-4 font-display text-3xl font-semibold leading-tight text-balance">
            A record you can take to an application.
          </h2>
          <p className="mt-4 max-w-sm text-primary-foreground/80 text-pretty">
            Volunteer Connect is for young people and organisations in Sierra Leone — not a feed, and not a ranking
            contest.
          </p>
          <ul className="mt-8 space-y-3 text-sm leading-relaxed text-primary-foreground/85">
            {notes.map((text) => (
              <li key={text} className="border-l border-primary-foreground/25 pl-4">
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-primary-foreground/60">Freetown · Volunteer Connect</p>
      </aside>
    </div>
  )
}
