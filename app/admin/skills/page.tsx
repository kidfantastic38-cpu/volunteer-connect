"use client"

import { useEffect, useState } from "react"
import { AppShell } from "@/components/app-shell"
import { AdminError, AdminHeader, AdminLoading } from "@/components/admin-ui"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui-bits"
import { adminApi, type AdminCatalogRow } from "@/lib/admin/client"

export default function AdminSkillsPage() {
  const [rows, setRows] = useState<AdminCatalogRow[]>([])
  const [name, setName] = useState("")
  const [category, setCategory] = useState("General")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  const load = () => {
    void adminApi
      .catalog()
      .then((data) => setRows(data.skills))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load skills."))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <AppShell requiredRole="admin">
      <AdminHeader title="Skills catalog" description="Platform skill names and categories. Existing student skills are not deleted." />
      <AdminError message={error} />
      <form
        className="mb-6 grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-3"
        onSubmit={(e) => {
          e.preventDefault()
          void adminApi
            .saveCatalog({ name, category })
            .then(() => {
              setName("")
              load()
            })
            .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not save."))
        }}
      >
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Skill name" className="rounded-xl border border-input px-3 py-2 text-sm" />
        <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" className="rounded-xl border border-input px-3 py-2 text-sm" />
        <Button type="submit">Add skill</Button>
      </form>
      {loading ? (
        <AdminLoading />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3 font-medium">{row.name}</td>
                  <td className="px-4 py-3">{row.category}</td>
                  <td className="px-4 py-3">
                    <Chip tone={row.active ? "success" : "muted"}>{row.active ? "Active" : "Disabled"}</Chip>
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        void adminApi
                          .saveCatalog({ id: row.id, name: row.name, category: row.category, active: !row.active })
                          .then(load)
                      }
                    >
                      {row.active ? "Disable" : "Enable"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  )
}
