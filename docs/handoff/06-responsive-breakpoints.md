# 06 — Responsive breakpoints

The prototype uses **Tailwind default breakpoints**. Do not introduce custom breakpoints unless a layout cannot be expressed with these.

| Token | Min width | Typical device |
| --- | --- | --- |
| (default) | 0 | Phone portrait |
| `sm` | 640px | Large phone / small tablet |
| `md` | 768px | Tablet |
| `lg` | 1024px | Laptop |
| `xl` | 1280px | Desktop |
| `2xl` | 1536px | Wide desktop |

Mobile-first: unprefixed classes are the small-screen default; prefix only the overrides.

## Shells

### Marketing (`/`)

| Viewport | Behavior |
| --- | --- |
| &lt; `md` | Single column hero; nav anchors hidden; floating “7 verified skills” card hidden (`sm:block` from 640px) |
| `md+` | Hero 2-col; header nav visible |
| `lg+` | How-it-works 5 columns; features 3 columns |

Padding: `px-4` → `sm:px-6`. Section vertical: `py-16` / hero `md:py-24`. Max width `max-w-6xl`.

### AuthShell

| Viewport | Behavior |
| --- | --- |
| &lt; `lg` | Form only, `px-4 py-10` → `sm:px-8` |
| `lg+` | 2-col grid; brand panel visible |

Password + confirm: stack → `sm:grid-cols-2`.

### AppShell (authenticated)

| Viewport | Behavior |
| --- | --- |
| &lt; `md` | No sidebar. Top bar `h-14` (logo, avatar, logout). Horizontal scroll nav (`overflow-x-auto`) with all role links + footer links |
| `md+` | Sticky sidebar `w-60 h-screen`. No top bar. Main `px-4 py-6` → `sm:px-8 sm:py-8` |

Touch targets in the mobile nav must stay ≥ 44px tall (`py-1.5` + icon is tight — production should increase tap area).

### Modal

| Viewport | Behavior |
| --- | --- |
| &lt; `sm` | Bottom sheet, full width, `rounded-t-2xl`, no outer padding |
| `sm+` | Centered, `p-4` gutter, `rounded-2xl`, `max-w-lg` |

### Toast

| Viewport | Behavior |
| --- | --- |
| &lt; `sm` | Full-width stack, bottom inset, centered |
| `sm+` | `max-w-sm`, right-aligned |

## Page layouts

| Page | &lt; sm | sm | md | lg | xl |
| --- | --- | --- | --- | --- | --- |
| Dashboard | 1 col | Stats 4-col; checklist 2-col | — | Main 2/3 + rail 1/3 | — |
| Profile identity | Stacked avatar + edit | Row, edit top-right | — | — | — |
| Profile forms (onboarding) | 1 col | 2-col field grids | Stepper visible | — | — |
| Skills analysis | 1 col stats | 2-col stats | — | 4-col stats; 2/3 + 1/3 | — |
| CV toolbar | Stacked | Row, wrap | — | — | — |
| Portfolio hero | Stacked initials | Row | — | Main + 260px rail | — |
| Portfolio edit | 1 col | Detail fields 2-col | — | Theme + visibility 2-col | — |
| Opportunities | 1 col cards | — | 2-col cards | — | — |
| Opportunity detail | 1 col | — | — | 2/3 + apply rail | — |
| Applications | 1 col | — | 2-col kanban | — | 4-col kanban |
| Employer dashboard | 1 col | 3 stat cards | — | — | — |
| Employer post | 1 col | 2-col pairs | — | — | — |
| Admin overview | 1 col | 2-col stats | — | 4-col stats; 2/3 + taxonomy | — |
| Admin users | Card list | Filters row | **Table** (`md:block`); cards `md:hidden` | — | — |
| Help | 1 col | 3 quick links | — | FAQ 2/3 + form | — |
| Design system / components | 1 col | Swatch 4-col | — | Sticky section nav `w-44`/`w-48` | — |

## Typography at breakpoints

| Element | Default | Override |
| --- | --- | --- |
| Landing h1 | `text-4xl` | `sm:text-5xl` |
| Landing h2 | `text-2xl` | `sm:text-3xl` |
| In-app h1 | `text-2xl` | — |
| Design-system h1 | `text-3xl` | `sm:text-4xl` |
| Design-system h2 | `text-2xl` | `sm:text-3xl` |
| OTP digits | `text-2xl` | cells share width (`w-full` in a 6-col flex) |

Use `text-balance` on headings and `text-pretty` on supporting copy so wrap stays readable at 320px.

## Navigation density

| Region | Hidden below | Visible from |
| --- | --- | --- |
| Marketing section links | `md` | `md` |
| “Back to app” label on DS | `sm` (icon only) | `sm` |
| “Component library” pill | `sm` | `sm` |
| Portfolio visibility hint | `sm` | `sm` |
| Admin users table | `md` (cards instead) | `md` |
| Onboarding stepper labels | `sm` | `sm` |
| Auth brand panel | `lg` | `lg` |
| DS / gallery side nav | `lg` | `lg` |
| App sidebar | `md` | `md` |

## Grid recipes (copy these)

```txt
Stats (4):     grid-cols-2 sm:grid-cols-4
Stats (3):     sm:grid-cols-3
Stats (admin): sm:grid-cols-2 lg:grid-cols-4
Cards (3):     sm:grid-cols-2 lg:grid-cols-3
Opportunities: md:grid-cols-2
Kanban:        md:grid-cols-2 xl:grid-cols-4
Dashboard:     lg:grid-cols-3  (span-2 + rail)
Detail:        lg:grid-cols-3  (span-2 + rail)
Form pairs:    sm:grid-cols-2
```

## Touch and overflow

- Horizontal nav and tab lists: `overflow-x-auto` + `shrink-0` items — never wrap into a tall stack in the shell.
- Tables: wrap in `overflow-x-auto` (`DataTable`, admin users).
- Opportunity cards: `flex-wrap` on chip and meta rows.
- Page headers: `flex-col gap-4` → `sm:flex-row sm:items-center sm:justify-between`.
- Minimum supported width: **320px**. Test OTP (6 cells) and mobile nav overflow there.

## Images

Landing hero: `next/image`, `priority`, `object-cover`, `rounded-2xl`. `next.config.mjs` sets `images.unoptimized: true` — production should enable optimization and real `sizes`.

## Print

CV page is the only print target. Hide AppShell chrome in production `@media print`. Prototype relies on user print dialog + `print:border-0 print:shadow-none` on the CV card.

## Implementation checklist

- [ ] Sidebar hidden, mobile nav usable at 375×667
- [ ] Auth brand panel gone at 768, present at 1024
- [ ] Opportunity grid 1 → 2 columns at 768
- [ ] Applications 4 columns only at 1280+
- [ ] Admin users: cards on phone, table on tablet
- [ ] Modal is a sheet on phone, dialog on tablet
- [ ] No horizontal page scroll except intentional nav/table
- [ ] Focus rings visible on all breakpoints
- [ ] Sticky headers (`z-30`/`z-40`) do not cover toasts (`z-60`)
