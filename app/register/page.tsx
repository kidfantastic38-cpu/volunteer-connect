"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { AlertCircle, Briefcase, GraduationCap, Loader2 } from "lucide-react"
import { AuthShell } from "@/components/auth-shell"
import { Field, Input } from "@/components/form-controls"
import { Button } from "@/components/ui/button"
import { PasswordInput } from "@/components/ui/password-input"
import { usePrototype, type Role } from "@/components/prototype-store"
import { apiRegister } from "@/lib/auth/client"
import { normalizeEmail } from "@/lib/auth/normalize"
import { cn } from "@/lib/utils"

function RegisterForm() {
  const router = useRouter()
  const params = useSearchParams()
  const { restoreAccount } = usePrototype()

  const [role, setRole] = useState<Role>(params.get("role") === "employer" ? "employer" : "student")
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = "Please enter your name."
    const email = normalizeEmail(form.email)
    if (!email) e.email = "Email is required."
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email address."
    else if (email === "amara@example.com" || email === "admin@volunteerconnect.org")
      e.email = "This email is already registered. Try logging in instead."
    if (!form.password) e.password = "Choose a password."
    else if (form.password.length < 6) e.password = "Use at least 6 characters."
    if (form.confirm !== form.password) e.confirm = "Passwords do not match."
    return e
  }

  const onSubmit = (ev: React.FormEvent) => {
    ev.preventDefault()
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length > 0) return
    setSubmitting(true)
    void apiRegister({ name: form.name.trim(), email: normalizeEmail(form.email), password: form.password, role })
      .then((payload) => {
        restoreAccount(payload)
        const next = payload.user.role === "employer" ? "/employer" : "/onboarding"
        router.push(`/verify?next=${encodeURIComponent(next)}`)
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : "Could not create account."
        if (/already registered/i.test(message)) setErrors({ email: message })
        else setErrors({ email: message })
        setSubmitting(false)
      })
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight">Create your account</h1>
      <p className="mt-1 text-sm text-muted-foreground">Start turning your experience into opportunity.</p>

      <div className="mt-6">
        <p className="mb-2 text-sm font-medium">I am a…</p>
        <div className="grid grid-cols-2 gap-3">
          <RoleCard
            active={role === "student"}
            onClick={() => setRole("student")}
            icon={<GraduationCap className="size-5" aria-hidden="true" />}
            title="Student"
            subtitle="Build my profile"
          />
          <RoleCard
            active={role === "employer"}
            onClick={() => setRole("employer")}
            icon={<Briefcase className="size-5" aria-hidden="true" />}
            title="Employer"
            subtitle="Post opportunities"
          />
        </div>
      </div>

      <form onSubmit={onSubmit} noValidate className="mt-5 space-y-4">
        <Field label={role === "employer" ? "Organization / your name" : "Full name"} htmlFor="name" error={errors.name}>
          <Input id="name" value={form.name} onChange={set("name")} placeholder="Amara Okafor" autoComplete="name" />
        </Field>
        <Field label="Email" htmlFor="email" error={errors.email}>
          <Input id="email" type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" autoComplete="email" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Password" htmlFor="password" error={errors.password}>
            <PasswordInput id="password" name="password" value={form.password} onChange={set("password")} placeholder="••••••••" autoComplete="new-password" />
          </Field>
          <Field label="Confirm" htmlFor="confirm" error={errors.confirm}>
            <PasswordInput id="confirm" name="confirm" value={form.confirm} onChange={set("confirm")} placeholder="••••••••" autoComplete="new-password" />
          </Field>
        </div>

        <Button type="submit" disabled={submitting} className="h-11 w-full text-sm">
          {submitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {submitting ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-5 flex items-start gap-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
        <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        Tip: try <span className="font-medium text-foreground">amara@example.com</span> to see the &quot;already
        registered&quot; error path.
      </p>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </div>
  )
}

function RoleCard({
  active,
  onClick,
  icon,
  title,
  subtitle,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  title: string
  subtitle: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-colors",
        active ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:bg-muted",
      )}
    >
      <span className={cn("grid size-9 place-items-center rounded-lg", active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
        {icon}
      </span>
      <span className="mt-1 text-sm font-semibold text-foreground">{title}</span>
      <span className="text-xs text-muted-foreground">{subtitle}</span>
    </button>
  )
}

export default function RegisterPage() {
  return (
    <AuthShell>
      <Suspense fallback={<div className="text-sm text-muted-foreground">Loading…</div>}>
        <RegisterForm />
      </Suspense>
    </AuthShell>
  )
}
