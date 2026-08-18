import type { ReactNode } from "react"
import { guardAppPage } from "@/lib/auth/page-guard"

export const dynamic = "force-dynamic"

export default async function ProfileLayout({ children }: { children: ReactNode }) {
  await guardAppPage("/profile", { roles: ["student"] })
  return children
}
