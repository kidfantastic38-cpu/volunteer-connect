"use client"

import { useState } from "react"
import { BookOpen, Check, ChevronDown, LifeBuoy, Mail, MessageCircle } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { Field, Input, Textarea } from "@/components/form-controls"
import { Button } from "@/components/ui/button"

const faqs = [
  {
    q: "How are my skills verified?",
    a: "When you add evidence — a reference, certificate or photo — the person or organisation you name can confirm it. Verified skills carry a badge and boost your opportunity matches.",
  },
  {
    q: "How is my match score calculated?",
    a: "We compare the skills an opportunity needs against the skills in your profile, weighting verified skills and your proficiency level, plus your stated interests. The stronger and more relevant your evidence, the higher the score.",
  },
  {
    q: "Can I use my CV and portfolio outside the platform?",
    a: "Yes. Your CV can be downloaded or printed, and your portfolio has a shareable public link you control from Privacy settings.",
  },
  {
    q: "Do employers see my whole profile?",
    a: "Only what you allow. You control employer visibility and which evidence is shared from Privacy & portfolio visibility.",
  },
  {
    q: "Is volunteering treated the same as work experience?",
    a: "Absolutely. VolunteerConnect is built to give volunteering, projects and leadership the same weight as formal work — because the skills are just as real.",
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
        <h1 className="font-display text-2xl font-bold tracking-tight">Help &amp; support</h1>
        <p className="text-sm text-muted-foreground">Answers to common questions, or reach our team directly.</p>
      </div>

      {/* Quick links */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <QuickLink icon={<BookOpen className="size-5" />} title="Guides" text="Step-by-step help getting started." />
        <QuickLink icon={<MessageCircle className="size-5" />} title="Community" text="Tips from other young people." />
        <QuickLink icon={<LifeBuoy className="size-5" />} title="Status" text="All systems operational." />
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

function QuickLink({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5">
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">{icon}</span>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground text-pretty">{text}</p>
      </div>
    </div>
  )
}
