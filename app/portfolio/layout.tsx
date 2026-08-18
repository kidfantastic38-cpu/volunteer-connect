import type { ReactNode } from "react"
import { guardAppPage } from "@/lib/auth/page-guard"

export const dynamic = "force-dynamic"

export default async function PortfolioLayout({ children }: { children: ReactNode }) {
  await guardAppPage("/portfolio", { roles: ["student"] })
  return children
}
