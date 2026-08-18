"use client"

import { useEffect, useState } from "react"
import { AppShell } from "@/components/app-shell"
import { AdminError, AdminHeader, AdminLoading, AdminStack, AdminCard } from "@/components/admin-ui"
import { Chip } from "@/components/ui-bits"
import { adminApi, type AdminAuditRow, type AdminSettings } from "@/lib/admin/client"

function Flag({ on }: { on: boolean }) {
  return <Chip tone={on ? "success" : "muted"}>{on ? "Configured" : "Not configured"}</Chip>
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSettings | null>(null)
  const [audit, setAudit] = useState<AdminAuditRow[]>([])
  const [error, setError] = useState("")

  useEffect(() => {
    void adminApi
      .settings()
      .then((data) => {
        setSettings(data.settings)
        setAudit(data.audit)
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load settings."))
  }, [])

  return (
    <AppShell requiredRole="admin">
      <AdminHeader title="Settings" description="Read-only platform status from the running application. These are not fake toggles." />
      <AdminError message={error} />
      {!settings ? (
        <AdminLoading />
      ) : (
        <div className="space-y-6">
          <dl className="grid gap-3 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase text-muted-foreground">App host</dt>
              <dd className="mt-1 font-medium">{settings.appHost || "Not set"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-muted-foreground">Database driver</dt>
              <dd className="mt-1 font-medium">{settings.databaseDriver}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-sm">Email provider</dt>
              <dd>
                <Flag on={settings.emailConfigured} />
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-sm">Blob storage</dt>
              <dd>
                <Flag on={settings.blobConfigured} />
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3 sm:col-span-2">
              <dt className="text-sm">Demo OTP</dt>
              <dd>
                <Chip tone={settings.demoOtpEnabled ? "outline" : "muted"}>{settings.demoOtpEnabled ? "Enabled in this environment" : "Disabled"}</Chip>
              </dd>
            </div>
          </dl>
          <section>
            <h2 className="mb-3 font-display text-base font-semibold">Recent admin actions</h2>
            {audit.length === 0 ? (
              <p className="text-sm text-muted-foreground">No audited actions yet.</p>
            ) : (
              <AdminStack
                mobile={audit.map((row) => (
                  <AdminCard key={row.id}>
                    <p className="font-medium">{row.action}</p>
                    <p className="text-sm text-muted-foreground">{row.actorName}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{new Date(row.createdAt).toLocaleString()}</p>
                    <p className="mt-1 break-all text-xs text-muted-foreground">
                      {row.entityType} · {row.entityId.slice(0, 8)}
                    </p>
                  </AdminCard>
                ))}
                desktop={
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">When</th>
                      <th className="px-4 py-3">Admin</th>
                      <th className="px-4 py-3">Action</th>
                      <th className="px-4 py-3">Entity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {audit.map((row) => (
                      <tr key={row.id}>
                        <td className="px-4 py-3">{new Date(row.createdAt).toLocaleString()}</td>
                        <td className="px-4 py-3">{row.actorName}</td>
                        <td className="px-4 py-3">{row.action}</td>
                        <td className="px-4 py-3">
                          {row.entityType} · {row.entityId.slice(0, 8)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                }
              />
            )}
          </section>
        </div>
      )}
    </AppShell>
  )
}
