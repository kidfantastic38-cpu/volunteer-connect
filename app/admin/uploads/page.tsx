"use client"

import { useEffect, useState } from "react"
import { Upload } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { AdminError, AdminHeader, AdminLoading, AdminStack, AdminCard } from "@/components/admin-ui"
import { EmptyState } from "@/components/ui-bits"
import { adminApi, type AdminUploadRow } from "@/lib/admin/client"

export default function AdminUploadsPage() {
  const [rows, setRows] = useState<AdminUploadRow[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void adminApi
      .uploads()
      .then((data) => setRows(data.uploads))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load uploads."))
      .finally(() => setLoading(false))
  }, [])

  return (
    <AppShell requiredRole="admin">
      <AdminHeader title="Uploads / evidence" description="Admin-authorized file metadata only. Storage paths are not exposed." />
      <AdminError message={error} />
      {loading ? (
        <AdminLoading />
      ) : rows.length === 0 ? (
        <EmptyState icon={<Upload className="size-6" />} title="No uploads" description="Evidence files linked to accounts will appear here." />
      ) : (
        <AdminStack
          mobile={rows.map((row) => (
            <AdminCard key={row.id}>
              <p className="font-medium break-all">{row.originalName}</p>
              <p className="mt-1 text-sm">{row.ownerName}</p>
              <p className="text-xs text-muted-foreground">{row.ownerEmail}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {row.mimeType} · {Math.round(row.size / 1024)} KB · {new Date(row.createdAt).toLocaleString()}
              </p>
            </AdminCard>
          ))}
          desktop={
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">File</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Uploaded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3 font-medium">{row.originalName}</td>
                  <td className="px-4 py-3">
                    {row.ownerName}
                    <p className="text-xs text-muted-foreground">{row.ownerEmail}</p>
                  </td>
                  <td className="px-4 py-3">{row.mimeType}</td>
                  <td className="px-4 py-3">{Math.round(row.size / 1024)} KB</td>
                  <td className="px-4 py-3">{new Date(row.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          }
        />
      )}
    </AppShell>
  )
}
