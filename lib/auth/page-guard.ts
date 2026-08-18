import { redirect } from "next/navigation"
import { findUserById } from "@/lib/auth/db"
import { readSession } from "@/lib/auth/session"
import type { AuthRole } from "@/lib/auth/types"

function homeFor(role: AuthRole) {
  if (role === "admin") return "/admin/dashboard"
  if (role === "employer") return "/employer"
  return "/dashboard"
}

export async function guardAppPage(pathname: string, options?: { roles?: AuthRole[] }) {
  const session = await readSession()
  if (!session) {
    redirect(`/login?next=${encodeURIComponent(pathname)}`)
  }
  const user = await findUserById(session.sub)
  if (!user || (user.status && user.status !== "active")) {
    redirect("/login")
  }
  if (!user.emailVerified) {
    redirect(`/verify?next=${encodeURIComponent(pathname)}`)
  }
  if (options?.roles && !options.roles.includes(user.role)) {
    redirect(homeFor(user.role))
  }
  return user
}

