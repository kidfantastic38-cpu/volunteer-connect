"use client"

import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { AdminConfirm, AdminError, AdminHeader, AdminLoading, AdminStack, AdminCard } from "@/components/admin-ui"
import { Avatar } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { Chip, EmptyState } from "@/components/ui-bits"
import { adminApi, type AdminUserRow } from "@/lib/admin/client"

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserRow[]>([])
  const [query, setQuery] = useState("")
  const [role, setRole] = useState("")
  const [status, setStatus] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [pending, setPending] = useState<{ user: AdminUserRow; status: string } | null>(null)

  const load = () => {
    const params = new URLSearchParams()
    if (query.trim()) params.set("q", query.trim())
    if (role) params.set("role", role)
    if (status) params.set("status", status)
    void adminApi
      .users(params.toString() ? `?${params}` : "")
      .then((data) => setUsers(data.users))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load users."))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, status])

  const patch = (id: string, body: object) => {
    setBusy(id)
    setError("")
    void adminApi
      .patchUser(id, body)
      .then(() => load())
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not update user."))
      .finally(() => setBusy(null))
  }

  return (
    <AppShell requiredRole="admin">
      <AdminHeader title="Users" description="Search and manage accounts. Roles change only through this Admin action." />
      <AdminError message={error} />
      <div className="mb-4 flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            placeholder="Search name or email"
            className="w-full rounded-xl border border-input bg-card py-3 pl-10 pr-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring/40 md:text-sm"
          />
        </div>
        <select value={role} onChange={(e) => setRole(e.target.value)} className="min-h-11 rounded-xl border border-input bg-card px-3 py-2 text-base md:text-sm">
          <option value="">All roles</option>
          <option value="student">Student</option>
          <option value="employer">Employer</option>
          <option value="admin">Admin</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="min-h-11 rounded-xl border border-input bg-card px-3 py-2 text-base md:text-sm">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="deactivated">Deactivated</option>
        </select>
        <Button onClick={() => { setLoading(true); load() }}>Search</Button>
      </div>
      {loading ? (
        <AdminLoading />
      ) : users.length === 0 ? (
        <EmptyState icon={<Search className="size-6" />} title="No users found" description="Try a different search or filter." />
      ) : (
        <AdminStack
          mobile={users.map((user) => (
            <AdminCard key={user.id}>
              <div className="flex items-center gap-3">
                <Avatar name={user.name} className="size-10" />
                <div className="min-w-0">
                  <p className="font-medium">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Role</dt>
                  <dd className="capitalize">{user.role}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Status</dt>
                  <dd className="capitalize">{user.status}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Registered</dt>
                  <dd>{new Date(user.createdAt).toLocaleDateString()}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Email</dt>
                  <dd>{user.emailVerified ? <Chip tone="success">Verified</Chip> : <Chip>Unverified</Chip>}</dd>
                </div>
              </dl>
              <div className="mt-3">
                {user.status === "active" ? (
                  <Button className="w-full" variant="outline" disabled={busy === user.id} onClick={() => setPending({ user, status: "suspended" })}>
                    Suspend
                  </Button>
                ) : (
                  <Button className="w-full" variant="outline" disabled={busy === user.id} onClick={() => setPending({ user, status: "active" })}>
                    Activate
                  </Button>
                )}
              </div>
            </AdminCard>
          ))}
          desktop={
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Registered</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name} className="size-8" />
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.headline || user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize">{user.role}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{user.emailVerified ? <Chip tone="success">Verified</Chip> : <Chip>Unverified</Chip>}</td>
                  <td className="px-4 py-3 capitalize">{user.status}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {user.status === "active" ? (
                        <Button size="sm" variant="ghost" disabled={busy === user.id} onClick={() => setPending({ user, status: "suspended" })}>
                          Suspend
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" disabled={busy === user.id} onClick={() => setPending({ user, status: "active" })}>
                          Activate
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          }
        />
      )}
      <AdminConfirm
        open={!!pending}
        title={pending?.status === "active" ? "Activate this account?" : "Suspend this account?"}
        description="The change is stored server-side. Suspended users cannot use an existing session."
        confirmLabel={pending?.status === "active" ? "Activate" : "Suspend"}
        busy={!!pending && busy === pending.user.id}
        onClose={() => setPending(null)}
        onConfirm={() => {
          if (!pending) return
          patch(pending.user.id, { status: pending.status })
          setPending(null)
        }}
      />
    </AppShell>
  )
}
