import { notFound } from "next/navigation"

/** Internal galleries stay available in `next dev` only. */
export function assertDevOnlyRoute() {
  if (process.env.NODE_ENV === "production") notFound()
}
