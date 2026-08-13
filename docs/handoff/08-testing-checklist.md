# 08 — Testing checklist

Manual QA for VOLUNTEER CONNECT. Prioritized for **demo success**: a live walkthrough must look polished, never trap the presenter, and prove the core story — experience → skills → CV/portfolio → matched opportunity.

**Prototype notes testers must know**

- State is in-memory plus `sessionStorage`. Refresh in the **same tab** restores the session. A new tab or logout starts clean.
- Demo student: `/login` → **Explore the demo profile (Amara)** or `amara@example.com` + any password.
- Demo admin: `/login` → **Enter the admin console**.
- OTP: `481920` (or any 6-digit code ending in an even digit).
- Evidence “uploads” are labels only — no files persist.
- Employer candidates are a hardcoded list, not live applicants.
- CV **Export PDF** opens the browser print dialog.

Mark each item: **Pass** / **Fail** / **Blocked** / **N/A** (production-only).

---

## Priority legend

| Priority | Meaning | Demo rule |
| --- | --- | --- |
| **P0** | Demo-critical | Must pass before any stakeholder walkthrough |
| **P1** | Demo-strong | Run if time; failures weaken the story |
| **P2** | Product-complete | Required for production sign-off, not the 10-minute demo |
| **P3** | Hardening | Edge, a11y depth, performance budgets |

**Suggested demo path (P0 spine):** Landing → Amara login → Dashboard → Profile → Skills → CV templates → Portfolio preview → Opportunities (filter + match ring) → Quick apply → Applications → Admin overview.

---

## 1. Functionality testing

### 1.1 Authentication (P0)

| # | Test | Steps | Expected |
| --- | --- | --- | --- |
| F-01 | Demo student login | `/login` → Explore the demo profile | Lands on `/dashboard` as Amara; sidebar shows student nav; sample data present |
| F-02 | Email login | `amara@example.com` + any password | Same as F-01 after ~600ms “Logging in…” |
| F-03 | Admin login | Enter the admin console | Lands on `/admin`; amber “Admin console” chip; admin nav only |
| F-04 | Login validation | Submit empty form | Email and password field errors; no navigation |
| F-05 | Unknown email | `other@example.com` + password | Alert: couldn’t find account; stay on login |
| F-06 | Register student | New name/email/password ≥6 / confirm | ~650ms → `/verify?next=/onboarding` |
| F-07 | Register employer | Role Employer + valid form | `/verify?next=/employer` |
| F-08 | Duplicate email | Register with `amara@example.com` | Inline: already registered |
| F-09 | OTP success | Enter `481920` | “Account verified” → next route |
| F-10 | OTP skip | Skip for now | Continues to next without `verified` |
| F-11 | Logout | Sidebar or mobile logout | Returns to `/`; session cleared |

**P1**

| # | Test | Expected |
| --- | --- | --- |
| F-12 | Password mismatch / short password | Confirm and min-length errors |
| F-13 | Invalid email format | “Enter a valid email address.” |
| F-14 | OTP incomplete | “Enter all six digits.” |
| F-15 | OTP wrong (odd last digit, not demo) | Error; stay on form |
| F-16 | OTP paste | Paste `481920` fills all cells |
| F-17 | OTP resend cooldown | Disabled with countdown; then “Code resent” |
| F-18 | `?role=employer` | Employer card preselected |

**P2 (production)**

| # | Test | Expected |
| --- | --- | --- |
| F-19 | Real password hash + wrong password | Generic auth error, no user enumeration |
| F-20 | Session survives refresh | Still logged in |
| F-21 | Password reset email | Link works once, expires |
| F-22 | 2FA enroll / challenge | Settings toggle is real |

### 1.2 Guided onboarding and profile strength (P0 / P1)

| # | Pri | Test | Expected |
| --- | --- | --- | --- |
| F-23 | P0 | Skip onboarding | Header Skip → `/dashboard`; strength can be 0% |
| F-24 | P0 | Complete Basics | Headline/location/about/interests save; step advances; checklist marks basics |
| F-25 | P1 | Add education / experience / project / achievement | Row appears; Add disabled until required fields filled |
| F-26 | P1 | Remove a just-added row | Row gone |
| F-27 | P1 | Skills step detects tags | Skills from experience/project shown; confirm adds level 3 unverified |
| F-28 | P0 | Finish wizard | `/dashboard`; strength reflects completed flags |
| F-29 | P0 | Profile strength bar | Percentage = completed steps / 6; checklist links work |

