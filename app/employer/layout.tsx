import type { ReactNode } from "react"
import { guardAppPage } from "@/lib/auth/page-guard"

export const dynamic = "force-dynamic"

export default async function EmployerLayout({ children }: { children: ReactNode }) {
  await guardAppPage("/employer", { roles: ["employer"] })
  return children
}
