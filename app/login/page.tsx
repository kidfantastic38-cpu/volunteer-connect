"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2, ShieldAlert, Sparkles } from "lucide-react"
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
        router.push(payload.user.role === "admin" ? "/admin/dashboard" : payload.user.role === "employer" ? "/employer" : "/dashboard")
      })
      .catch((err: unknown) => {
        setFormError(err instanceof Error ? err.message : "We couldn't find an account with those details.")
        setSubmitting(false)
      })
  }

  const useDemo = () => signIn("amara@example.com", "password")
  const showDemoAdmin = process.env.NODE_ENV === "development"

  return (
    <AuthShell>
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Log in with the email and password you registered. Demo account:{" "}
          <span className="font-medium text-foreground">amara@example.com</span> /{" "}
          <span className="font-medium text-foreground">password</span>
        </p>

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

        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
        </div>

        <div className="space-y-2">
          <Button type="button" variant="outline" onClick={useDemo} disabled={submitting} className="h-11 w-full text-sm">
            <Sparkles className="size-4" aria-hidden="true" />
            Explore the demo profile (Amara)
          </Button>
          {showDemoAdmin ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => signIn("admin@volunteerconnect.org", "password")}
              disabled={submitting}
              className="h-11 w-full text-sm"
            >
              <ShieldAlert className="size-4" aria-hidden="true" />
              Enter the admin console
            </Button>
          ) : null}
        </div>

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