### 1.3 Student profile management (P0)

| # | Pri | Test | Expected |
| --- | --- | --- | --- |
| F-30 | P0 | Identity card | Name, headline, location, email, about, interest chips on Amara |
| F-31 | P0 | Edit profile modal | Change headline → Save → card updates; Cancel discards |
| F-32 | P0 | Experience list | Youth Mentor (current) + Marketing Intern; type labels; evidence chips |
| F-33 | P1 | Add experience | Modal save appends row; skills tags optional |
| F-34 | P1 | Delete experience | Row removed; dashboard count drops |
| F-35 | P1 | Education / projects / achievements / skills CRUD | Add + delete; counts update |
| F-36 | P1 | Dashboard `?tab=` links | Scroll/focus education, experience, projects, achievements, skills |
| F-37 | P2 | Edit existing row | Production: in-place edit (prototype is add/remove only) |

### 1.4 Education, experience, projects, leadership (P1)

| # | Test | Expected |
| --- | --- | --- |
| F-38 | Education fields | Institution, qualification, field, grade, start, end persist on add |
| F-39 | Experience types | Volunteer / internship / work all selectable and labeled |
| F-40 | Hours / current role | Current + hours display on Youth Mentor (240h) |
| F-41 | Project categories | School / community / personal |
| F-42 | Project outcome | Outcome text shows on profile and CV |
| F-43 | Achievement categories | Award / certification / leadership |
| F-44 | Leadership as achievement | Can add a leadership activity and see it on CV |

### 1.5 Skills and experience-to-skill mapping (P0 / P1)

| # | Pri | Test | Expected |
| --- | --- | --- | --- |
| F-45 | P0 | Skills analysis with Amara | Totals, verified ratio, avg proficiency, strongest category |
| F-46 | P0 | Category bars | Communication / Leadership / etc. with counts |
| F-47 | P1 | Skill gaps | Skills demanded by listings Amara lacks, with role counts |
| F-48 | P1 | Empty skills | New account → empty state + Build my profile |
| F-49 | P1 | Mapping | Onboarding/profile tags become skills with a source |
| F-50 | P1 | Proficiency 1–5 | SkillBar segments match level |
| F-51 | P0 | Verified vs pending | VerifiedBadge / “Verified” only on verified skills/evidence |

### 1.6 Evidence (P1 prototype / P2 production)

| # | Pri | Test | Expected |
| --- | --- | --- | --- |
| F-52 | P1 | Evidence chips | Certificate, reference, photo, link, document icons; check vs clock |
| F-53 | P1 | FileUpload UI (`/components`) | Drag, browse, list, remove; helper “PDF, PNG, JPG up to 10MB” |
| F-54 | P2 | Real upload | File stored, size/type rejected over 10MB or wrong MIME |
| F-55 | P2 | Verification workflow | Referee confirms → status verified → match score rises |

### 1.7 CV generator (P0)

| # | Test | Expected |
| --- | --- | --- |
| F-56 | Amara CV has content | Profile, experience, projects, skills, achievements, education |
| F-57 | Modern template | Primary header band, light text |
| F-58 | Classic template | Transparent header, 3px foreground rule |
| F-59 | Compact template | Tighter spacing; more fits on one page |
| F-60 | Template persists in session | Switch away and back; last template kept |
| F-61 | Print | Print dialog; CV card has no extra chrome shadow |
| F-62 | Export PDF | Same as print in prototype |
| F-63 | Empty CV | New user → EmptyState → profile |
| F-64 | Verified skill mark | Verified skills show ✓ |

### 1.8 Digital portfolio (P0 / P1)

| # | Pri | Test | Expected |
| --- | --- | --- | --- |
| F-65 | P0 | Preview `/portfolio` | Hero, tagline, stats, experience, projects, skills |
| F-66 | P0 | Themes aurora / minimal / bold | Accent and hero tint change immediately |
| F-67 | P1 | Visibility public / unlisted / private | Chip/hint updates; settings/privacy stays in sync |
| F-68 | P1 | Slug sanitize | Illegal chars become `-`; prefix `vc.app/` |
| F-69 | P1 | Show contact / evidence toggles | Email and evidence badges hide/show |
| F-70 | P0 | Publish | Draft → Live / Published |
| F-71 | P0 | Share | “Link copied” for ~2s; clipboard has current URL |
| F-72 | P2 | Public `/p/:slug` | Unauthenticated view honors visibility |

