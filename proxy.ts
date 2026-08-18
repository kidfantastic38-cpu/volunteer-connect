import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { findUserById, getSessionVersion } from "@/lib/auth/db"
import { decodeSession, SESSION_COOKIE } from "@/lib/auth/session"
import type { AuthRole } from "@/lib/auth/types"

const STUDENT_PREFIXES = [
  "/dashboard",
  "/profile",
  "/cv",
  "/portfolio",
  "/applications",
  "/onboarding",
  "/skills",
  "/opportunities",
]

type LiveAccount = { role: AuthRole; emailVerified: boolean }

async function liveAccount(token: string | undefined): Promise<LiveAccount | null> {
  const session = decodeSession(token)
  if (!session) return null
  const user = await findUserById(session.sub)
  if (!user) return null
  const version = await getSessionVersion(user.id)
  if (version === null || (session.sv ?? 1) !== version) return null
  return { role: user.role, emailVerified: Boolean(user.emailVerified) }
}

function isDevOnlyGallery(pathname: string) {
  return (
    pathname === "/design-system" ||
    pathname.startsWith("/design-system/") ||
    pathname === "/components" ||
    pathname.startsWith("/components/")
  )
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === "/demo" || pathname.startsWith("/demo/")) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (process.env.NODE_ENV === "production" && isDevOnlyGallery(pathname)) {
    return NextResponse.rewrite(new URL("/_not-found", request.url))
  }

  let account: LiveAccount | null = null
  try {
    account = await liveAccount(request.cookies.get(SESSION_COOKIE)?.value)
  } catch {
    account = null
  }
  const role = account?.role ?? null

  const needsAuth =
    pathname.startsWith("/employer") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/notifications") ||
    STUDENT_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))

  if (needsAuth && !role) {
    const login = new URL("/login", request.url)
    login.searchParams.set("next", pathname)
    return NextResponse.redirect(login)
  }

  if (!role) return NextResponse.next()

  if (needsAuth && account && !account.emailVerified) {
    const verify = new URL("/verify", request.url)
    verify.searchParams.set("next", pathname)
    return NextResponse.redirect(verify)
  }

  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL(homeFor(role), request.url))
  }

  if (pathname.startsWith("/employer") && role !== "employer") {
    return NextResponse.redirect(new URL(homeFor(role), request.url))
  }

  if (STUDENT_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    if (role === "employer") return NextResponse.redirect(new URL("/employer", request.url))
    if (role === "admin") return NextResponse.redirect(new URL("/admin/dashboard", request.url))
  }

  return NextResponse.next()
}

function homeFor(role: string) {
  if (role === "admin") return "/admin/dashboard"
  if (role === "employer") return "/employer"
  return "/dashboard"
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/profile",
    "/profile/:path*",
    "/cv",
    "/cv/:path*",
    "/portfolio",
    "/portfolio/:path*",
    "/applications",
    "/applications/:path*",
    "/onboarding",
    "/onboarding/:path*",
    "/skills",
    "/skills/:path*",
    "/opportunities",
    "/opportunities/:path*",
    "/notifications",
    "/notifications/:path*",
    "/settings",
    "/settings/:path*",
    "/employer",
    "/employer/:path*",
    "/admin",
    "/admin/:path*",
    "/demo",
    "/demo/:path*",
    "/design-system",
    "/design-system/:path*",
    "/components",
    "/components/:path*",
  ],
}
