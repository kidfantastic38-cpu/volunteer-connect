"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, Lock, ShieldCheck, Trash2, UserCog } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { usePrototype } from "@/components/prototype-store"
import { apiChangePassword } from "@/lib/auth/client"
import { Field, Input, Toggle } from "@/components/form-controls"
import { Button } from "@/components/ui/button"
import { PasswordInput } from "@/components/ui/password-input"
import { ButtonLink } from "@/components/button-link"
import { Chip } from "@/components/ui-bits"
import { Modal } from "@/components/modal"

export default function SettingsPage() {
  const router = useRouter()
  const { user, accountId, updateProfile, verified, privacy, updatePrivacy, logout } = usePrototype()
  const [name, setName] = useState(user?.name ?? "")
  const [email, setEmail] = useState(user?.email ?? "")
  const [savedAccount, setSavedAccount] = useState(false)
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" })
  const [pwMsg, setPwMsg] = useState<{ tone: "ok" | "err"; text: string } | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const saveAccount = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfile({ name, email })
    setSavedAccount(true)
    setTimeout(() => setSavedAccount(false), 2000)
  }

  const savePassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (!pw.current) return setPwMsg({ tone: "err", text: "Enter your current password." })
    if (pw.next.length < 6) return setPwMsg({ tone: "err", text: "New password must be at least 6 characters." })
    if (pw.next !== pw.confirm) return setPwMsg({ tone: "err", text: "New passwords do not match." })
    if (!accountId) {
      setPwMsg({ tone: "err", text: "This demo session has no stored password. Register or log in with email to manage a password." })
      return
    }
    void apiChangePassword({ current: pw.current, next: pw.next })
      .then(() => {
        setPw({ current: "", next: "", confirm: "" })
        setPwMsg({ tone: "ok", text: "Password updated." })
        setTimeout(() => setPwMsg(null), 2500)
      })
      .catch((err: unknown) => {
        setPwMsg({ tone: "err", text: err instanceof Error ? err.message : "Could not update password." })
      })
  }

  const onDelete = () => {
    logout()
    router.push("/")
  }

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight">Account settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account, security and notification preferences.</p>
      </div>

      <div className="mx-auto max-w-2xl space-y-6">
        {/* Account */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <UserCog className="size-5 text-primary" aria-hidden="true" />
            <h2 className="font-display text-lg font-semibold">Account details</h2>
          </div>
          <form onSubmit={saveAccount} className="mt-4 space-y-4">
            <Field label="Full name" htmlFor="name">
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Email address" htmlFor="email">
              <div className="flex items-center gap-2">
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                {verified ? (
                  <Chip tone="success">
                    <ShieldCheck className="size-3" aria-hidden="true" /> Verified
                  </Chip>
                ) : (
                  <ButtonLink href="/verify" size="sm" variant="outline">
                    Verify
                  </ButtonLink>
                )}
              </div>
            </Field>
            <div className="flex items-center gap-3">
              <Button type="submit">Save changes</Button>
              {savedAccount ? (
                <span className="inline-flex items-center gap-1 text-sm font-medium text-success">
                  <Check className="size-4" aria-hidden="true" /> Saved
                </span>
              ) : null}
            </div>
          </form>
        </section>

        {/* Security */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <Lock className="size-5 text-primary" aria-hidden="true" />
            <h2 className="font-display text-lg font-semibold">Password &amp; security</h2>
          </div>
          <form onSubmit={savePassword} className="mt-4 space-y-4">
            <Field label="Current password" htmlFor="cpw">
              <PasswordInput id="cpw" name="current-password" value={pw.current} onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))} placeholder="••••••••" autoComplete="current-password" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="New password" htmlFor="npw">
                <PasswordInput id="npw" name="new-password" value={pw.next} onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))} placeholder="••••••••" autoComplete="new-password" />
              </Field>
              <Field label="Confirm new" htmlFor="cnpw">
                <PasswordInput id="cnpw" name="confirm-password" value={pw.confirm} onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))} placeholder="••••••••" autoComplete="new-password" />
              </Field>
            </div>
            {pwMsg ? (
              <p className={`text-sm font-medium ${pwMsg.tone === "ok" ? "text-success" : "text-destructive"}`}>
                {pwMsg.text}
              </p>
            ) : null}
            <Button type="submit" variant="outline">
              Update password
            </Button>
          </form>
        </section>

        {/* Notifications */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold">Notification preferences</h2>
          <div className="mt-2 divide-y divide-border">
            <Toggle
              id="emailNotifications"
              checked={privacy.emailNotifications}
              onChange={(v) => updatePrivacy({ emailNotifications: v })}
              label="Email notifications"
              description="Get important account and application updates by email."
            />
            <Toggle
              id="matchAlerts"
              checked={privacy.matchAlerts}
              onChange={(v) => updatePrivacy({ matchAlerts: v })}
              label="New match alerts"
              description="Be notified when a strong opportunity match appears."
            />
          </div>
        </section>

        {/* Privacy link */}
        <section className="flex items-center justify-between rounded-2xl border border-border bg-card p-6">
          <div>
            <h2 className="font-display text-lg font-semibold">Privacy &amp; portfolio visibility</h2>
            <p className="mt-1 text-sm text-muted-foreground">Control who can find and view your profile and portfolio.</p>
          </div>
          <ButtonLink href="/settings/privacy" variant="outline">
            Manage
          </ButtonLink>
        </section>

        {/* Danger zone */}
        <section className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
          <div className="flex items-center gap-2">
            <Trash2 className="size-5 text-destructive" aria-hidden="true" />
            <h2 className="font-display text-lg font-semibold text-destructive">Delete account</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Permanently remove your profile, CV and portfolio. This cannot be undone.
          </p>
          <Button variant="outline" className="mt-4 border-destructive/40 text-destructive hover:bg-destructive/10" onClick={() => setConfirmDelete(true)}>
            Delete my account
          </Button>
        </section>
      </div>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete your account?"
        description="This will end your prototype session and clear all progress."
      >
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
          <Button className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={onDelete}>
            Yes, delete
          </Button>
        </div>
      </Modal>
    </AppShell>
  )
}
