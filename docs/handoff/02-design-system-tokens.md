# 02 — Design system tokens

All visual values flow from CSS custom properties in `app/globals.css`. Tailwind v4 maps them in `@theme inline`. Change a token once; light and dark stay in sync.

Live gallery: `/design-system`.

## Color space

Tokens use **OKLCH**. Do not introduce raw hex in product UI except for rare one-off illustrations.

## Light theme (`:root`)

| Token | OKLCH | Role |
| --- | --- | --- |
| `--background` | `0.985 0.005 275` | App canvas |
| `--foreground` | `0.24 0.03 275` | Primary text |
| `--card` | `1 0 0` | Raised surfaces |
| `--card-foreground` | `0.24 0.03 275` | Text on cards |
| `--popover` | `1 0 0` | Toasts, overlays |
| `--popover-foreground` | `0.24 0.03 275` | Overlay text |
| `--primary` | `0.5 0.2 276` | Brand indigo — actions, links, focus |
| `--primary-foreground` | `0.99 0.005 275` | Text on primary |
| `--secondary` | `0.955 0.015 275` | Quiet fills, chips |
| `--secondary-foreground` | `0.35 0.06 276` | Text on secondary |
| `--muted` | `0.955 0.012 275` | Subtle fills, skeletons |
| `--muted-foreground` | `0.52 0.03 275` | Secondary copy |
| `--accent` | `0.82 0.15 74` | Optimistic amber — celebration, unread |
| `--accent-foreground` | `0.28 0.05 60` | Text on accent |
| `--destructive` | `0.577 0.245 27.325` | Errors, remove |
| `--destructive-foreground` | `0.99 0.01 20` | Text on destructive |
| `--success` | `0.62 0.15 155` | Verified, complete |
| `--success-foreground` | `0.99 0.01 155` | Text on success |
| `--warning` | `0.75 0.15 75` | Pending, attention |
| `--warning-foreground` | `0.28 0.05 60` | Text on warning |
| `--info` | `0.6 0.13 235` | Tips, neutral notices |
| `--info-foreground` | `0.99 0.01 235` | Text on info |
| `--border` | `0.9 0.012 275` | Hairline borders |
| `--input` | `0.9 0.012 275` | Input borders |
| `--ring` | `0.5 0.2 276` | Focus ring (matches primary) |

### Chart series

| Token | Light OKLCH | Use |
| --- | --- | --- |
| `--chart-1` | `0.5 0.2 276` | Primary series / avatar tone |
| `--chart-2` | `0.82 0.15 74` | Accent series |
| `--chart-3` | `0.62 0.15 155` | Success series |
| `--chart-4` | `0.6 0.16 320` | Magenta series |
| `--chart-5` | `0.65 0.15 220` | Blue series |

### Sidebar

| Token | Role |
| --- | --- |
| `--sidebar` | AppShell aside background |
| `--sidebar-foreground` | Default nav text |
| `--sidebar-primary` | Active nav fill |
| `--sidebar-primary-foreground` | Active nav text |
| `--sidebar-accent` | Hover / secondary nav fill |
| `--sidebar-accent-foreground` | Hover nav text |
| `--sidebar-border` | Aside divider |
| `--sidebar-ring` | Focus inside sidebar |

## Dark theme (`.dark`)

| Token | OKLCH | Notes |
| --- | --- | --- |
| `--background` | `0.18 0.02 276` | Deep indigo canvas |
| `--foreground` | `0.95 0.01 275` | Near-white text |
| `--card` / `--popover` | `0.225 0.025 276` | Lifted surface |
| `--primary` | `0.68 0.16 276` | Lighter indigo for contrast |
| `--primary-foreground` | `0.16 0.03 276` | Dark text on primary |
| `--secondary` | `0.28 0.03 276` | Quiet fill |
| `--muted` | `0.26 0.025 276` | Skeleton / chip fill |
| `--muted-foreground` | `0.7 0.03 275` | Secondary copy |
| `--accent` | `0.82 0.15 74` | Same amber (celebration stays warm) |
| `--destructive` | `0.65 0.2 25` | Brighter error |
| `--success` | `0.7 0.15 155` | Brighter success |
| `--warning` | `0.78 0.15 75` | Brighter warning |
| `--info` | `0.68 0.13 235` | Brighter info |
| `--border` | `1 0 0 / 12%` | White at 12% |
| `--input` | `1 0 0 / 15%` | White at 15% |
| `--ring` | `0.68 0.16 276` | Matches dark primary |

