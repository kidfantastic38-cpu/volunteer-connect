"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Logo } from "@/components/logo"
import { usePrototype } from "@/components/prototype-store"
import { apiLogin } from "@/lib/auth/client"

export default function DemoLaunchPage() {
  const router = useRouter()
  const { restoreAccount, sessionReady, loggedIn, role } = usePrototype()
  const [error, setError] = useState("")

  useEffect(() => {
    if (!sessionReady) return
    if (loggedIn && role === "student") {
      router.replace("/dashboard")
      return
    }
    void apiLogin({ email: "amara@example.com", password: "password" })
      .then((payload) => {
        restoreAccount(payload)
        router.replace("/dashboard")
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Could not open the demo.")
      })
  }, [sessionReady, loggedIn, role, restoreAccount, router])

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <Logo />
        <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-primary" aria-hidden="true" />
          Opening Amara&apos;s demo profile…
        </p>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    </div>
  )
}
