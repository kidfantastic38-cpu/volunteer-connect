"use client"

import { useEffect, useState } from "react"
import { Bell } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { AdminError, AdminHeader, AdminLoading } from "@/components/admin-ui"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui-bits"
import { adminApi, type AdminNoticeRow } from "@/lib/admin/client"

export default function AdminNotificationsPage() {
  const [rows, setRows] = useState<AdminNoticeRow[]>([])
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [audience, setAudience] = useState<"all" | "student" | "employer">("all")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  const load = () => {
    void adminApi
      .notifications()
      .then((data) => setRows(data.notifications))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load announcements."))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <AppShell requiredRole="admin">
      <AdminHeader title="Notifications" description="Create platform announcements that are stored in the existing notifications table." />
      <AdminError message={error} />
      {success ? <p className="mb-4 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm">{success}</p> : null}
      <form
        className="mb-6 space-y-3 rounded-2xl border border-border bg-card p-4"
        onSubmit={(e) => {
          e.preventDefault()
          setSending(true)
          setError("")
          setSuccess("")
          void adminApi
            .announce({ title, message, audience })
            .then((res) => {
              setTitle("")
              setMessage("")
              setSuccess(`Sent to ${res.sent} recipient${res.sent === 1 ? "" : "s"}.`)
              load()
            })
            .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not send."))
            .finally(() => setSending(false))
        }}
      >
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title (maintenance, news, reminders)" className="w-full rounded-xl border border-input px-3 py-2 text-sm" />
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message" rows={4} className="w-full rounded-xl border border-input px-3 py-2 text-sm" />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <select value={audience} onChange={(e) => setAudience(e.target.value as "all" | "student" | "employer")} className="rounded-xl border border-input px-3 py-2 text-sm">
            <option value="all">Everyone</option>
            <option value="student">Students</option>
            <option value="employer">Employers</option>
          </select>
          <Button type="submit" disabled={sending || !title.trim() || !message.trim()}>
            Send announcement
          </Button>
        </div>
      </form>
      {loading ? (
        <AdminLoading />
      ) : rows.length === 0 ? (
        <EmptyState icon={<Bell className="size-6" />} title="No announcements yet" description="Sent broadcasts will appear here." />
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <article key={row.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-medium">{row.title}</h2>
                <p className="text-xs text-muted-foreground">
                  {row.recipients} recipients · {new Date(row.createdAt).toLocaleString()}
                </p>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{row.message}</p>
            </article>
          ))}
        </div>
      )}
    </AppShell>
  )
}
