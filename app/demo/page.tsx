import { redirect } from "next/navigation"

/** Demo student auto-login is removed. Old /demo links go to the normal login page. */
export default function DemoLaunchPage() {
  redirect("/login")
}
