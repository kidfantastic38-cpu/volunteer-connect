"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle2, Loader2, MailCheck, RefreshCw } from "lucide-react"
import { AuthShell } from "@/components/auth-shell"
import { Button } from "@/components/ui/button"
import { usePrototype } from "@/components/prototype-store"
import { apiSendVerifyEmail } from "@/lib/auth/client"
import { cn } from "@/lib/utils"

const DEMO_CODE = "481920"

function VerifyForm() {
  const router = useRouter()
  const params = useSearchParams()
  const { user, verifyAccount, role } = usePrototype()
  const next = params.get("next") || (role === "employer" ? "/employer" : "/onboarding")

  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""])
  const [error, setError] = useState("")
  const [status, setStatus] = useState<"idle" | "checking" | "done">("idle")
  const [resent, setResent] = useState(false)
  const [seconds, setSeconds] = useState(30)
  const inputs = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    if (seconds <= 0) return
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [seconds])

  const setDigit = (i: number, v: string) => {
    const clean = v.replace(/\D/g, "").slice(-1)
    setError("")
    setDigits((d) => {
      const copy = [...d]
      copy[i] = clean
      return copy
    })
    if (clean && i < 5) inputs.current[i + 1]?.focus()
  }

  const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) inputs.current[i - 1]?.focus()
  }

  const onPaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    if (!text) return
    e.preventDefault()
    const arr = text.split("")
    setDigits(["", "", "", "", "", ""].map((_, i) => arr[i] ?? ""))
    inputs.current[Math.min(text.length, 5)]?.focus()
  }

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault()
    const code = digits.join("")
    if (code.length < 6) {
      setError("Enter all six digits.")
      return
    }
    setStatus("checking")
    void verifyAccount(code)
      .then(() => {
        setStatus("done")
        setTimeout(() => router.push(next), 1100)
      })
      .catch((err: unknown) => {
        setStatus("idle")
        setError(err instanceof Error ? err.message : "Could not verify your email.")
      })
  }

  const resend = () => {
    setResent(true)
    setSeconds(30)
    void apiSendVerifyEmail().catch(() => {
      setError("Could not resend a code right now.")
    })
    setTimeout(() => setResent(false), 2500)
  }

  if (status === "done") {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="size-7" aria-hidden="true" />
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Email Verified</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {role === "employer"
            ? "Your email is confirmed. An admin still needs to approve your organization before you can post opportunities."
            : "Taking you to the next step…"}
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
        <MailCheck className="size-6" aria-hidden="true" />
      </div>
      <h1 className="font-display text-2xl font-bold tracking-tight">Verify your email</h1>
      <p className="mt-1 text-sm text-muted-foreground text-pretty">
        We sent a 6-digit code to{" "}
        <span className="font-medium text-foreground">{user?.email || "your email"}</span>. Enter it below to activate
        your account.
      </p>

      <form onSubmit={submit} className="mt-6">
        <div className="flex justify-between gap-2" onPaste={onPaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                inputs.current[i] = el
              }}
              value={d}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => onKeyDown(i, e)}
              inputMode="numeric"
              autoComplete={i === 0 ? "one-time-code" : "off"}
              aria-label={`Digit ${i + 1}`}
              className={cn(
                "h-14 w-full rounded-xl border bg-background text-center font-display text-2xl font-semibold text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30",
                error ? "border-destructive" : "border-input",
              )}
            />
          ))}
        </div>
        {error && <p className="mt-2 text-xs font-medium text-destructive">{error}</p>}

        <Button type="submit" disabled={status === "checking"} className="mt-5 h-11 w-full text-sm">
          {status === "checking" && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {status === "checking" ? "Verifying…" : "Verify account"}
        </Button>
      </form>

      <div className="mt-4 flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={resend}
          disabled={seconds > 0}
          className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
        >
          <RefreshCw className="size-3.5" aria-hidden="true" />
          {resent ? "Code resent" : seconds > 0 ? `Resend in ${seconds}s` : "Resend code"}
        </button>
        <button
          type="button"
          onClick={() => router.push(next)}
          className="text-muted-foreground hover:text-foreground hover:underline"
        >
          Skip for now
        </button>
      </div>

      {process.env.NODE_ENV !== "production" ? (
        <p className="mt-6 rounded-lg bg-muted px-3 py-2 text-center text-xs text-muted-foreground">
          Demo code: <span className="font-semibold tracking-widest text-foreground">{DEMO_CODE}</span>
        </p>
      ) : null}
    </div>
  )
}

export default function VerifyPage() {
  return (
    <AuthShell>
      <Suspense fallback={<div className="text-sm text-muted-foreground">Loading…</div>}>
        <VerifyForm />
      </Suspense>
    </AuthShell>
  )
}
