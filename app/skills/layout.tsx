import type { ReactNode } from "react"
import { guardAppPage } from "@/lib/auth/page-guard"

export const dynamic = "force-dynamic"

export default async function SkillsLayout({ children }: { children: ReactNode }) {
  await guardAppPage("/skills", { roles: ["student"] })
  return children
}
