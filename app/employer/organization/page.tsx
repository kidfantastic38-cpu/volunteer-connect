"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { OrgTrustBadge } from "@/components/org-badge"
import { VerificationBanner } from "@/components/verification-banner"
import { Field, Input, Select, Textarea } from "@/components/form-controls"
import { Button } from "@/components/ui/button"
import { usePrototype } from "@/components/prototype-store"
import { apiSaveOrganization } from "@/lib/auth/client"
import { ORGANIZATION_TYPES, type OrganizationType } from "@/lib/org/types"

export default function OrganizationProfilePage() {
  const { organization, setOrganization } = usePrototype()
  const [form, setForm] = useState({
    name: organization?.name ?? "",
    organizationType: (organization?.organizationType ?? "Company") as OrganizationType,
    organizationEmail: organization?.organizationEmail ?? "",
    phone: organization?.phone ?? "",
    website: organization?.website ?? "",
    registrationNumber: organization?.registrationNumber ?? "",
    address: organization?.address ?? "",
    logoUrl: organization?.logoUrl ?? "",
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ tone: "ok" | "err"; text: string } | null>(null)

  const set = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => setForm((current) => ({ ...current, [key]: e.target.value }))

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    void apiSaveOrganization(form)
      .then((org) => {
        setOrganization(org)
        setMessage({ tone: "ok", text: "Organization profile saved." })
      })
      .catch((err: unknown) => {
        setMessage({ tone: "err", text: err instanceof Error ? err.message : "Could not save organization." })
      })
      .finally(() => setSaving(false))
  }

  return (
    <AppShell requiredRole="employer">
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display text-2xl font-bold tracking-tight">Organization profile</h1>
          <OrgTrustBadge status={organization?.verificationStatus} />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Keep your organization details current. Admins use this information to verify you.
        </p>
      </div>
      <VerificationBanner status={organization?.verificationStatus} notes={undefined} />

      <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
        <Field label="Organization name" htmlFor="name">
          <Input id="name" value={form.name} onChange={set("name")} required />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Organization type" htmlFor="organizationType">
            <Select id="organizationType" value={form.organizationType} onChange={set("organizationType")}>
              {ORGANIZATION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Organization email" htmlFor="organizationEmail">
            <Input id="organizationEmail" type="email" value={form.organizationEmail} onChange={set("organizationEmail")} required />
          </Field>
        </div>
        <Field label="Contact phone" htmlFor="phone">
          <Input id="phone" type="tel" value={form.phone} onChange={set("phone")} required placeholder="+232 76 000 555" />
        </Field>
        <Field label="Website" htmlFor="website">
          <Input id="website" type="url" value={form.website} onChange={set("website")} />
        </Field>
        <Field label="Business registration number" htmlFor="registrationNumber">
          <Input id="registrationNumber" value={form.registrationNumber} onChange={set("registrationNumber")} />
        </Field>
        <Field label="Address" htmlFor="address">
          <Textarea id="address" value={form.address} onChange={set("address")} required />
        </Field>
        <Field label="Logo URL" htmlFor="logoUrl">
          <Input id="logoUrl" value={form.logoUrl} onChange={set("logoUrl")} />
        </Field>
        {message ? (
          <p className={`text-sm font-medium ${message.tone === "ok" ? "text-success" : "text-destructive"}`}>
            {message.text}
          </p>
        ) : null}
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          {saving ? "Saving…" : "Save organization"}
        </Button>
      </form>
    </AppShell>
  )
}
