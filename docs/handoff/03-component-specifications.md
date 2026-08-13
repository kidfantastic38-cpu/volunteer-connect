# 03 — Component specifications

Components are grouped the same way as `/components` and `/design-system`. Implement new screens from these primitives; do not invent parallel button, input, or badge styles.

## 1. Foundation

### Button

| | |
| --- | --- |
| File | `components/ui/button.tsx` |
| Primitive | `@base-ui/react/button` |
| Variants | `class-variance-authority` → `buttonVariants` |

**Variants**

| `variant` | Visual | Intent |
| --- | --- | --- |
| `default` | Primary fill | Primary action |
| `secondary` | Soft fill | Alternate / marketing on primary band |
| `outline` | Border, transparent | Secondary action |
| `ghost` | No chrome until hover | Tertiary, cancel, icon toolbars |
| `destructive` | Soft red fill | Delete, irreversible |
| `link` | Primary text + underline on hover | Inline navigation |

**Sizes**

| `size` | Height | Notes |
| --- | --- | --- |
| `xs` | 24px | Dense tables |
| `sm` | 28px | Toolbars, cards |
| `default` | 32px | Standard |
| `lg` | 36px | Emphasized |
| `icon` / `icon-xs` / `icon-sm` / `icon-lg` | Square | Icon-only; require `aria-label` |

**States:** default, hover, `focus-visible` ring, `active` 1px press, `disabled` 50% + no pointer, `aria-invalid` destructive ring, loading (pair with `Spinner`, disable the control).

**Rules:** One primary button per cluster. Destructive always needs a confirm modal for irreversible actions.

### ButtonLink

| | |
| --- | --- |
| File | `components/button-link.tsx` |
| Props | Next `Link` props + `variant`, `size`, `sizeUp?: boolean` |

`sizeUp` forces `h-11 px-6` for marketing CTAs. Use instead of wrapping `<Button>` in `<Link>`.

### Chip

| | |
| --- | --- |
| File | `components/ui-bits.tsx` |
| Props | `tone?: "muted" \| "primary" \| "accent" \| "success" \| "outline"`, `children`, `className` |

Pill, `text-xs font-medium`, `rounded-full`. Used for opportunity type, remote, application status, interests, skill tags.

### VerifiedBadge

| | |
| --- | --- |
| File | `components/ui-bits.tsx` |
| Props | `label?: string` (default `"Verified"`) |

Success-tinted pill + `ShieldCheck`. Use only when `evidence.status === "verified"` or `skill.verified === true`.

### Logo

| | |
| --- | --- |
| File | `components/logo.tsx` |
| Props | `showText?: boolean` (default true), `className` |

Sparkles mark + `Volunteer` + `Connect` (primary). On the auth aside, invert wordmark via `[&_span:last-child]:text-primary-foreground`.

---

## 2. Layout shells

### AppShell

| | |
| --- | --- |
| File | `components/app-shell.tsx` |
| Props | `children`, `requiredRole?: "student" \| "employer" \| "admin"` |

**Behavior**

1. If `!loggedIn || !user` → session-reset card (demo login / register).
2. If `requiredRole` mismatches → restricted-area card with role-home link.
3. Else render role-aware sidebar + mobile header/nav + `<main>`.

**Student nav:** Dashboard, My Profile, Skills Analysis, CV Builder, Portfolio, Opportunities, Applications, Notifications. Footer: Settings, Help.

**Employer nav:** Dashboard, Post Opportunity, Candidates. Footer: Settings, Help.

**Admin nav:** Overview, User Management, Opportunities, Categories & Skills. No footer nav. Amber “Admin console” chip above links.

**Active state:** Exact path, or prefix match except for `/dashboard`, `/employer`, `/admin` roots.

**Notifications badge:** Unread count on `/notifications` as accent pill.

**Exports:** `Avatar` (initials, `size-9` default) and `PageHeader` (`title`, `description?`, `action?`). Note: a second `Avatar` exists in `ui-kit/data-display.tsx` with sizes and photo support — prefer that for lists/tables.

### AuthShell

| | |
| --- | --- |
| File | `components/auth-shell.tsx` |

Two-column from `lg`: form (`max-w-sm`) + primary brand panel (hidden below `lg`). Used by login, register, verify.

