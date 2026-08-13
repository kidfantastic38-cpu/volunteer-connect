import { NextResponse } from "next/server"
import { findUserById, findUserByEmail, updateUserPassword } from "@/lib/auth/db"
import { verifyPassword } from "@/lib/auth/password"
import { readSession } from "@/lib/auth/session"

export const runtime = "nodejs"

export async function POST(req: Request) {
  const session = await readSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let body: { current?: string; next?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }

  const current = body.current ?? ""
  const next = body.next ?? ""
  if (next.length < 6) {
    return NextResponse.json({ error: "New password must be at least 6 characters." }, { status: 400 })
  }

  const user = findUserById(session.sub)
  const withHash = user ? findUserByEmail(user.email) : null
  if (!withHash || !verifyPassword(current, withHash.passwordHash)) {
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 })
  }

  updateUserPassword(session.sub, next)
  return NextResponse.json({ ok: true })
}