### 1.9 Opportunities marketplace (P0)

| # | Test | Expected |
| --- | --- | --- |
| F-73 | All six seed listings render | Job, internship, scholarship, volunteering, training represented |
| F-74 | Ranked by match | Amara: Sustainability Assistant near top (~high 90s) |
| F-75 | Type filters | All / Job / Internship / Scholarship / Volunteering / Training |
| F-76 | Search | “EarthWise” or “Leadership” filters list |
| F-77 | Empty search | EmptyState, no crash |
| F-78 | Card meta | Location, deadline, compensation, remote chip, skills |
| F-79 | View details | `/opportunities/op-1` (or id) with about + skill breakdown |
| F-80 | Unknown id | EmptyState + back to list |
| F-81 | Bookmark | Bookmark icon → Saved; appears in Applications Saved |
| F-82 | Quick apply | Modal → match ring + optional note → submitted |
| F-83 | Detail apply | Same success; status chip Applied |
| F-84 | Re-apply | Already-applied shows success, no second submit |
| F-85 | Related listings | Same type, up to 3, not self |

### 1.10 Applications (P0)

| # | Test | Expected |
| --- | --- | --- |
| F-86 | Empty pipeline | EmptyState + browse CTA |
| F-87 | After save + apply | Cards in Saved and Applied |
| F-88 | Column counts | Chip count matches cards |
| F-89 | Interview / offer | If status set, card in that column (demo data may not include) |
| F-90 | Rejected | Type exists; board does not show a Rejected column (known gap) |

### 1.11 Dashboard, notifications, settings, help (P0 / P1)

| # | Pri | Test | Expected |
| --- | --- | --- | --- |
| F-91 | P0 | Dashboard greeting | “Welcome back, Amara”; headline; 4 stat tiles with counts |
| F-92 | P0 | Top 3 matches | Match rings; link to opportunities |
| F-93 | P0 | Skills rail + CTAs | CV and portfolio buttons work |
| F-94 | P1 | Notifications (Amara) | Unread badge 2; kinds styled; click marks read + navigates |
| F-95 | P1 | Mark all as read | Badge gone; subtitle “all caught up” |
| F-96 | P1 | Settings save name/email | “Saved” flash ~2s |
| F-97 | P1 | Password form | Validation messages; success “Password updated.” |
| F-98 | P1 | Delete account modal | Confirm → `/` and logged out |
| F-99 | P1 | Privacy toggles | Searchable / employers / analytics / emails / match alerts persist in session |
| F-100 | P1 | Help FAQ | One open at a time; chevron rotates |
| F-101 | P1 | Help contact | Subject + message → success ~3.5s; empty no-ops |

### 1.12 Employer (P1)

| # | Test | Expected |
| --- | --- | --- |
| F-102 | New employer dashboard | Zero live posts; empty state + Post |
| F-103 | Post opportunity | Required title/org; skills comma-split; success screen |
| F-104 | Posted listing appears | Dashboard count +1; `providerId` is current user |
| F-105 | Candidates list | Four seeded people with match rings |
| F-106 | Contact candidate | Modal → Contact → local “contacted” state |
| F-107 | Role gate | Student opening `/admin/opportunities` sees Restricted area |

### 1.13 Admin (P1)

| # | Test | Expected |
| --- | --- | --- |
| F-108 | Overview stats | Students, employers, pending, live opportunities |
| F-109 | Recent sign-ups | Last users + status chips |
| F-110 | User search / filter | Name/email; all/active/pending/suspended |
| F-111 | Activate / pending / suspend | Status chip updates |
| F-112 | Opportunity search / type filter | List shrinks correctly |
| F-113 | Remove opportunity | Confirm modal → listing gone from admin and student list |
| F-114 | Categories toggle | Active/inactive chip; student taxonomy impact is future work |
| F-115 | Add category | New row, active, 0 skills |

### 1.14 Design system surfaces (P2)

| # | Test | Expected |
| --- | --- | --- |
| F-116 | `/design-system` | Tokens, type, buttons, forms, cards, badges render |
| F-117 | `/components` | Gallery sections; toast/modal demos work |
| F-118 | Theme toggle | Light/dark; persists `vc-theme`; no unstyled flash after mount |

---

## 2. UI / UX testing

