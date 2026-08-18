"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { Logo } from "@/components/logo"
import { ButtonLink } from "@/components/button-link"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/opportunities", label: "Opportunities" },
]

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function MarketingHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between gap-2 px-4 sm:gap-3 sm:px-6">
        <Link href="/" aria-label="Volunteer Connect home" className="min-w-0" onClick={() => setOpen(false)}>
          <Logo />
        </Link>
        <nav className="hidden items-center gap-7 text-[0.9375rem] text-muted-foreground md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "transition-colors hover:text-foreground",
                isActive(pathname, link.href) && "font-medium text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-1.5">
          <ThemeToggle />
          <div className="hidden items-center gap-1.5 md:flex">
            <ButtonLink href="/login" variant="ghost" size="sm" prefetch>
              Login
            </ButtonLink>
            <ButtonLink href="/register" size="sm" prefetch>
              Sign Up
            </ButtonLink>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-expanded={open}
            aria-controls="public-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </Button>
        </div>
      </div>
      {open ? (
        <div id="public-nav" className="border-t border-border bg-background px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground",
                  isActive(pathname, link.href) && "bg-muted font-medium text-foreground",
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2">
              <ButtonLink href="/login" variant="outline" className="justify-center" onClick={() => setOpen(false)}>
                Login
              </ButtonLink>
              <ButtonLink href="/register" className="justify-center" onClick={() => setOpen(false)}>
                Sign Up
              </ButtonLink>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  )
}
