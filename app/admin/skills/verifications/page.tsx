"use client"

import { useEffect, useState } from "react"
import { AppShell } from "@/components/app-shell"
import { AdminError, AdminHeader, AdminLoading, AdminStack, AdminCard } from "@/components/admin-ui"
import { Breadcrumbs } from "@/components/ui-kit/navigation"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui-bits"
import { adminApi, type AdminSkillRow } from "@/lib/admin/client"

export default function AdminSkillVerificationsPage() {
  const [rows, setRows] = useState<AdminSkillRow[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  const load = () => {
    void adminApi
      .skillQueue()
      .then((data) => setRows(data.skills))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load skills."))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <AppShell requiredRole="admin">
      <div className="mb-4">
        <Breadcrumbs
          items={[
            { label: "Admin", href: "/admin/dashboard" },
            { label: "Skills", href: "/admin/skills" },
            { label: "Skill verification" },
          ]}
        />
      </div>
      <AdminHeader title="Skill verification" description="Official verification is stored in skill_verifications. Client verified flags are ignored." />
      <AdminError message={error} />
      {loading ? (
        <AdminLoading />
      ) : (
        <AdminStack
          mobile={rows.map((row) => (
            <AdminCard key={row.skillId}>
              <p className="font-medium">{row.skillName}</p>
              <p className="text-sm text-muted-foreground">{row.studentName}</p>
              <p className="text-xs text-muted-foreground">{row.studentEmail}</p>
              <p className="mt-2 text-sm">{row.source} · {row.evidenceBacked ? "Has evidence" : "No evidence"}</p>
              <div className="mt-2">
                <Chip tone={row.verified ? "success" : "muted"}>{row.verified ? "Verified" : "Pending"}</Chip>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button onClick={() => void adminApi.verifySkill({ userId: row.studentId, skillName: row.skillName, verified: true }).then(load)}>
                  Verify
                </Button>
                <Button variant="outline" onClick={() => void adminApi.verifySkill({ userId: row.studentId, skillName: row.skillName, verified: false }).then(load)}>
                  {row.verified ? "Remove" : "Reject"}
                </Button>
              </div>
            </AdminCard>
          ))}
          desktop={
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Skill</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Evidence</th>
                <th className="px-4 py-3">Official</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.skillId}>
                  <td className="px-4 py-3">
                    {row.studentName}
                    <p className="text-xs text-muted-foreground">{row.studentEmail}</p>
                  </td>
                  <td className="px-4 py-3">
                    {row.skillName}
                    <p className="text-xs text-muted-foreground">{row.category}</p>
                  </td>
                  <td className="px-4 py-3">{row.source}</td>
                  <td className="px-4 py-3">{row.evidenceBacked ? "Evidence-backed" : "Not evidence-backed"}</td>
                  <td className="px-4 py-3">
                    <Chip tone={row.verified ? "success" : "muted"}>{row.verified ? "Verified" : "Pending"}</Chip>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        onClick={() =>
                          void adminApi.verifySkill({ userId: row.studentId, skillName: row.skillName, verified: true }).then(load)
                        }
                      >
                        Verify
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          void adminApi.verifySkill({ userId: row.studentId, skillName: row.skillName, verified: false }).then(load)
                        }
                      >
                        Remove
                      </Button>
                      {!row.verified ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            void adminApi.verifySkill({ userId: row.studentId, skillName: row.skillName, verified: false }).then(load)
                          }
                        >
                          Reject
                        </Button>
                      ) : null}
                    </div>
                  </td>
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
