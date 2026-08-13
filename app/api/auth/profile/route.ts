import { NextResponse } from "next/server"
import { saveProfileSnapshot } from "@/lib/auth/db"
import { readSession } from "@/lib/auth/session"
import type { ProfileSnapshot } from "@/lib/auth/types"

export const runtime = "nodejs"

export async function PUT(req: Request) {
  const session = await readSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let body: { snapshot?: ProfileSnapshot }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }
  if (!body.snapshot) return NextResponse.json({ error: "Missing snapshot." }, { status: 400 })

  saveProfileSnapshot(session.sub, body.snapshot)
  return NextResponse.json({ ok: true })
}
