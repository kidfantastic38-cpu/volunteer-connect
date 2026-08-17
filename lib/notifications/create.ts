import { randomUUID } from "node:crypto"
import { getDb } from "@/lib/db/client"
import { notifications } from "@/lib/db/schema"

export async function createNotification(input: {
  userId: string
  type: string
  title: string
  message: string
  href?: string
}) {
  try {
    await getDb().insert(notifications).values({
      id: randomUUID(),
      userId: input.userId,
      type: input.type,
      title: input.title.slice(0, 160),
      message: input.message.slice(0, 500),
      read: false,
      href: input.href ?? null,
      createdAt: new Date().toISOString(),
    })
  } catch {
    /* Notifications must not block apply/status updates. */
  }
}
