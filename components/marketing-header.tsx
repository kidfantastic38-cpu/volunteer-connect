import Link from "next/link"
import { Logo } from "@/components/logo"
import { ButtonLink } from "@/components/button-link"

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="VolunteerConnect home">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          <a href="#how" className="transition-colors hover:text-foreground">
            How it works
          </a>
          <a href="#features" className="transition-colors hover:text-foreground">
            Features
          </a>
          <a href="#employers" className="transition-colors hover:text-foreground">
            For employers
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <ButtonLink href="/login" variant="ghost" size="sm" prefetch>
            Log in
          </ButtonLink>
          <ButtonLink href="/register" size="sm" prefetch>
            Get started
          </ButtonLink>
        </div>
      </div>
    </header>
  )
}
