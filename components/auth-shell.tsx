import Link from "next/link"
import type { ReactNode } from "react"
import { BadgeCheck, Compass, Target } from "lucide-react"
import { Logo } from "@/components/logo"

const highlights = [
  { icon: Compass, text: "Guided onboarding that turns activities into skills" },
  { icon: BadgeCheck, text: "Evidence-backed, verifiable profiles" },
  { icon: Target, text: "Opportunities matched to your strengths" },
]

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-center px-4 py-10 sm:px-8">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" className="mb-8 inline-flex" aria-label="VolunteerConnect home">
            <Logo />
          </Link>
          {children}
        </div>
      </div>
      <aside className="relative hidden flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
        <Logo className="[&_span:last-child]:text-primary-foreground" showText />
        <div>
          <h2 className="font-display text-3xl font-bold leading-tight text-balance">
            Every experience you&apos;ve had is worth something.
          </h2>
          <p className="mt-3 max-w-sm text-primary-foreground/80 text-pretty">
            Join thousands of young people turning volunteering, projects and achievements into real career momentum.
          </p>
          <ul className="mt-8 space-y-3">
            {highlights.map((h) => (
              <li key={h.text} className="flex items-center gap-3 text-sm">
                <span className="grid size-8 place-items-center rounded-lg bg-primary-foreground/15">
                  <h.icon className="size-4" aria-hidden="true" />
                </span>
                {h.text}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-primary-foreground/60">Prototype experience — no real data is stored.</p>
      </aside>
    </div>
  )
}