Theme class is toggled on `<html>` by `ThemeToggle`. Preference key: `localStorage.vc-theme` = `light` | `dark`. First visit follows `prefers-color-scheme`.

## Tailwind class mapping

| CSS variable | Utility |
| --- | --- |
| `--color-primary` | `bg-primary`, `text-primary`, `border-primary` |
| `--color-accent` | `bg-accent`, `text-accent-foreground` |
| `--color-success` | `bg-success`, `text-success` |
| `--color-warning` | `bg-warning` |
| `--color-info` | `bg-info` |
| `--color-destructive` | `bg-destructive` |
| `--color-muted` | `bg-muted`, `text-muted-foreground` |
| `--color-card` | `bg-card`, `text-card-foreground` |
| `--color-border` | `border-border` |
| `--color-ring` | `ring-ring` |
| `--shadow-e1` … `--shadow-e5` | `shadow-e1` … `shadow-e5` |
| `--font-sans` | `font-sans` (Inter) |
| `--font-display` | `font-display` (Space Grotesk) |

Tints: `bg-primary/10`, `bg-success/15`, `border-destructive/30`. Prefer these over new tokens.

## Typography

Loaded in `app/layout.tsx` via `next/font/google`.

| Family | CSS variable | Tailwind | Use |
| --- | --- | --- | --- |
| **Space Grotesk** | `--font-space-grotesk` | `font-display` | Page titles, section heads, brand wordmark, OTP digits, large stats |
| **Inter** | `--font-inter` | `font-sans` (body default) | Body, labels, UI, long-form |

### Scale

| Class | Size | Use |
| --- | --- | --- |
| `text-xs` | 12px | Captions, metadata, badges, hints |
| `text-sm` | 14px | Body in app chrome, labels, secondary text |
| `text-base` | 16px | Default paragraph (marketing) |
| `text-lg` | 18px | Lead paragraphs, card titles |
| `text-xl` | 20px | Section subheadings |
| `text-2xl` | 24px | In-app page titles (`PageHeader`, dashboard h1) |
| `text-3xl` | 30px | Dashboard / marketing section heads |
| `text-4xl` | 36px | Hero / display (`sm:text-5xl` on landing) |

### Weights

| Class | Weight | Use |
| --- | --- | --- |
| `font-normal` | 400 | Body |
| `font-medium` | 500 | Labels, nav, chips |
| `font-semibold` | 600 | Card titles, alert titles |
| `font-bold` | 700 | Display headings, wordmark |

Line height: body `leading-relaxed` (1.5–1.6). Headings `tracking-tight` + `text-balance`. Long copy `text-pretty`.

## Spacing (8px grid, 4px half-step)

| Token (docs) | Tailwind | px | rem | Typical use |
| --- | --- | --- | --- | --- |
| space-1 | `p-1` / `gap-1` | 4 | 0.25 | Chip gaps, icon padding |
| space-2 | `p-2` / `gap-2` | 8 | 0.5 | Tight control groups |
| space-3 | `p-3` / `gap-3` | 12 | 0.75 | List rows, compact cards |
| space-4 | `p-4` / `gap-4` | 16 | 1 | Default card padding (mobile) |
| space-5 | `p-5` | 20 | 1.25 | Stat cards |
| space-6 | `p-6` / `gap-6` | 24 | 1.5 | Section cards |
| space-8 | `p-8` / `gap-8` | 32 | 2 | Page padding (`sm:px-8`) |
| space-10 | `py-10` | 40 | 2.5 | Marketing section rhythm |
| space-12 | `gap-12` | 48 | 3 | Large section gaps |
| space-16 | `py-16` | 64 | 4 | Marketing vertical rhythm |

