import type { ReactNode } from "react"
import { guardAppPage } from "@/lib/auth/page-guard"

export const dynamic = "force-dynamic"

export default async function OpportunitiesLayout({ children }: { children: ReactNode }) {
  await guardAppPage("/opportunities", { roles: ["student"] })
  return children
}
