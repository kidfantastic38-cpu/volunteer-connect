"use client"

import { useEffect, useState } from "react"
import { Share2 } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { AdminConfirm, AdminError, AdminHeader, AdminLoading } from "@/components/admin-ui"
import { Button } from "@/components/ui/button"
import { Chip, EmptyState } from "@/components/ui-bits"
import { adminApi, type AdminPortfolioRow } from "@/lib/admin/client"

export default function AdminPortfoliosPage() {
  const [rows, setRows] = useState<AdminPortfolioRow[]>([])
  const [query, setQuery] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [pendingId, setPendingId] = useState<string | null>(null)

  const load = () => {
    void adminApi
      .portfolios(query.trim() ? `?q=${encodeURIComponent(query.trim())}` : "")
      .then((data) => setRows(data.portfolios))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load portfolios."))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <AppShell requiredRole="admin">
      <AdminHeader title="Portfolios" description="Publication status only. Private profile fields stay off this screen." />
      <AdminError message={error} />
      <div className="mb-4 flex gap-2">
        <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()} placeholder="Search name or slug" className="flex-1 rounded-xl border border-input px-3 py-2 text-sm" />
        <Button onClick={() => { setLoading(true); load() }}>Search</Button>
      </div>
      {loading ? (
        <AdminLoading />
      ) : rows.length === 0 ? (
        <EmptyState icon={<Share2 className="size-6" />} title="No portfolios" description="Published and unpublished portfolios will appear here." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Visibility</th>
                <th className="px-4 py-3">Published</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.userId}>
                  <td className="px-4 py-3">
                    {row.name}
                    <p className="text-xs text-muted-foreground">{row.tagline}</p>
                  </td>
                  <td className="px-4 py-3">{row.slug || "—"}</td>
                  <td className="px-4 py-3">{row.visibility}</td>
                  <td className="px-4 py-3">
                    <Chip tone={row.published ? "success" : "muted"}>{row.published ? "Published" : "Unpublished"}</Chip>
                  </td>
                  <td className="px-4 py-3">
                    {row.published ? (
                      <Button size="sm" variant="outline" onClick={() => setPendingId(row.userId)}>
                        Unpublish
                      </Button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <AdminConfirm
        open={!!pendingId}
        title="Unpublish this portfolio?"
        description="The public DTO is unchanged. The portfolio will no longer be publicly available."
        confirmLabel="Unpublish"
        onClose={() => setPendingId(null)}
        onConfirm={() => {
          if (!pendingId) return
          const id = pendingId
          setPendingId(null)
          void adminApi.unpublish(id).then(load).catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not unpublish."))
        }}
      />
    </AppShell>
  )
}
