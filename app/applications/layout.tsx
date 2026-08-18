import type { ReactNode } from "react"
import { guardAppPage } from "@/lib/auth/page-guard"

export const dynamic = "force-dynamic"

export default async function ApplicationsLayout({ children }: { children: ReactNode }) {
  await guardAppPage("/applications", { roles: ["student"] })
  return children
}
