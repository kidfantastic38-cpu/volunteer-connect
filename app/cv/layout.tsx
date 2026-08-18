import type { ReactNode } from "react"
import { guardAppPage } from "@/lib/auth/page-guard"

export const dynamic = "force-dynamic"

export default async function CvLayout({ children }: { children: ReactNode }) {
  await guardAppPage("/cv", { roles: ["student"] })
  return children
}
