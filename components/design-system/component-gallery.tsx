"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Bell,
  Search,
  TrendingUp,
  Users,
  Compass,
  Check,
  Info,
} from "lucide-react"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { ButtonLink } from "@/components/button-link"
import { DsSection, Subhead, Specimen } from "@/components/design-system/ds-primitives"

import { Chip, ProgressBar, EmptyState, VerifiedBadge } from "@/components/ui-bits"
import { Field, Input, Textarea, Select, Toggle } from "@/components/form-controls"
import { Modal } from "@/components/modal"
import { useToast } from "@/components/toast"
import { Alert, Tooltip } from "@/components/ui-kit/feedback"
import { Breadcrumbs, Tabs, Pagination } from "@/components/ui-kit/navigation"
import { Avatar, DataTable, DataList, DataListItem, StatCard, MiniBarChart, type Column } from "@/components/ui-kit/data-display"
import { Checkbox, RadioGroup, FileUpload } from "@/components/ui-kit/forms"
import { Spinner, Skeleton, SkeletonCard, ErrorFallback } from "@/components/ui-kit/utility"

const NAV = [
  { id: "foundation", label: "Foundation" },
  { id: "navigation", label: "Navigation" },
  { id: "data-display", label: "Data display" },
  { id: "forms", label: "Forms" },
  { id: "feedback", label: "Feedback" },
  { id: "utility", label: "Utility" },
]

type Candidate = { id: string; name: string; role: string; match: number; status: "New" | "Reviewed" | "Shortlisted" }

const candidates: Candidate[] = [
  { id: "1", name: "Amara Okafor", role: "Sustainability Assistant", match: 95, status: "Shortlisted" },
  { id: "2", name: "James Whitfield", role: "Community Volunteer", match: 82, status: "Reviewed" },
  { id: "3", name: "Priya Nair", role: "Events Intern", match: 74, status: "New" },
]