### MarketingHeader

| | |
| --- | --- |
| File | `components/marketing-header.tsx` |

Sticky, `h-16`, backdrop blur. Anchor links `#how` `#features` `#employers` hidden below `md`. CTA pair: Log in (ghost) + Get started.

### PageHeader

Title (`font-display text-2xl`) + optional description + optional action row. Stacks on mobile; row from `sm`.

---

## 3. Navigation

### Breadcrumbs

| | |
| --- | --- |
| File | `components/ui-kit/navigation.tsx` |
| Props | `items: { label: string; href?: string }[]` |

Last item is current (`aria-current="page"`, no link). Separators `ChevronRight`, `aria-hidden`.

### Tabs

| Props | `items: { id, label, badge? }[]`, `value`, `onChange` |
| --- | --- |
| A11y | `role="tablist"` / `role="tab"` / `aria-selected` |

Active: 2px primary underline. Horizontal scroll on overflow.

### Pagination

| Props | `page`, `total`, `onChange` |
| --- | --- |
| A11y | `nav aria-label="Pagination"`, prev/next labels |

Window of current ±1 plus first/last; ellipsis via `MoreHorizontal`. Disabled at ends.

---

## 4. Data display

### Avatar (`ui-kit`)

| Props | `name`, `size?: "sm" \| "md" \| "lg"`, `tone?`, `src?` |
| --- | --- |
| Sizes | sm 32px, md 40px, lg 56px |

Initials from first two words. Tone cycles `--chart-1`…`--chart-5` from name length unless `tone` is passed. `src` renders an `<img>` (unoptimized in prototype).

### DataTable

| Props | `columns: Column<T>[]`, `rows`, `getKey`, `caption?`, `empty?` |
| --- | --- |

Horizontal scroll wrapper, `sr-only` caption, hover row `bg-muted/40`. Empty: single cell spanning all columns.

`Column<T>`: `key`, `header`, `cell(row)`, `align?`, `className?`.

### DataList / DataListItem

Bordered, divided list. Item: optional `leading`, `title`, `subtitle`, `trailing`. Truncate title/subtitle.

### StatCard

`label`, `value`, optional `delta: { value, positive? }`, optional `icon`. Delta uses ▲ success / ▼ destructive.

### MiniBarChart

`data: { label, value }[]`. Bars scale to max. `role="img"` + `aria-label="Bar chart"`. Hover darkens bar.

### ProgressBar

`value` 0–100, clamped. Track `h-2 rounded-full bg-muted`, fill `bg-primary`.

### MatchRing

SVG ring, default `size={56}`, stroke 6. Color: ≥70 success, ≥40 primary, else muted. Center label `{value}%`.

### SkillBar

`name`, `level` 1–5, `verified?`. Five segment ticks; filled = primary.

### EmptyState

Dashed card, optional icon in muted circle, title, description, optional action. Required for zero-data lists (applications, opportunities search, skills, employer posts).

---

## 5. Forms

### Field / Label / FieldError

| File | `components/form-controls.tsx` |
| --- | --- |
| Field props | `label`, `htmlFor?`, `hint?`, `error?`, `children` |

Hint shows only when there is no error. Error is `text-xs font-medium text-destructive`.

### Input / Textarea / Select

Shared base: `h-10` (textarea `min-h-24`), `rounded-lg`, `border-input`, focus ring `ring-3 ring-ring/30`, disabled 50%. Aliases: `TextInput`, `TextArea`, `SelectInput`.

Invalid: set `aria-invalid` and `border-destructive ring-destructive/20` (see design-system specimen).

### Toggle

`role="switch"`, 44×24px track, thumb translates 20px when on. Label + optional description on the left.

### Checkbox

Button `role="checkbox"`. Checked: primary fill + check icon. Optional description. Disabled 50%.

### RadioGroup

`role="radiogroup"`. Options: `value`, `label`, `description?`. Active card: `border-primary bg-primary/5`. Native radio is `sr-only`.

### FileUpload

| Props | `accept?` (helper text, default `"PDF, PNG, JPG up to 10MB"`), `onFiles?: (File[]) => void` |
| --- | --- |

Drag-and-drop + click + keyboard (Enter/Space). Dragging: primary dashed border. Lists files with size and remove. Prototype does not persist bytes — production must upload and virus-scan (see tech reqs).

