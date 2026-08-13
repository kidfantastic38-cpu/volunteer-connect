import type { AuthRole, AuthUser, ProfileSnapshot } from "@/lib/auth/types"

export type AuthResponse = {
  user: AuthUser
  snapshot: ProfileSnapshot | null
}

const fetchAuth: typeof fetch = (input, init) =>
  fetch(input, { credentials: "include", cache: "no-store", ...init })

async function parseError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string }
    return data.error || "Something went wrong."
  } catch {
    return "Something went wrong."
  }
}

export async function apiRegister(input: {
  name: string
  email: string
  password: string
  role: AuthRole
}): Promise<AuthResponse> {
  const res = await fetchAuth("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function apiLogin(input: { email: string; password: string }): Promise<AuthResponse> {
  const res = await fetchAuth("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function apiLogout() {
  await fetchAuth("/api/auth/logout", { method: "POST" })
}

export async function apiMe(): Promise<AuthResponse | null> {
  const res = await fetchAuth("/api/auth/me")
  if (res.status === 401) return null
  if (!res.ok) return null
  return res.json()
}

export async function apiSaveProfile(snapshot: ProfileSnapshot) {
  await fetchAuth("/api/auth/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ snapshot }),
  })
}

export async function apiChangePassword(input: { current: string; next: string }) {
  const res = await fetchAuth("/api/auth/password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error(await parseError(res))
}
