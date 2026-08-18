import { redirect } from "next/navigation"

/** Demo admin auto-login is removed. Old /demo/admin links go to the normal login page. */
export default function DemoAdminPage() {
  redirect("/login")
}
