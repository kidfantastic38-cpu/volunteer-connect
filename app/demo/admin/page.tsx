import { redirect } from "next/navigation"

/** Demo admin auto-login is development-only via the login page. Never auto-authenticate here. */
export default function DemoAdminPage() {
  redirect("/login")
}
