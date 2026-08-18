import type { ReactNode } from "react"
import { guardAppPage } from "@/lib/auth/page-guard"

export const dynamic = "force-dynamic"

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await guardAppPage("/admin/dashboard", { roles: ["admin"] })
  return children
}