export function ComponentGallery() {
  const { toast } = useToast()
  const [tab, setTab] = useState("overview")
  const [page, setPage] = useState(3)
  const [modalOpen, setModalOpen] = useState(false)
  const [checked, setChecked] = useState(true)
  const [checked2, setChecked2] = useState(false)
  const [radio, setRadio] = useState("student")
  const [toggle, setToggle] = useState(true)
  const [showError, setShowError] = useState(true)

  const columns: Column<Candidate>[] = [
    {
      key: "name",
      header: "Candidate",
      cell: (r) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={r.name} size="sm" />
          <span className="font-medium">{r.name}</span>
        </div>
      ),
    },
    { key: "role", header: "Role", cell: (r) => <span className="text-muted-foreground">{r.role}</span> },
    { key: "match", header: "Match", align: "center", cell: (r) => <Chip tone={r.match >= 90 ? "success" : "primary"}>{r.match}%</Chip> },
    {
      key: "status",
      header: "Status",
      align: "right",
      cell: (r) => (
        <Chip tone={r.status === "Shortlisted" ? "success" : r.status === "Reviewed" ? "accent" : "muted"}>{r.status}</Chip>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="hidden rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground sm:inline">
              Component library
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <ButtonLink href="/design-system" variant="ghost" size="sm">
              Design system
            </ButtonLink>
            <ButtonLink href="/" variant="ghost" size="sm">
              <ArrowLeft className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Back to app</span>
            </ButtonLink>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-10 px-4 py-10 sm:px-6">
        {/* Section nav */}
        <aside className="sticky top-24 hidden h-fit w-44 shrink-0 lg:block">
          <nav className="space-y-1">
            {NAV.map((n) => (
              <a
                key={n.id}
                href={`#${n.id}`}
                className="block rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {n.label}
              </a>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          {/* Intro */}
          <div className="mb-6">
            <h1 className="font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              Component library
            </h1>
            <p className="mt-3 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
              The building blocks of VOLUNTEER CONNECT — navigation, data display, forms, feedback and utility components.
              Every component is themed with design tokens, handles all interactive states, and is fully responsive.
            </p>
          </div>

          {/* FOUNDATION */}
          <DsSection id="foundation" eyebrow="Foundation" title="Buttons & badges" description="Actions and status markers reused throughout every screen.">
            <Subhead>Button variants</Subhead>
            <Specimen label="variant">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </Specimen>
            <div className="mt-3">
              <Specimen label="size & state">
                <Button size="sm">Small</Button>
                <Button>Default</Button>
                <Button size="lg">Large</Button>
                <Button disabled>Disabled</Button>
                <Button>
                  <Spinner size="sm" /> Loading
                </Button>
              </Specimen>
            </div>

            <Subhead>Badges & chips</Subhead>
            <Specimen label="tone">
              <Chip>Muted</Chip>
              <Chip tone="primary">Primary</Chip>
              <Chip tone="accent">Accent</Chip>
              <Chip tone="success">Success</Chip>
              <Chip tone="outline">Outline</Chip>
              <VerifiedBadge />
            </Specimen>
          </DsSection>

          {/* NAVIGATION */}
          <DsSection id="navigation" eyebrow="Navigation" title="Wayfinding" description="Breadcrumbs, tabs and pagination keep users oriented across deep flows.">
            <Subhead>Breadcrumbs</Subhead>
            <Specimen>
              <Breadcrumbs
                items={[
                  { label: "Dashboard", href: "/dashboard" },
                  { label: "Opportunities", href: "/opportunities" },
                  { label: "Sustainability Assistant" },
                ]}
              />
            </Specimen>

            <Subhead>Tabs</Subhead>
            <Specimen className="!block">
              <Tabs
                value={tab}
                onChange={setTab}
                items={[
                  { id: "overview", label: "Overview" },
                  { id: "applicants", label: "Applicants", badge: 12 },
                  { id: "activity", label: "Activity" },
                ]}
              />
              <p className="mt-4 text-sm text-muted-foreground">
                Active tab: <span className="font-medium text-foreground">{tab}</span>
              </p>
            </Specimen>

            <Subhead>Pagination</Subhead>
            <Specimen>
              <Pagination page={page} total={10} onChange={setPage} />
            </Specimen>

            <Subhead>Header & sidebar</Subhead>
            <Specimen className="!block">
              <p className="text-sm text-muted-foreground">
                The production app header and role-aware sidebar live in{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">AppShell</code>. Sign in to any workspace
                to see them in context.
              </p>
            </Specimen>
          </DsSection>

          {/* DATA DISPLAY */}
          <DsSection id="data-display" eyebrow="Data display" title="Presenting information" description="Tables, lists, cards, avatars and charts communicate structured data clearly.">
            <Subhead>Stat cards</Subhead>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard label="Active students" value="1,284" delta={{ value: "12% this month", positive: true }} icon={<Users className="size-4" />} />
              <StatCard label="Open opportunities" value="86" delta={{ value: "4% this month", positive: true }} icon={<Compass className="size-4" />} />
              <StatCard label="Avg. match rate" value="78%" delta={{ value: "2% this month", positive: false }} icon={<TrendingUp className="size-4" />} />
            </div>

            <Subhead>Table</Subhead>
            <DataTable columns={columns} rows={candidates} getKey={(r) => r.id} caption="Candidate matches" />

            <Subhead>List</Subhead>
            <DataList>
              <DataListItem
                leading={<Avatar name="Amara Okafor" size="sm" />}
                title="Amara Okafor"
                subtitle="Applied to Sustainability Assistant"
                trailing={<Chip tone="success">95%</Chip>}
              />
              <DataListItem
                leading={<Avatar name="James Whitfield" size="sm" />}
                title="James Whitfield"
                subtitle="Applied to Community Volunteer"
                trailing={<Chip tone="primary">82%</Chip>}
              />
            </DataList>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div>
                <Subhead>Avatars</Subhead>
                <Specimen>
                  <Avatar name="Amara Okafor" size="sm" />
                  <Avatar name="James Whitfield" size="md" />
                  <Avatar name="Priya Nair" size="lg" />
                </Specimen>
              </div>
              <div>
                <Subhead>Progress</Subhead>
                <Specimen className="!block">
                  <p className="mb-1.5 text-sm font-medium">Profile strength</p>
                  <ProgressBar value={72} />
                </Specimen>
              </div>
            </div>

            <Subhead>Chart</Subhead>
            <div className="rounded-xl border border-border bg-card p-6 shadow-e1">
              <p className="mb-4 text-sm font-medium">Applications per month</p>
              <MiniBarChart
                data={[
                  { label: "Jan", value: 12 },
                  { label: "Feb", value: 19 },
                  { label: "Mar", value: 8 },
                  { label: "Apr", value: 24 },
                  { label: "May", value: 17 },
                  { label: "Jun", value: 29 },
                ]}
              />
            </div>
          </DsSection>

          {/* FORMS */}
          <DsSection id="forms" eyebrow="Forms" title="Capturing input" description="Accessible inputs with labels, hints, validation, selection controls and uploads.">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <Subhead>Text inputs</Subhead>
                <Field label="Full name" htmlFor="demo-name" hint="As it should appear on your CV.">
                  <Input id="demo-name" placeholder="Nehemiah Williams" />
                </Field>
                <Field label="Email" htmlFor="demo-email" error="Please enter a valid email address.">
                  <Input id="demo-email" defaultValue="not-an-email" aria-invalid />
                </Field>
                <Field label="Role" htmlFor="demo-role">
                  <Select id="demo-role" defaultValue="student">
                    <option value="student">Student</option>
                    <option value="employer">Opportunity provider</option>
                  </Select>
                </Field>
                <Field label="About you" htmlFor="demo-about">
                  <Textarea id="demo-about" placeholder="Tell us about your experience…" />
                </Field>
              </div>

              <div className="space-y-4">
                <Subhead>Selection controls</Subhead>
                <div className="space-y-3 rounded-xl border border-border bg-card p-4">
                  <Checkbox checked={checked} onChange={setChecked} label="Email me new matches" description="Weekly digest of opportunities that fit your skills." id="cb1" />
                  <Checkbox checked={checked2} onChange={setChecked2} label="Make profile searchable" id="cb2" />
                  <Checkbox checked={false} onChange={() => {}} label="Disabled option" disabled id="cb3" />
                </div>
                <RadioGroup
                  name="acct"
                  value={radio}
                  onChange={setRadio}
                  options={[
                    { value: "student", label: "Student", description: "Track experience and find opportunities." },
                    { value: "employer", label: "Opportunity provider", description: "Post roles and review candidates." },
                  ]}
                />
                <div className="rounded-xl border border-border bg-card px-4">
                  <Toggle checked={toggle} onChange={setToggle} label="Two-factor authentication" description="Add an extra layer of security." id="tg1" />
                </div>
              </div>
            </div>

            <Subhead>File upload</Subhead>
            <FileUpload accept="Certificates & references — PDF, PNG, JPG up to 10MB" />

            <Subhead>Search field</Subhead>
            <Specimen className="!block">
              <div className="relative max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input placeholder="Search opportunities…" className="pl-9" />
              </div>
            </Specimen>
          </DsSection>

          {/* FEEDBACK */}
          <DsSection id="feedback" eyebrow="Feedback" title="Communicating status" description="Alerts, toasts, tooltips and modals surface outcomes and confirmations.">
            <Subhead>Alerts</Subhead>
            <div className="space-y-3">
              <Alert tone="info" title="Profile tip">Add two references to reach a 100% profile strength score.</Alert>
              <Alert tone="success" title="Application sent">Your application to EarthWise Foundation was submitted.</Alert>
              <Alert tone="warning" title="Verification pending">Your certificate is awaiting review by a programme lead.</Alert>
              <Alert tone="error" title="Upload failed" action={<Button size="sm" variant="outline">Retry upload</Button>}>
                The file exceeded the 10MB limit.
              </Alert>
            </div>

            <Subhead>Toasts</Subhead>
            <Specimen>
              <Button variant="outline" onClick={() => toast({ tone: "success", title: "Saved", description: "Your changes were saved." })}>
                <Check className="size-4" /> Success toast
              </Button>
              <Button variant="outline" onClick={() => toast({ tone: "info", title: "Heads up", description: "A new match is available." })}>
                <Info className="size-4" /> Info toast
              </Button>
              <Button variant="outline" onClick={() => toast({ tone: "warning", title: "Almost there", description: "Complete your profile to apply." })}>
                Warning toast
              </Button>
              <Button variant="outline" onClick={() => toast({ tone: "error", title: "Something went wrong", description: "Please try again." })}>
                Error toast
              </Button>
            </Specimen>

            <Subhead>Tooltip & modal</Subhead>
            <Specimen>
              <Tooltip label="Verified with evidence">
                <Button variant="outline">
                  <Bell className="size-4" /> Hover me
                </Button>
              </Tooltip>
              <Button onClick={() => setModalOpen(true)}>Open modal</Button>
            </Specimen>
          </DsSection>

          {/* UTILITY */}
          <DsSection id="utility" eyebrow="Utility" title="States & scaffolding" description="Loading, skeletons, empty states and error boundaries handle the in-between moments.">
            <Subhead>Spinners</Subhead>
            <Specimen>
              <Spinner size="sm" />
              <Spinner size="md" />
              <Spinner size="lg" />
            </Specimen>

            <Subhead>Skeletons</Subhead>
            <div className="grid gap-4 sm:grid-cols-2">
              <SkeletonCard />
              <div className="space-y-3 rounded-xl border border-border bg-card p-5">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>

            <Subhead>Empty state</Subhead>
            <EmptyState
              icon={<Compass className="size-5" aria-hidden="true" />}
              title="No opportunities yet"
              description="When opportunities match your skills, they'll show up here."
              action={<Button size="sm">Browse all opportunities</Button>}
            />

            <Subhead>Error boundary fallback</Subhead>
            {showError ? (
              <ErrorFallback onRetry={() => setShowError(false)} />
            ) : (
              <div className="rounded-xl border border-success/30 bg-success/5 px-6 py-10 text-center">
                <p className="text-sm font-medium text-success">Recovered — content rendered successfully.</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => setShowError(true)}>
                  Reset demo
                </Button>
              </div>
            )}
          </DsSection>

          <footer className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-border pt-8 sm:flex-row">
            <Logo />
            <p className="text-sm text-muted-foreground">VOLUNTEER CONNECT component library</p>
            <Link href="/design-system" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
              View design tokens
            </Link>
          </footer>
        </main>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Confirm application" description="Send your profile and CV to EarthWise Foundation?">
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              setModalOpen(false)
              toast({ tone: "success", title: "Application sent", description: "EarthWise Foundation will be in touch." })
            }}
          >
            Send application
          </Button>
        </div>
      </Modal>
    </div>
  )
}
