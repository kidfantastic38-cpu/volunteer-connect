import type { ReactNode } from "react"
import { guardAppPage } from "@/lib/auth/page-guard"

export const dynamic = "force-dynamic"

export default async function NotificationsLayout({ children }: { children: ReactNode }) {
  await guardAppPage("/notifications")
  return children
}
