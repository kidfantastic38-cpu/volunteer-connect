# 05 — Interaction specifications

Normative behavior for controls, validation, motion, and feedback. If a screen contradicts this file, this file wins for production.

## Global interaction principles

1. **Supportive, not punitive.** Errors explain how to fix the field. Never shame incomplete profiles.
2. **One primary action** per cluster. Cancel is ghost; confirm is primary; delete is destructive + modal.
3. **Optimistic where safe.** Toggles, filters, template/theme, and save/bookmark update immediately.
4. **Explicit for irreversible work.** Apply, publish, delete account, remove opportunity.
5. **Keyboard and screen reader first.** Every icon button has a name; dialogs are modal; live regions announce toasts.

## Timing

| Interaction | Delay | Notes |
| --- | --- | --- |
| Login submit | 600ms | Then success or form error |
| Demo / admin login | 400ms | Then navigate |
| Register submit | 650ms | Then `/verify` |
| OTP verify | 700ms + 900ms success | Then `next` |
| Toast auto-dismiss | 4000ms | `duration: 0` = sticky |
| Password saved message | 2500ms | Settings |
| Account saved message | 2000ms | Settings |
| Portfolio “Link copied” | 2000ms | Clipboard |
| Help form sent | 3500ms | Local only |
| OTP resend cooldown | 30s | Then enabled |
| “Code resent” flash | 2500ms | |
| Tooltip fade | 150ms | Hover / focus-within |
| Button press | 1px translateY | Active, not for `haspopup` |

Production API calls should use the same loading affordances (spinner in button, disabled submit) with real latency, plus timeouts and retry on network failure.

## Focus

| Control | Focus treatment |
| --- | --- |
| Button | `focus-visible:border-ring` + `ring-3 ring-ring/50` |
| Input / textarea / select | `focus-visible:border-ring` + `ring-3 ring-ring/30` |
| Checkbox / switch / file drop | `focus-visible:ring-3 ring-ring/30` |
| Invalid field | `border-destructive` + `ring-3 ring-destructive/20` |
| OTP cell | Same as input; error paints all cells destructive |

Do not remove focus outlines. Tab order follows visual order. Modal: Escape and backdrop close; production must **trap focus** inside the dialog (prototype does not trap).

## Pointer and hover

| Surface | Hover |
| --- | --- |
| Ghost / outline button | `bg-muted` |
| Primary button | `bg-primary/80` (via `[a]:hover` on links) |
| Nav item (inactive) | `bg-muted text-foreground` |
| Table row | `bg-muted/40` |
| Opportunity / match row | `bg-muted` or `border-primary` on stat tiles |
| Notification row | `bg-muted/50` |
| Chip filter (inactive) | `text-foreground` |
| Chart bar | `bg-primary` (from `/80`) |
| Link | underline + primary |

Cursor `pointer` on all clickable cards and the file dropzone. Disabled: `opacity-50` + `pointer-events-none` (buttons) or `cursor-not-allowed` (checkbox).

## Keyboard

| Control | Keys |
| --- | --- |
| Buttons / links | Enter, Space |
| Modal | Escape closes |
| OTP | Digits; Backspace moves to previous empty cell; paste fills |
| Skill tags | Enter adds (ignore IME `isComposing`) |
| File dropzone | Enter / Space opens file picker |
| Tabs | Click only in prototype — production: Arrow Left/Right + Home/End |
| FAQ | Enter / Space on the header button |
| Pagination | Activate numbered buttons; disabled prev/next skipped |

## Form validation

Validate on submit (`noValidate` on auth forms). Show field errors under the control; form-level errors in a `role="alert"` banner.

### Login

| Field | Rule |
| --- | --- |
| Email | Required |
| Password | Required |
| Credentials | Must be `amara@example.com` (prototype) |

### Register

| Field | Rule |
| --- | --- |
| Name | Required (trimmed) |
| Email | Required, `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`, not `amara@example.com` |
| Password | Required, min 6 |
| Confirm | Must equal password |

### Onboarding add-row

| Section | Enable Add when |
| --- | --- |
| Education | Institution + qualification non-empty |
| Experience | Role + organization non-empty |
| Project | Title non-empty |
| Achievement | Title non-empty |
| Basics | Always; empty headline → “Aspiring professional” |