Content widths:

| Token | Value | Use |
| --- | --- | --- |
| Marketing / DS | `max-w-6xl` (72rem) | Landing, design system, component library |
| Onboarding | `max-w-3xl` (48rem) | Wizard |
| Portfolio | `max-w-4xl` (56rem) | Public page |
| Auth form | `max-w-sm` (24rem) | Login / register / verify |
| Settings | `max-w-2xl` (42rem) | Account + privacy |
| Employer post | `max-w-2xl` | Opportunity form |
| App sidebar | `w-60` (15rem) | Desktop nav |

## Radius

Base `--radius: 0.75rem` (12px).

| Utility | Formula | Use |
| --- | --- | --- |
| `rounded-md` | `calc(var(--radius) * 0.8)` ≈ 9.6px | Inputs, small controls |
| `rounded-lg` | `var(--radius)` = 12px | Buttons, chips, nav items |
| `rounded-xl` | `calc(var(--radius) * 1.4)` ≈ 16.8px | Cards, alerts, file dropzone |
| `rounded-2xl` | `calc(var(--radius) * 1.8)` ≈ 21.6px | Feature cards, modals, identity card |
| `rounded-full` | 9999px | Avatars, pills, progress tracks, match rings |

## Elevation

Indigo-tinted in light mode; neutral black in dark mode.

| Token | Light (approx) | Use |
| --- | --- | --- |
| `shadow-e1` | 1–3px soft indigo | Resting cards, list rows |
| `shadow-e2` | 2–8px | Raised cards, hover, tooltips |
| `shadow-e3` | 4–20px | Dropdowns, popovers |
| `shadow-e4` | 8–32px | Toasts, sheets |
| `shadow-e5` | 16–56px | Modal / command palette |

Prototype also uses `shadow-sm`, `shadow-md`, and `shadow-2xl` in a few marketing/modal spots. New work should prefer `shadow-e*`.

## Motion

| Token / class | Duration | Use |
| --- | --- | --- |
| `transition-colors` | default | Hover on nav, chips, buttons |
| `transition-all` | default | Progress bars, match rings |
| `transition-opacity duration-150` | 150ms | Tooltip reveal |
| `transition-transform` | default | Toggle thumb, FAQ chevron |
| `animate-spin` | — | Spinner / submit loaders |
| `animate-pulse` | — | Skeletons |
| `animate-in slide-in-from-bottom-2 fade-in` | — | Toast enter (`tw-animate-css`) |
| Active press | `translate-y-px` | Button (`active:not-aria-[haspopup]:translate-y-px`) |

No decorative gradients in product chrome except the portfolio hero (`bg-gradient-to-b` from theme tint to background). Do not add new gradients to dashboards.

## Iconography

- Library: **Lucide React** (`lucide-react`)
- Default size in buttons: `size-4` (16px)
- Decorative icons: `aria-hidden="true"`
- Interactive icon-only controls: `aria-label`
- Brand mark: Sparkles in a `size-8` `rounded-lg` primary square (`components/logo.tsx`)

## Contrast and accessibility

Target **WCAG 2.1 AA**.

- Primary on primary-foreground, success/destructive/info pairings, and muted-foreground on background are designed for AA.
- Focus: `focus-visible:border-ring` + `focus-visible:ring-3 focus-visible:ring-ring/30` (inputs) or `/50` (buttons).
- Do not place `text-muted-foreground` on `bg-muted` for essential actions.
- Dark mode must keep the same token pairing — never hardcode a light-only color.

## Theme toggle contract

| Item | Spec |
| --- | --- |
| Component | `ThemeToggle` |
| Storage | `localStorage["vc-theme"]` |
| DOM | `document.documentElement.classList.toggle("dark", isDark)` |
| Default | `prefers-color-scheme` when unset |
| Hydration | Render Moon/"Dark mode" until mounted to avoid mismatch |
| Placement | Design system + component library headers (not AppShell in the prototype) |

Production should add the toggle to `AppShell` and `MarketingHeader`, and set `color-scheme` consistently (already on `:root` / `.dark`).