### 2.1 Visual and brand (P0)

| # | Test | Pass if |
| --- | --- | --- |
| U-01 | Brand | Volunteer**Connect** wordmark; indigo primary; amber accent; no random hex |
| U-02 | Type | Space Grotesk on titles; Inter on body |
| U-03 | Cards | `rounded-2xl`, border, consistent padding; no mixed radii in one cluster |
| U-04 | Growth tone | Empty/error copy is supportive (“Add an experience…”), never shaming |
| U-05 | One primary CTA | Each header/modal has a single filled primary button |
| U-06 | Landing hero | Image loads; “7 verified skills” card from `sm`; stats 12k / 3,400 / 85% |
| U-07 | Dark mode (DS) | All swatches and specimens readable; no white-on-white |

### 2.2 Navigation and wayfinding (P0)

| # | Test | Pass if |
| --- | --- | --- |
| U-08 | Active nav | Current route is primary-filled |
| U-09 | Student vs employer vs admin | Nav sets never mix |
| U-10 | Back from opportunity | Returns to previous page |
| U-11 | Breadcrumb (gallery) | Last item not a link; `aria-current` |
| U-12 | Deep links | Dashboard checklist destinations feel intentional |

### 2.3 Feedback and motion (P0 / P1)

| # | Pri | Test | Pass if |
| --- | --- | --- | --- |
| U-13 | P0 | Submit loading | Spinner + disabled button; no double submit |
| U-14 | P0 | Apply success | Check icon + clear confirmation |
| U-15 | P1 | Toasts (`/components`) | 4 tones; auto-dismiss ~4s; X works; above modal |
| U-16 | P1 | Modal | Escape, backdrop, X; body scroll locked |
| U-17 | P1 | Hover/focus | Nav, buttons, inputs show hover and `focus-visible` ring |
| U-18 | P2 | Reduced motion | Production: no spin/slide when `prefers-reduced-motion` |

### 2.4 Content completeness (P1)

| # | Test | Pass if |
| --- | --- | --- |
| U-19 | Amara story is coherent | Mentor + internship + recycling project + awards appear on profile, CV, and portfolio |
| U-20 | Match explanation | Detail page lists skills you have vs gaps |
| U-21 | FAQ answers | Verification, match score, CV/portfolio, employer visibility, volunteering weight |

### 2.5 Accessibility (P1 demo / P2 sign-off)

| # | Pri | Test | Pass if |
| --- | --- | --- | --- |
| A-01 | P1 | Keyboard login → dashboard | Tab order logical; Enter submits |
| A-02 | P1 | Icon buttons named | Logout, bookmark, close, dismiss have `aria-label` |
| A-03 | P1 | Decorative icons | `aria-hidden="true"` |
| A-04 | P1 | Form errors | Associated with fields; form error `role="alert"` |
| A-05 | P1 | OTP cells | Each has “Digit N”; `inputMode="numeric"` |
| A-06 | P2 | Modal focus trap | Focus stays inside (prototype gap) |
| A-07 | P2 | Tabs | Arrow keys (prototype is click-only) |
| A-08 | P1 | Contrast | Body text vs background AA; don’t use muted-on-muted for actions |
| A-09 | P2 | axe | No serious/critical on `/`, `/login`, `/dashboard`, `/opportunities` |
| A-10 | P2 | Screen reader | Headings outline; match ring not the only status (text % present) |

---

## 3. Responsive design testing

Viewports: **320**, **375**, **768**, **1024**, **1280**. Chrome device mode is enough for demo QA.

### 3.1 P0 — laptop demo (1280) and presenter phone (375)

| # | Viewport | Test | Pass if |
| --- | --- | --- | --- |
| R-01 | 1280 | AppShell | Sidebar `w-60` sticky; main padded; no horizontal page scroll |
| R-02 | 1280 | Dashboard | 2/3 + rail; 4 stat tiles; matches readable |
| R-03 | 1280 | Opportunities | 2-column cards; rings aligned |
| R-04 | 375 | AppShell | No sidebar; `h-14` bar; horizontal nav scrolls; all student links reachable |
| R-05 | 375 | Landing | Single-column hero; CTAs wrap; no overflow |
| R-06 | 375 | Login | Form usable; no clipped buttons |
| R-07 | 375 | OTP | 6 cells fit; still tappable |
| R-08 | 375 | Apply modal | Bottom sheet; primary action visible without hunting |
| R-09 | 375 | CV toolbar | Template tabs + print wrap; preview not cut off |
| R-10 | 375 | Portfolio share | Toolbar wraps; Share still visible |