Interests: split on comma, trim, drop empties.

### Settings password

Current required; new ≥ 6; confirm matches. Success and error share an inline message with tone.

### Help contact

Subject and message required (trimmed). No field-level errors — button simply no-ops if empty.

### Opportunity post

HTML `required` on title and organisation. Skills: comma-separated → trimmed array. Empty location + remote → `"Remote"`; else `"—"`. Empty deadline → `"Open"`.

### OTP

Fewer than 6 digits: “Enter all six digits.” Wrong code: match error. Success: full-page confirmed state.

## Selection controls

| Pattern | Selected | Unselected |
| --- | --- | --- |
| Role card | `border-primary bg-primary/5 ring-1 ring-primary`, icon on primary | `border-border`, hover muted |
| Filter chip | `bg-primary text-primary-foreground` | Bordered muted |
| Theme / visibility row | `border-primary bg-primary/5` + check | Bordered, hover muted |
| Radio card | Same as theme row | Bordered |
| Switch on | Track `bg-primary`, thumb `translate-x-5` | Track `bg-muted-foreground/30` |
| Checkbox on | `border-primary bg-primary` + check | `border-input` |
| Detected skill confirmed | `border-success/40 bg-success/10 text-success` + check | Bordered, hover primary tint |
| Nav active | `bg-primary text-primary-foreground` | Muted, hover muted fill |

## Overlay behavior

### Modal

- Open: lock body scroll.
- Close: Escape, backdrop (`mousedown` on overlay), X, Cancel.
- Mobile: dock to bottom, `max-h-[92vh]`, scroll body.
- Desktop (`sm+`): center, `max-w-lg`, `p-4` inset.
- After apply success, closing resets local `done` / `note`.

### Toast

- Stack bottom-center on mobile; bottom-right from `sm`.
- `z-[60]` above modal (`z-50`).
- Manual dismiss via X (`aria-label="Dismiss notification"`).

### Tooltip

- Hidden until hover or focus-within.
- `pointer-events-none`; never the only way to get a label.

## Loading and empty

| State | Pattern |
| --- | --- |
| Submit in progress | Spinner in button + “Logging in…” / “Creating account…” / “Verifying…”; button disabled |
| Page data loading | `Skeleton` / `SkeletonCard` (kit; unused on most prototype pages) |
| Zero list | `EmptyState` + one CTA |
| Section error | `ErrorFallback` + Try again |
| Session gone | Session-reset card, not a spinner |
| Wrong role | Restricted-area card |

## Match ring and progress

| Value | Ring color | Copy guidance |
| --- | --- | --- |
| ≥ 70 | Success | Strong match |
| 40–69 | Primary | Partial |
| &lt; 40 | Muted | Stretch |

Progress bars always primary fill. Profile strength is a bar, not a ring.

## Notifications inbox

- Unread: faint primary wash + 8px primary dot (`aria-label="Unread"`).
- Click marks read then navigates.
- Sidebar badge: accent pill, hidden at 0.

## Clipboard and print

- Portfolio share: `navigator.clipboard.writeText` — ignore failure, still show “Link copied”.
- CV export: `window.print()`. Production should ship `@media print` rules (prototype already `print:border-0 print:shadow-none` on the CV card) and a real PDF pipeline.

## Theme toggle

- `aria-pressed` reflects dark once mounted.
- Label flips: “Dark mode” / “Light mode” with Moon / Sun.
- Persist `vc-theme`. Do not flash the wrong theme: wait for mount before showing the opposite icon.

## Motion reduction

Prototype does not honor `prefers-reduced-motion`. Production **must**:

- Disable `animate-spin` / `animate-pulse` / toast slide (use fade or instant).
- Keep focus rings and color changes.
- Avoid the 1px button press if it causes vestibular issues (optional).

## Copy tone

- Headlines: confident, second person (“Your skills, showcased”).
- Errors: specific and calm.
- Success: name the outcome (“Application sent”, “Opportunity published”).
- Empty: what will appear and the next action.
- Never “you don’t have enough experience.” Prefer “Add an experience to detect skills.”
