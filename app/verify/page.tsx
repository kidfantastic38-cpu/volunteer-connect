import { Suspense } from "react"
import { AuthShell } from "@/components/auth-shell"
import { allowDemoOtp } from "@/lib/runtime/env"
import { DEMO_EMAIL_CODE } from "@/lib/auth/otp"
import { VerifyForm } from "./verify-form"

export const dynamic = "force-dynamic"

export default function VerifyPage() {
  const showDemoCode = allowDemoOtp()

  return (
    <AuthShell>
      <p className="sr-only">
        If you did not receive a verification code, you can resend a new email from this page.
      </p>
      <Suspense fallback={<div className="text-sm text-muted-foreground">Loading verification form so you can resend a code…</div>}>
        <VerifyForm />
      </Suspense>
      {showDemoCode ? (
        <p className="mt-6 rounded-lg bg-muted px-3 py-2 text-center text-xs text-muted-foreground">
          Demo code: <span className="font-semibold tracking-widest text-foreground">{DEMO_EMAIL_CODE}</span>
        </p>
      ) : null}
    </AuthShell>
  )
}
