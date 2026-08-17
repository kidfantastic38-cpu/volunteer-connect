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

async function liveRole(token: string | undefined): Promise<AuthRole | null> {
  const session = decodeSession(token)
  if (!session) return null
  const user = await findUserById(session.sub)
  if (!user) return null
  const version = await getSessionVersion(user.id)
  if (version === null || (session.sv ?? 1) !== version) return null
  return user.role
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const role = await liveRole(request.cookies.get(SESSION_COOKIE)?.value)

  const needsAuth =
    pathname.startsWith("/employer") ||
    pathname.startsWith("/admin") ||
    STUDENT_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))

  if (needsAuth && !role) {
    const login = new URL("/login", request.url)
    login.searchParams.set("next", pathname)
    return NextResponse.redirect(login)
  }

  if (!role) return NextResponse.next()

  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL(homeFor(role), request.url))
  }

  if (pathname.startsWith("/employer") && role !== "employer") {
    return NextResponse.redirect(new URL(homeFor(role), request.url))
  }

  if (STUDENT_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    if (role === "employer") return NextResponse.redirect(new URL("/employer", request.url))
    if (role === "admin") return NextResponse.redirect(new URL("/admin", request.url))
  }

  return NextResponse.next()
}

function homeFor(role: string) {
  if (role === "admin") return "/admin"
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
    "/employer",
    "/employer/:path*",
    "/admin",
    "/admin/:path*",
  ],
}
