import type { ReactNode } from "react"
import { guardAppPage } from "@/lib/auth/page-guard"

export const dynamic = "force-dynamic"

export default async function OnboardingLayout({ children }: { children: ReactNode }) {
  await guardAppPage("/onboarding", { roles: ["student"] })
  return children
}