### 3.2 P1 — tablet and layout recipes

| # | Viewport | Test | Pass if |
| --- | --- | --- | --- |
| R-11 | 768 | Sidebar appears | Desktop nav; mobile bar gone |
| R-12 | 768 | Auth | Still single column (brand panel at 1024+) |
| R-13 | 768 | Applications | 2 kanban columns |
| R-14 | 1280 | Applications | 4 columns |
| R-15 | 768 | Admin users | Table, not cards |
| R-16 | 375 | Admin users | Cards, not a squashed table |
| R-17 | 1024 | Auth brand panel | Visible; form still `max-w-sm` |
| R-18 | 1024 | DS / components | Sticky side nav |
| R-19 | All | Page headers | Stack on small; row with action on `sm+` |
| R-20 | All | Toasts | Bottom-center on phone; bottom-right from 640 |

### 3.3 P2 — overflow and touch

| # | Test | Pass if |
| --- | --- | --- |
| R-21 | 320px width | No horizontal document scroll except nav/table |
| R-22 | Mobile nav tap targets | ≥44px height (known tight — log if fail) |
| R-23 | Filter chips | Wrap; don’t overflow |
| R-24 | Long Amara about/title | Truncate or wrap; no layout break |
| R-25 | Landscape phone | Dashboard usable; nav still reachable |

---

## 4. Performance testing

Prototype is client-state only — treat these as **smoke** for demo and **budgets** for production.

### 4.1 P0 — demo smoothness

| # | Test | Pass if |
| --- | --- | --- |
| P-01 | First load `/` | Hero image appears without a long blank; LCP feels &lt; 3s on wifi |
| P-02 | Demo login | Dashboard interactive within ~1s after spinner |
| P-03 | Filter/search opportunities | List updates instantly; no jank |
| P-04 | Template / theme switch | Instant; no full reload |
| P-05 | Rapid apply + bookmark | No duplicate cards; UI stays responsive |
| P-06 | Console | No red errors on the demo spine (ignore known Next/hydration noise only if documented) |

### 4.2 P2 — budgets (production)

| # | Metric | Target |
| --- | --- | --- |
| P-07 | LCP marketing | &lt; 2.5s (4G Fast) |
| P-08 | INP filter/sort | &lt; 200ms |
| P-09 | CLS | &lt; 0.1 (reserve image space) |
| P-10 | JS bundle | Watch App Router client islands; dashboards should not pull admin+employer |
| P-11 | Image | Enable Next image optimization; hero `sizes` |
| P-12 | List virtualization | If opportunities &gt; 100, paginate or virtualize |
| P-13 | Match recompute | Not on every keypress; cached scores |

### 4.3 P3 — stress

| # | Test | Pass if |
| --- | --- | --- |
| P-14 | 50+ applications | Kanban remains scrollable |
| P-15 | 20+ skills | Analysis page no layout collapse |
| P-16 | Slow 3G | Spinners show; no double-create on impatient clicks |
| P-17 | Offline | Production: friendly error, not a white screen |

---

## 5. Edge case scenarios

### 5.1 P0 — will happen in a live demo

| # | Scenario | Expected |
| --- | --- | --- |
| E-01 | Presenter refreshes mid-demo | Brief “Restoring your session…” then the same screen. If storage failed, **Open Amara’s demo** |
| E-02 | Opens `/dashboard` logged out | Same reset card |
| E-03 | Student visits `/admin` | Restricted area; Back to dashboard |
| E-04 | Double-click Get started / Log in | Single navigation; button disabled while pending |
| E-05 | Browser back after apply | List still shows Applied; no duplicate apply |
| E-06 | Print cancel | User returns to CV page intact |

### 5.2 P1 — empty and partial profiles

| # | Scenario | Expected |
| --- | --- | --- |
| E-07 | Brand-new student skips all onboarding | Dashboard 0% / zeros; empty skills CTA; CV empty state; opportunities still list with lower scores |
| E-08 | Opportunity with no required skills | Score 55; no divide-by-zero |
| E-09 | Search with only spaces | Treated as no query |
| E-10 | Skill tag Enter during IME | Does not add a half-composed character |
| E-11 | Duplicate skill tag | Not added twice |
| E-12 | Slug `!!!` | Becomes empty-safe hyphenated slug, not a broken URL |
| E-13 | Clipboard blocked | Share still shows “Link copied”; no exception |
| E-14 | `amara@example.com` on register | Friendly duplicate path (tip on page) |

