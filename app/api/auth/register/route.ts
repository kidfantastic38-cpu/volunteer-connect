import { NextResponse } from "next/server"
import { createUser, findUserByEmail } from "@/lib/auth/db"
import { isValidEmail, normalizeEmail } from "@/lib/auth/normalize"
import { setSessionCookie } from "@/lib/auth/session"
import type { AuthRole } from "@/lib/auth/types"

export const runtime = "nodejs"

export async function POST(req: Request) {
  let body: { name?: string; email?: string; password?: string; role?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }

  const name = (body.name ?? "").trim()
  const email = normalizeEmail(body.email ?? "")
  const password = body.password ?? ""
  const role: AuthRole = body.role === "employer" ? "employer" : "student"

  if (!name) return NextResponse.json({ error: "Please enter your name." }, { status: 400 })
  if (!email) return NextResponse.json({ error: "Email is required." }, { status: 400 })
  if (!isValidEmail(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 })
  if (password.length < 6) {
    return NextResponse.json({ error: "Use at least 6 characters." }, { status: 400 })
  }
  if (findUserByEmail(email)) {
    return NextResponse.json({ error: "This email is already registered. Try logging in instead." }, { status: 409 })
  }

  const { user, snapshot } = createUser({ name, email, password, role })
  await setSessionCookie(user)
  return NextResponse.json({ user, snapshot })
}
