"use client"

import { useState } from "react"
import { FolderTree, Plus } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { usePrototype } from "@/components/prototype-store"
import { Toggle, TextInput, Field } from "@/components/form-controls"
import { Chip } from "@/components/ui-bits"
import { Button } from "@/components/ui/button"

export default function AdminCategoriesPage() {
  const { categories, toggleCategory, addCategory } = usePrototype()
  const [name, setName] = useState("")

  const activeCount = categories.filter((c) => c.active).length
  const totalSkills = categories.reduce((sum, c) => sum + c.skillCount, 0)

  const onAdd = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    addCategory(trimmed)
    setName("")
  }

  return (
    <AppShell requiredRole="admin">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight">Categories &amp; skills</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Curate the skill taxonomy students use to describe and evidence their experience.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>
              <strong className="text-foreground">{activeCount}</strong> active
            </span>
            <span aria-hidden="true">·</span>
            <span>
              <strong className="text-foreground">{categories.length}</strong> total
            </span>
            <span aria-hidden="true">·</span>
            <span>
              <strong className="text-foreground">{totalSkills}</strong> mapped skills
            </span>
          </div>

          <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-e1">
            {categories.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <FolderTree className="size-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.skillCount} skills</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Chip tone={c.active ? "success" : "muted"}>{c.active ? "Active" : "Hidden"}</Chip>
                  <Toggle
                    checked={c.active}
                    onChange={() => toggleCategory(c.id)}
                    label={`Toggle ${c.name}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-fit rounded-xl border border-border bg-card p-5 shadow-e1">
          <h2 className="font-display text-base font-semibold">Add a category</h2>
          <p className="mt-1 text-sm text-muted-foreground text-pretty">
            New categories become available to students immediately when active.
          </p>
          <form onSubmit={onAdd} className="mt-4 space-y-4">
            <Field label="Category name" htmlFor="cat-name">
              <TextInput
                id="cat-name"
                placeholder="e.g. Digital literacy"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
            <Button type="submit" className="w-full" disabled={!name.trim()}>
              <Plus className="size-4" aria-hidden="true" />
              Add category
            </Button>
          </form>
        </div>
      </div>
    </AppShell>
  )
}