### 5.3 P2 — data and security edges

| # | Scenario | Expected |
| --- | --- | --- |
| E-15 | XSS in name/headline | Rendered as text, not HTML |
| E-16 | Very long description | Clamp/wrap; modal scrolls (`max-h-[92vh]`) |
| E-17 | Deadline in the past | Still listed in prototype; production should flag Closed |
| E-18 | Remove opportunity student had saved | Application card disappears or shows “removed” |
| E-19 | Suspended user login | Production: blocked; prototype N/A |
| E-20 | Two tabs | Prototype: independent memory; production: shared session |
| E-21 | File 11MB / `.exe` | Rejected with Alert + retry |
| E-22 | Apply without verified email | Product decision: allow (Skip exists) or block — document and test one |
| E-23 | Private portfolio + apply | Employer still receives CV; public link stays private |
| E-24 | Admin deletes last category | No crash; matching still runs |
| E-25 | Match score clamp | Never outside 18–98 in prototype |

### 5.4 P3 — international and input oddities

| # | Scenario | Expected |
| --- | --- | --- |
| E-26 | Names with hyphens / accents | Initials and avatar OK (`Okafor`, `Nair`) |
| E-27 | RTL / non-Latin | Not supported; log as known limit |
| E-28 | Autofill password | Login fields accept managers |
| E-29 | Zoom 200% | Primary actions still visible |
| E-30 | `prefers-color-scheme: dark` first visit | DS follows OS until toggle |

---

## 6. Demo-day runbook (do this the morning of)

Complete in order. Stop and fix any P0 fail.

### Preflight (15 min)

- [ ] `pnpm dev` (or production URL) loads `/` without console errors
- [ ] Hard-refresh landing; hero image OK
- [ ] `/login` → Explore demo → dashboard populated (F-01, F-91)
- [ ] `/cv` Modern / Classic / Compact all render (F-57–F-59)
- [ ] `/opportunities` shows six cards and a high match on Sustainability Assistant (F-73, F-74)
- [ ] Quick apply → `/applications` shows Applied (F-82, F-87)
- [ ] `/portfolio` Share does not throw (F-71)
- [ ] Refresh on the dashboard — Amara is still signed in (E-01)
- [ ] Logout → `/demo` still works
- [ ] 375px: mobile nav scrolls; apply sheet works (R-04, R-08)
- [ ] Backup: second browser profile already logged in as Amara

### Walkthrough script (map to tests)

1. Landing story (U-01, U-06)  
2. Amara dashboard + profile strength (F-01, F-29, F-91)  
3. Profile evidence chips (F-32, F-51)  
4. Skills analysis (F-45)  
5. CV templates + print mention (F-56–F-61)  
6. Portfolio theme + share (F-65, F-66, F-71)  
7. Filter internships → open match → apply (F-75, F-79, F-82)  
8. Applications board (F-87)  
9. Optional: employer post **or** admin users (F-103, F-108)

### Do not demo unless already green

- Register + OTP (easy to mistype; use skip if needed)
- Delete account
- Admin remove opportunity (destroys seed for the rest of the session)
- `/demo` again after you have applied (reloads seed Amara and clears applies)

---

## 7. Sign-off matrix

| Track | P0 pass required for demo | P1 for a strong demo | P2 for production |
| --- | --- | --- | --- |
| Functionality | Auth demo, dashboard, profile read, CV, opportunities, apply | Onboarding, portfolio edit, notifications, employer, admin | Real auth, files, PDF, public slug |
| UI/UX | Brand, nav, loading, success | Toasts, modal, FAQ | Reduced motion, full a11y |
| Responsive | 1280 + 375 shells | 768 / 1024 recipes | 320, touch 44px |
| Performance | No console errors; instant filter | — | LCP/INP/CLS budgets |
| Edge | Refresh recovery, role gate, print cancel | Empty profile, clipboard fail | XSS, uploads, multi-tab |

**Demo go / no-go:** all **P0** items Pass. **P1** failures are called out as known prototype limits, not surprises.

Tester: ____________  Date: ____________  Build/URL: ____________  Result: **GO** / **NO-GO**
