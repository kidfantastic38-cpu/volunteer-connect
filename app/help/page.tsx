"use client"

import { useState } from "react"
import { Check, ChevronDown, Mail } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { Field, Input, Textarea } from "@/components/form-controls"
import { Button } from "@/components/ui/button"

const faqs = [
  {
    q: "How are my skills verified?",
    a: "When you attach a certificate, photo, or named reference, that person or organisation can confirm it. Confirmed skills are marked on your record and count more in the match score.",
  },
  {
    q: "How is my match score calculated?",
    a: "The score compares skills listed on an opening with skills on your record. Confirmed skills and the level you set count more, along with the interests you named.",
  },
  {
    q: "Can I use my CV and public page outside this site?",
    a: "Yes. Print or save the CV, and share the public page from Privacy settings.",
  },
  {
    q: "Do organisations see my whole profile?",
    a: "Only what you allow. You control visibility and which evidence is shared from Privacy settings.",
  },
  {
    q: "Is volunteering treated the same as work experience?",
    a: "Yes. Volunteering, projects, and leadership sit on the same record as paid work. Organisations see what you listed, not a ranking of “real” versus “informal” experience.",
  },
]

export default function HelpPage() {
  const [open, setOpen] = useState<number | null>(0)
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ subject: "", message: "" })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.subject.trim() || !form.message.trim()) return
    setSent(true)
    setForm({ subject: "", message: "" })
    setTimeout(() => setSent(false), 3500)
  }

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Help</h1>
        <p className="text-sm text-muted-foreground">Common questions, or write to the team.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* FAQ */}
        <section className="lg:col-span-2">
          <h2 className="mb-3 font-display text-lg font-semibold">Frequently asked questions</h2>
          <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            {faqs.map((f, i) => {
              const isOpen = open === i
              return (
                <div key={f.q}>
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left"
                  >
                    <span className="text-sm font-medium text-card-foreground">{f.q}</span>
                    <ChevronDown
                      className={`size-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  </button>
                  {isOpen ? <p className="px-4 pb-4 text-sm text-muted-foreground text-pretty">{f.a}</p> : null}
                </div>
              )
            })}
          </div>
        </section>

        {/* Contact */}
        <section>
          <h2 className="mb-3 font-display text-lg font-semibold">Contact support</h2>
          <div className="rounded-2xl border border-border bg-card p-5">
            {sent ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <div className="grid size-12 place-items-center rounded-full bg-success/15 text-success">
                  <Check className="size-6" aria-hidden="true" />
                </div>
                <p className="font-medium">Message sent</p>
                <p className="text-sm text-muted-foreground text-pretty">
                  Our team typically replies within one working day.
                </p>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <Field label="Subject" htmlFor="subject">
                  <Input
                    id="subject"
                    value={form.subject}
                    onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                    placeholder="What do you need help with?"
                  />
                </Field>
                <Field label="Message" htmlFor="message">
                  <Textarea
                    id="message"
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    placeholder="Describe your question or issue..."
                  />
                </Field>
                <Button type="submit" className="w-full">
                  Send message
                </Button>
              </form>
            )}
            <div className="mt-4 flex items-center gap-2 border-t border-border pt-4 text-sm text-muted-foreground">
              <Mail className="size-4" aria-hidden="true" />
              support@volunteerconnect.org
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  )
}