### SkillTagInput (onboarding-local)

Enter or Add appends a unique chip; × removes. Reuse this pattern on profile skill fields.

---

## 6. Feedback

### Alert

| File | `components/ui-kit/feedback.tsx` |
| --- | --- |
| Props | `tone?: "info" \| "success" \| "warning" \| "error"`, `title`, `children?`, `action?` |
| A11y | `role="alert"` |

### Toast

| File | `components/toast.tsx` |
| --- | --- |
| API | `useToast().toast({ title, description?, tone?, duration? })` |

Tones: success, info, warning, error. Default duration **4000ms**. Region: `aria-label="Notifications"`, each toast `role="status"` `aria-live="polite"`. Dismiss button required. Stack from bottom; right-aligned from `sm`.

`ToastProvider` wraps the app in `app/layout.tsx`.

### Tooltip

CSS-only. `label`, `side?: "top" \| "bottom"`. Shows on hover and `focus-within`. `role="tooltip"`. Do not put essential info only in a tooltip.

### Modal

| File | `components/modal.tsx` |
| --- | --- |
| Props | `open`, `onClose`, `title`, `description?`, `children` |

- `role="dialog"` `aria-modal="true"`
- Escape closes; backdrop mousedown closes
- `document.body.style.overflow = "hidden"` while open
- Mobile: bottom sheet (`items-end`, `rounded-t-2xl`)
- `sm+`: centered, `rounded-2xl`, `max-w-lg`, `shadow-2xl`
- Always include an explicit close control

---

## 7. Utility

### Spinner

`size?: "sm" \| "md" \| "lg"`, `label?: string` (sr-only, default `"Loading"`). `role="status"`.

### Skeleton / SkeletonCard

Pulse `bg-muted`. `aria-hidden`. Use `SkeletonCard` for list/card placeholders.

### ErrorFallback / ErrorBoundary

Fallback: destructive-tinted empty state + optional Retry. `ErrorBoundary` is a class component; pass custom `fallback` or default `ErrorFallback`.

---

## 8. Product composites

These are screen-level patterns, not generic kit.

| Composite | File | Spec |
| --- | --- | --- |
| Profile sections | `components/profile-sections.tsx` | `SectionShell` + add modal + `RowCard` delete + `EvidenceList` |
| Identity card | `app/profile/page.tsx` | Initials tile, headline, location, email, interests, edit modal |
| Opportunity card | `app/opportunities/page.tsx` | Type/remote chips, title, org, match ring, 2-line clamp, skills, meta, View / Quick apply / Save |
| Application column | `app/applications/page.tsx` | Kanban column with count chip |
| Notification row | `app/notifications/page.tsx` | Kind icon, unread dot, relative time, optional `href` |
| CV preview | `app/cv/page.tsx` | Templates `modern` / `classic` / `compact` |
| Portfolio hero | `app/portfolio/page.tsx` | Themes `aurora` / `minimal` / `bold` |
| Role card | `app/register/page.tsx` | `aria-pressed` student/employer selector |
| OTP inputs | `app/verify/page.tsx` | 6 numeric cells, paste-aware |
| FAQ accordion | `app/help/page.tsx` | Single-open, `aria-expanded`, chevron rotate |

### EvidenceList

Each evidence chip: type icon + label + `ShieldCheck` (verified) or `Clock3` (pending). Types: `certificate`, `reference`, `photo`, `link`, `document`.

### Profile SectionShell

`id` (scroll target for `?tab=` deep links), title + count, outline Add button, children or dashed empty row.

---

## 9. Composition rules

1. **Cards** = `rounded-2xl border border-border bg-card` + `p-5`/`p-6` + optional `shadow-e1`.
2. **Page title** = `font-display text-2xl font-bold tracking-tight`.
3. **Section title** = `font-display text-lg font-semibold`.
4. **Primary + ghost** for modal footers (Cancel ghost, Confirm primary).
5. **MatchRing** only for opportunity/candidate fit — never for profile strength (use `ProgressBar`).
6. **EmptyState** before inventing a custom zero UI.
7. **Icons** from Lucide only; keep stroke consistent (default Lucide).
8. **No new color tokens** without adding them to `globals.css` and the design-system gallery.
