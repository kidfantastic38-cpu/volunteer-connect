"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Bell,
  Briefcase,
  Compass,
  FileText,
  Building2,
  FolderTree,
  Gauge,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Settings,
  Share2,
  ShieldAlert,
  Sparkles,
  User,
  Users,
} from "lucide-react"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { ButtonLink } from "@/components/button-link"
import { usePrototype } from "@/components/prototype-store"
import { cn } from "@/lib/utils"

const studentNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profile", label: "My Profile", icon: User },
  { href: "/skills", label: "Skills Analysis", icon: Sparkles },
  { href: "/cv", label: "CV Builder", icon: FileText },
  { href: "/portfolio", label: "Portfolio", icon: Share2 },
  { href: "/opportunities", label: "Opportunities", icon: Compass },
  { href: "/applications", label: "Applications", icon: Briefcase },
  { href: "/notifications", label: "Notifications", icon: Bell },
]

const studentFooterNav = [
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/help", label: "Help & support", icon: HelpCircle },
]

const employerNav = [
  { href: "/employer", label: "Dashboard", icon: LayoutDashboard },
  { href: "/employer/organization", label: "Organization", icon: Building2 },
  { href: "/employer/post", label: "Post Opportunity", icon: Briefcase },
  { href: "/employer/candidates", label: "Candidates", icon: Users },
]

const employerFooterNav = [
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/help", label: "Help & support", icon: HelpCircle },
]

const adminNav = [
  { href: "/admin", label: "Overview", icon: Gauge },
  { href: "/admin/users", label: "User Management", icon: Users },
  { href: "/admin/employers", label: "Employer Verification", icon: Building2 },
  { href: "/admin/opportunities", label: "Opportunities", icon: Briefcase },
  { href: "/admin/categories", label: "Categories & Skills", icon: FolderTree },
]

const adminFooterNav: { href: string; label: string; icon: typeof Settings }[] = []

export function Avatar({ name, className }: { name: string; className?: string }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
  return (
    <span
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary",
        className,
      )}
      aria-hidden="true"
    >
      {initials || "?"}
    </span>
  )
}

export function AppShell({
  children,
  requiredRole,
}: {
  children: ReactNode
  requiredRole?: "student" | "employer" | "admin"
}) {
  const { sessionReady, loggedIn, role, user, logout, notifications } = usePrototype()
  const pathname = usePathname()
  const router = useRouter()
  const unreadCount = notifications.filter((n) => !n.read).length

  if (!sessionReady) {
    return (
      <div className="grid min-h-screen place-items-center px-4">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Logo />
          <p className="text-sm">Restoring your session…</p>
        </div>
      </div>
    )
  }

  if (!loggedIn || !user) {
    return (
      <div className="grid min-h-screen place-items-center px-4">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 text-center">
          <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="size-6" aria-hidden="true" />
          </div>
          <h1 className="font-display text-lg font-bold">Sign in to continue</h1>
          <p className="mt-1 text-sm text-muted-foreground text-pretty">
            Sign in with the email and password you registered. Your account is stored on the server, not in this browser.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <ButtonLink href="/demo">Open Amara&apos;s demo</ButtonLink>
            <ButtonLink href="/login" variant="outline">
              Log in
            </ButtonLink>
          </div>
        </div>
      </div>
    )
  }

  if (requiredRole && role !== requiredRole) {
    const back = role === "admin" ? "/admin" : role === "employer" ? "/employer" : "/dashboard"
    return (
      <div className="grid min-h-screen place-items-center px-4">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 text-center">
          <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive">
            <ShieldAlert className="size-6" aria-hidden="true" />
          </div>
          <h1 className="font-display text-lg font-bold">Restricted area</h1>
          <p className="mt-1 text-sm text-muted-foreground text-pretty">
            This section is only available to {requiredRole} accounts. You are signed in as {role}.
          </p>
          <div className="mt-6">
            <ButtonLink href={back}>Back to your dashboard</ButtonLink>
          </div>
        </div>
      </div>
    )
  }

  const nav = role === "admin" ? adminNav : role === "employer" ? employerNav : studentNav
  const footerNav = role === "admin" ? adminFooterNav : role === "employer" ? employerFooterNav : studentFooterNav
  const home = role === "admin" ? "/admin" : role === "employer" ? "/employer" : "/dashboard"
  const roots = ["/dashboard", "/employer", "/admin"]
  const isActive = (href: string) =>
    pathname === href || (!roots.includes(href) && pathname.startsWith(`${href}/`))

  const onLogout = () => {
    logout()
    router.push("/")
  }

  const linkClass = (active: boolean) =>
    cn(
      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
      active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
    )

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-sidebar md:flex">
        <div className="flex h-16 items-center border-b border-border px-5">
          <Link href={home}>
            <Logo />
          </Link>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {role === "admin" ? (
            <div className="mb-2 flex items-center gap-2 rounded-lg bg-accent/20 px-3 py-1.5 text-xs font-medium text-accent-foreground">
              <ShieldAlert className="size-3.5" aria-hidden="true" /> Admin console
            </div>
          ) : null}
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className={linkClass(isActive(item.href))}>
              <item.icon className="size-4" aria-hidden="true" />
              <span className="flex-1">{item.label}</span>
              {item.href === "/notifications" && unreadCount > 0 ? (
                <span className="grid min-w-5 place-items-center rounded-full bg-accent px-1.5 text-xs font-semibold text-accent-foreground">
                  {unreadCount}
                </span>
              ) : null}
            </Link>
          ))}
          {footerNav.length > 0 ? (
            <div className="mt-3 space-y-1 border-t border-border pt-3">
              {footerNav.map((item) => (
                <Link key={item.href} href={item.href} className={linkClass(isActive(item.href))}>
                  <item.icon className="size-4" aria-hidden="true" />
                  {item.label}
                </Link>
              ))}
            </div>
          ) : null}
        </nav>
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <Avatar name={user.name} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground capitalize">{role}</p>
            </div>
          </div>
          <Button variant="ghost" onClick={onLogout} className="mt-1 w-full justify-start text-muted-foreground">
            <LogOut className="size-4" aria-hidden="true" />
            Log out
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex h-14 items-center justify-between border-b border-border px-4 md:hidden">
          <Logo />
          <div className="flex items-center gap-2">
            <Avatar name={user.name} className="size-8" />
            <Button variant="ghost" size="icon-sm" onClick={onLogout} aria-label="Log out">
              <LogOut className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </header>
        {/* Mobile nav */}
        <nav className="flex gap-1 overflow-x-auto border-b border-border p-2 md:hidden">
          {[...nav, ...footerNav].map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium",
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                )}
              >
                <item.icon className="size-4" aria-hidden="true" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">{children}</main>
      </div>
    </div>
  )
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-border bg-card/40 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-balance">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground text-pretty">{description}</p>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  )
}
