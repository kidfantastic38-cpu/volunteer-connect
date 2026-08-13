"use client"

import Link from "next/link"
import { BadgeCheck, Bell, BriefcaseBusiness, CheckCheck, Sparkles, Star, Info } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { usePrototype, type NotificationKind } from "@/components/prototype-store"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui-bits"

const iconFor: Record<NotificationKind, React.ReactNode> = {
  match: <Sparkles className="size-4" aria-hidden="true" />,
  application: <BriefcaseBusiness className="size-4" aria-hidden="true" />,
  verification: <BadgeCheck className="size-4" aria-hidden="true" />,
  endorsement: <Star className="size-4" aria-hidden="true" />,
  system: <Info className="size-4" aria-hidden="true" />,
}

const toneFor: Record<NotificationKind, string> = {
  match: "bg-primary/10 text-primary",
  application: "bg-info/15 text-info",
  verification: "bg-success/15 text-success",
  endorsement: "bg-accent/25 text-accent-foreground",
  system: "bg-muted text-muted-foreground",
}

export default function NotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = usePrototype()
  const unread = notifications.filter((n) => !n.read).length

  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            {unread > 0 ? `${unread} unread update${unread === 1 ? "" : "s"}` : "You're all caught up"}
          </p>
        </div>
        {notifications.length > 0 && unread > 0 ? (
          <Button variant="outline" size="sm" onClick={markAllNotificationsRead}>
            <CheckCheck className="size-4" aria-hidden="true" /> Mark all as read
          </Button>
        ) : null}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="size-6" aria-hidden="true" />}
          title="No notifications yet"
          description="Matches, verifications and application updates will show up here."
        />
      ) : (
        <div className="mx-auto max-w-2xl divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {notifications.map((n) => {
            const body = (
              <div className="flex items-start gap-3 px-4 py-4">
                <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${toneFor[n.kind]}`}>
                  {iconFor[n.kind]}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-card-foreground">{n.title}</p>
                    {!n.read ? <span className="size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" /> : null}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground text-pretty">{n.body}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{n.time}</p>
                </div>
              </div>
            )
            const className = `block text-left transition-colors hover:bg-muted/50 ${n.read ? "" : "bg-primary/[0.03]"}`
            return n.href ? (
              <Link key={n.id} href={n.href} className={className} onClick={() => markNotificationRead(n.id)}>
                {body}
              </Link>
            ) : (
              <button key={n.id} className={`w-full ${className}`} onClick={() => markNotificationRead(n.id)}>
                {body}
              </button>
            )
          })}
        </div>
      )}
    </AppShell>
  )
}
