import type { ReactNode } from "react"
import { guardAppPage } from "@/lib/auth/page-guard"

export const dynamic = "force-dynamic"

export default async function SettingsLayout({ children }: { children: ReactNode }) {
  await guardAppPage("/settings")
  return children
}
