import { Suspense } from "react"
import { AuthShell } from "@/components/auth-shell"
import { VerifyForm } from "./verify-form"

export const dynamic = "force-dynamic"

export default function VerifyPage() {
  return (
    <AuthShell>
      <p className="sr-only">
        If you did not receive a verification code, you can resend a new email from this page.
      </p>
      <Suspense fallback={<div className="text-sm text-muted-foreground">Loading verification form so you can resend a code…</div>}>
        <VerifyForm />
      </Suspense>
    </AuthShell>
  )
}
