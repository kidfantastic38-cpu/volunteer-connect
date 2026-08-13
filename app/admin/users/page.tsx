"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { usePrototype, type AdminUser } from "@/components/prototype-store"
import { Button } from "@/components/ui/button"
import { Chip, ProgressBar, EmptyState } from "@/components/ui-bits"
import { Avatar } from "@/components/app-shell"

type StatusFilter = "all" | AdminUser["status"]

function StatusChip({ status }: { status: AdminUser["status"] }) {
  const map = {
    active: { tone: "success" as const, label: "Active" },
    pending: { tone: "accent" as const, label: "Pending" },
    suspended: { tone: "muted" as const, label: "Suspended" },
  }
  const { tone, label } = map[status]
  return <Chip tone={tone}>{label}</Chip>
}

export default function AdminUsersPage() {
  const { adminUsers, setUserStatus } = usePrototype()
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<StatusFilter>("all")

  const filtered = useMemo(
    () =>
      adminUsers.filter((u) => {
        if (filter !== "all" && u.status !== filter) return false
        if (query.trim() && !`${u.name} ${u.email}`.toLowerCase().includes(query.toLowerCase())) return false
        return true
      }),
    [adminUsers, filter, query],
  )

  const filters: StatusFilter[] = ["all", "active", "pending", "suspended"]

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight">User management</h1>
        <p className="text-sm text-muted-foreground">Approve, suspend and review platform members.</p>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:max-w-xs sm:flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or email"
            aria-label="Search users"
            className="w-full rounded-xl border border-input bg-card py-2 pl-10 pr-4 text-sm outline-none ring-ring/40 focus-visible:ring-2"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Search className="size-6" aria-hidden="true" />} title="No users found" description="Try a different search or filter." />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-2xl border border-border bg-card md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Member</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 font-medium">Profile</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} className="size-8" />
                        <div className="min-w-0">
                          <p className="truncate font-medium">{u.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">{u.role}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.joined}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <ProgressBar value={u.profileStrength} className="w-16" />
                        <span className="text-xs text-muted-foreground">{u.profileStrength}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusChip status={u.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <UserActions user={u} onSet={(s) => setUserStatus(u.id, s)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {filtered.map((u) => (
              <div key={u.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <Avatar name={u.name} className="size-9" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{u.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <StatusChip status={u.status} />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs capitalize text-muted-foreground">
                    {u.role} · joined {u.joined}
                  </span>
                  <UserActions user={u} onSet={(s) => setUserStatus(u.id, s)} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </AppShell>
  )
}

function UserActions({ user, onSet }: { user: AdminUser; onSet: (s: AdminUser["status"]) => void }) {
  if (user.status === "pending") {
    return (
      <div className="flex gap-2">
        <Button size="sm" onClick={() => onSet("active")}>
          Approve
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onSet("suspended")}>
          Reject
        </Button>
      </div>
    )
  }
  if (user.status === "suspended") {
    return (
      <Button size="sm" variant="outline" onClick={() => onSet("active")}>
        Reactivate
      </Button>
    )
  }
  return (
    <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => onSet("suspended")}>
      Suspend
    </Button>
  )
}
