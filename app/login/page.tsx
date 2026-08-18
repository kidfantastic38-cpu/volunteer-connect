"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { AuthShell } from "@/components/auth-shell"
import { Field, Input } from "@/components/form-controls"
import { Button } from "@/components/ui/button"
import { PasswordInput } from "@/components/ui/password-input"
import { usePrototype } from "@/components/prototype-store"
import { apiLogin } from "@/lib/auth/client"
import { normalizeEmail } from "@/lib/auth/normalize"

export default function LoginPage() {
  const router = useRouter()
  const { restoreAccount } = usePrototype()

  useEffect(() => {
    router.prefetch("/dashboard")
    router.prefetch("/admin/dashboard")
  }, [router])
  const [form, setForm] = useState({ email: "", password: "" })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const onSubmit = (ev: React.FormEvent) => {
    ev.preventDefault()
    setFormError("")
    const e: Record<string, string> = {}
    if (!normalizeEmail(form.email)) e.email = "Email is required."
    if (!form.password) e.password = "Password is required."
    setErrors(e)
    if (Object.keys(e).length > 0) return

    signIn(normalizeEmail(form.email), form.password)
  }

  const signIn = (email: string, password: string) => {
    setFormError("")
    setSubmitting(true)
    void apiLogin({ email, password })
      .then((payload) => {
        restoreAccount(payload)
        const home = payload.user.role === "admin" ? "/admin/dashboard" : payload.user.role === "employer" ? "/employer" : "/dashboard"
        if (!payload.emailVerified) {
          router.push(`/verify?next=${encodeURIComponent(home)}`)
          return
        }
        router.push(home)
      })
      .catch((err: unknown) => {
        setFormError(err instanceof Error ? err.message : "We couldn't find an account with those details.")
        setSubmitting(false)
      })
  }

  return (
    <AuthShell>
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Log in</h1>
        <p className="mt-1 text-sm text-muted-foreground">Use the email and password you registered with.</p>

        <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
          {formError && (
            <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {formError}
            </div>
          )}
          <Field label="Email" htmlFor="email" error={errors.email}>
            <Input id="email" type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" autoComplete="email" />
          </Field>
          <Field label="Password" htmlFor="password" error={errors.password}>
            <PasswordInput id="password" name="password" value={form.password} onChange={set("password")} placeholder="••••••••" autoComplete="current-password" />
          </Field>
          <Button type="submit" disabled={submitting} className="h-11 w-full text-sm">
            {submitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {submitting ? "Logging in…" : "Log in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}
