"use client"

import { useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  BarChart3,
  Bell,
  Briefcase,
  Compass,
  FileText,
  Building2,
  FolderTree,
  Gauge,
  HelpCircle,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Share2,
  ShieldAlert,
  ShieldCheck,
  ListChecks,
  Upload,
  User,
  UserCheck,
  Users,
  X,
} from "lucide-react"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { ButtonLink } from "@/components/button-link"
import { ThemeToggle } from "@/components/theme-toggle"
import { usePrototype } from "@/components/prototype-store"
import { cn } from "@/lib/utils"

const publicHome = { href: "/", label: "Home", icon: Home }

const studentNav = [
  publicHome,
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/skills", label: "Skills", icon: ListChecks },
  { href: "/cv", label: "CV", icon: FileText },
  { href: "/portfolio", label: "Public page", icon: Share2 },
  { href: "/opportunities", label: "Opportunities", icon: Compass },
  { href: "/applications", label: "Applications", icon: Briefcase },
  { href: "/notifications", label: "Notifications", icon: Bell },
]

const studentFooterNav = [
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/help", label: "Help & support", icon: HelpCircle },
]

const employerNav = [
  publicHome,
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
  publicHome,
  { href: "/admin/dashboard", label: "Overview", icon: Gauge },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/employers", label: "Employers", icon: Building2 },
  { href: "/admin/verifications", label: "Employer Verification", icon: UserCheck },
  { href: "/admin/opportunities", label: "Opportunities", icon: Briefcase },
  { href: "/admin/applications", label: "Applications", icon: FileText },
  { href: "/admin/skills", label: "Skills", icon: FolderTree },
  { href: "/admin/skills/verifications", label: "Skill Verification", icon: ShieldCheck },
  { href: "/admin/uploads", label: "Uploads / Evidence", icon: Upload },
  { href: "/admin/portfolios", label: "Portfolios", icon: Share2 },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/settings", label: "Settings", icon: Settings },
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
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPath, setMenuPath] = useState(pathname)
  if (menuPath !== pathname) {
    setMenuPath(pathname)
    setMenuOpen(false)
  }

  useEffect(() => {
    if (!menuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [menuOpen])

  if (!sessionReady) {
    return (
      <div className="grid min-h-screen place-items-center px-4">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Link href="/" aria-label="Volunteer Connect home">
            <Logo />
          </Link>
          <p className="text-sm">Restoring your session…</p>
        </div>
      </div>
    )
  }

  if (!loggedIn || !user) {
    return (
      <div className="grid min-h-screen place-items-center px-4">
        <div className="w-full max-w-sm border border-border bg-card p-8 text-center">
          <div className="mb-4 flex justify-center">
            <Logo showText={false} />
          </div>
          <h1 className="font-display text-lg font-semibold">Log in to continue</h1>
          <p className="mt-1 text-sm text-muted-foreground text-pretty">
            Use the email and password you registered with.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <ButtonLink href="/login">Log in</ButtonLink>
            <ButtonLink href="/register" variant="outline">
              Create an account
            </ButtonLink>
            <ButtonLink href="/" variant="ghost">
              Home
            </ButtonLink>
          </div>
        </div>
      </div>
    )
  }

  if (requiredRole && role !== requiredRole) {
    const back = role === "admin" ? "/admin/dashboard" : role === "employer" ? "/employer" : "/dashboard"
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
  const roots = ["/", "/dashboard", "/employer", "/admin", "/admin/dashboard"]
  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    if (pathname === href) return true
    if (roots.includes(href)) return false
    const nestedMatch = nav.some(
      (item) =>
        item.href !== href &&
        item.href.startsWith(`${href}/`) &&
        (pathname === item.href || pathname.startsWith(`${item.href}/`)),
    )
    return !nestedMatch && pathname.startsWith(`${href}/`)
  }

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
        <div className="flex h-16 items-center justify-between gap-2 border-b border-border px-3">
          <Link href="/" className="min-w-0" aria-label="Volunteer Connect home">
            <Logo />
          </Link>
          <ThemeToggle />
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {role === "admin" ? (
            <div className="mb-2 flex items-center gap-2 rounded-sm bg-muted px-3 py-1.5 text-xs font-medium text-foreground">
              <ShieldAlert className="size-3.5" aria-hidden="true" /> Admin
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
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-2 border-b border-border bg-background/95 px-3 backdrop-blur-sm md:hidden">
          <Link href="/" aria-label="Volunteer Connect home" className="min-w-0">
            <Logo />
          </Link>
          <div className="flex shrink-0 items-center gap-1">
            <ThemeToggle />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-expanded={menuOpen}
              aria-controls="app-mobile-nav"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
            </Button>
          </div>
        </header>
        {menuOpen ? (
          <div className="fixed inset-0 top-14 z-30 md:hidden" id="app-mobile-nav">
            <button
              type="button"
              className="absolute inset-0 bg-foreground/40"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
            />
            <nav className="relative flex max-h-[calc(100dvh-3.5rem)] flex-col overflow-y-auto border-b border-border bg-background pb-[env(safe-area-inset-bottom)]">
              {role === "admin" ? (
                <p className="mx-3 mt-3 inline-flex items-center gap-2 rounded-sm bg-muted px-3 py-2 text-xs font-medium text-foreground">
                  <ShieldAlert className="size-3.5" aria-hidden="true" /> Admin
                </p>
              ) : null}
              <div className="space-y-1 p-3">
                {[...nav, ...footerNav].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(linkClass(isActive(item.href)), "min-h-11")}
                  >
                    <item.icon className="size-4" aria-hidden="true" />
                    <span className="flex-1">{item.label}</span>
                    {item.href === "/notifications" && unreadCount > 0 ? (
                      <span className="grid min-w-5 place-items-center rounded-full bg-accent px-1.5 text-xs font-semibold text-accent-foreground">
                        {unreadCount}
                      </span>
                    ) : null}
                  </Link>
                ))}
              </div>
              <div className="mt-auto border-t border-border p-3">
                <div className="mb-2 flex items-center gap-3 px-2 py-2">
                  <Avatar name={user.name} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground capitalize">{role}</p>
                  </div>
                </div>
                <Button variant="ghost" onClick={onLogout} className="w-full justify-start text-muted-foreground">
                  <LogOut className="size-4" aria-hidden="true" />
                  Log out
                </Button>
              </div>
            </nav>
          </div>
        ) : null}
        <main className="flex-1 px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-8 sm:py-8">{children}</main>
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
