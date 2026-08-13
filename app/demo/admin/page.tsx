"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Logo } from "@/components/logo"
import { usePrototype } from "@/components/prototype-store"
import { apiLogin } from "@/lib/auth/client"

export default function DemoAdminLaunchPage() {
  const router = useRouter()
  const { restoreAccount, sessionReady, loggedIn, role } = usePrototype()
  const [error, setError] = useState("")

  useEffect(() => {
    if (!sessionReady) return
    if (loggedIn && role === "admin") {
      router.replace("/admin")
      return
    }
    void apiLogin({ email: "admin@volunteerconnect.org", password: "password" })
      .then((payload) => {
        restoreAccount(payload)
        router.replace("/admin")
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Could not open the admin console.")
      })
  }, [sessionReady, loggedIn, role, restoreAccount, router])

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <Logo />
        <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-primary" aria-hidden="true" />
          Opening the admin console…
        </p>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    </div>
  )
}
