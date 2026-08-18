# 07 — Technical requirements

What the prototype is today, and what production must implement. File paths refer to this repository.

## Current stack

| Layer | Choice | Version / notes |
| --- | --- | --- |
| Framework | Next.js App Router | `16.3.0` |
| UI | React + React DOM | `^19` |
| Language | TypeScript | `5.7.3`, `strict` |
| Styling | Tailwind CSS v4 | `@import 'tailwindcss'` in `globals.css` |
| Components | shadcn **base-nova** + Base UI | `components.json`, `@base-ui/react` |
| Icons | Lucide | `lucide-react` |
| Fonts | Inter, Space Grotesk | `next/font/google` |
| Analytics | Vercel Analytics | Production only |
| Package manager | pnpm | lockfile present |
| Path alias | `@/*` → repo root | `tsconfig.json` |

Scripts: `pnpm dev` / `build` / `start` / `lint`.

**Config flags to reverse in production**

- `next.config.mjs`: `typescript.ignoreBuildErrors: true` — turn **off**.
- `images.unoptimized: true` — turn **off** and set `sizes` on the hero.
- Prototype store is client-only memory — replace with a real API + auth session.

## Architecture target

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ Next.js app │────▶│ API (Route       │────▶│ Postgres        │
│ App Router  │     │ Handlers or BFF) │     │ + object store  │
└─────────────┘     └────────┬─────────┘     └─────────────────┘
                             │
                    ┌────────▼─────────┐
                    │ Auth, email,     │
                    │ PDF, antivirus   │
                    └──────────────────┘
```

Recommended split:

- **Web:** keep this Next.js app; move data fetching to server components + authenticated route handlers.
- **API:** REST or tRPC following the store methods in `prototype-store.tsx`.
- **DB:** relational (Postgres) with the entities below.
- **Files:** S3-compatible bucket for evidence and future avatar uploads.
- **Jobs:** verification emails, match recompute, PDF generation.

Do not keep `PrototypeProvider` as the source of truth. Keep it only as a Storybook/demo fixture if needed.

## Domain model (implement as tables)

IDs: UUID. Timestamps: `created_at`, `updated_at` on every row. Soft-delete users and opportunities.

### Identity

| Table | Fields |
| --- | --- |
| `users` | id, email (unique), password_hash, role (`student` \| `employer` \| `admin`), email_verified_at, status (`active` \| `pending` \| `suspended`), name |
| `profiles` | user_id, headline, location, about, avatar_url, interests `text[]` |
| `sessions` / tokens | provider-specific (see Auth) |

### Student content

| Table | Fields |
| --- | --- |
| `education` | profile_id, institution, qualification, field, start, end, grade, description |
| `experiences` | profile_id, type (`volunteer` \| `internship` \| `work`), role, organization, location, start, end, current, hours, description |
| `projects` | profile_id, title, category (`school` \| `community` \| `personal`), role, description, outcome, link |
| `achievements` | profile_id, title, issuer, date, category (`award` \| `certification` \| `leadership`), description |
| `skills` | profile_id, name, level (1–5 check), category (enum below), source, verified |
| `experience_skills` / `project_skills` | join tables |
| `evidence` | parent_type + parent_id, type (`certificate` \| `reference` \| `photo` \| `link` \| `document`), label, status (`pending` \| `verified`), file_key or url, verifier_id, verified_at |
| `onboarding_state` | user_id, six booleans **or** derive from content presence |

Skill categories: Communication, Leadership, Technical, Teamwork, Problem Solving, Creativity, Organization — plus admin-defined rows in `skill_categories`.

### Opportunities and applications

| Table | Fields |
| --- | --- |
| `opportunities` | provider_id, title, org, type (`job` \| `internship` \| `scholarship` \| `volunteering` \| `training`), location, remote, description, deadline, compensation, applicants_count (or count query), status (`live` \| `closed` \| `removed`) |
| `opportunity_skills` | opportunity_id, skill_name or category_id |
| `applications` | user_id, opportunity_id (unique pair), status (`saved` \| `applied` \| `interview` \| `offer` \| `rejected`), note, updated_at |
| `application_events` | audit trail for status changes |

### Portfolio, privacy, notifications

| Table | Fields |
| --- | --- |
| `portfolios` | user_id, published, theme (`aurora` \| `minimal` \| `bold`), slug (unique), visibility (`public` \| `unlisted` \| `private`), show_contact, show_evidence, tagline |
| `privacy_settings` | user_id, searchable, show_to_employers, share_analytics, email_notifications, match_alerts |
| `cv_preferences` | user_id, template (`modern` \| `classic` \| `compact`) |
| `notifications` | user_id, kind, title, body, read_at, href, created_at |

### Admin

| Table | Fields |
| --- | --- |
| `skill_categories` | name, active, skill_count (materialized) |
| `audit_log` | actor_id, action, target_type, target_id, metadata |

## Suggested API surface

Map 1:1 from `Store` in `prototype-store.tsx`. All mutations require auth. Use `403` on role mismatch (same UX as AppShell restricted card).

| Method | Path | Role | Prototype analog |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | public | `register` |
| POST | `/api/auth/login` | public | `login` |
| POST | `/api/auth/logout` | user | `logout` |
| POST | `/api/auth/verify` | user | `verifyAccount` |
| POST | `/api/auth/resend` | user | resend OTP |
| GET/PATCH | `/api/me` | user | `user`, `updateProfile` |
| GET/PATCH | `/api/me/onboarding` | student | `setOnboardingStep` |
| CRUD | `/api/me/education` | student | `addEducation` / `removeEducation` |
| CRUD | `/api/me/experiences` | student | experiences |
| CRUD | `/api/me/projects` | student | projects |
| CRUD | `/api/me/achievements` | student | achievements |
| CRUD | `/api/me/skills` | student | skills |
| POST | `/api/me/evidence` | student | file + metadata |
| GET/PATCH | `/api/me/portfolio` | student | `updatePortfolio` |
| POST | `/api/me/portfolio/publish` | student | `publishPortfolio` |
| GET | `/api/p/:slug` | public* | portfolio page |
| GET/PATCH | `/api/me/privacy` | student | `updatePrivacy` |
| PATCH | `/api/me/cv-template` | student | `setCvTemplate` |
| GET | `/api/opportunities` | student | list + `matchScore` |
| GET | `/api/opportunities/:id` | student | detail |
| PUT | `/api/applications/:opportunityId` | student | `setApplication` |
| GET | `/api/applications` | student | pipeline |
| GET | `/api/notifications` | user | list |
| POST | `/api/notifications/read` | user | mark one / all |
| POST | `/api/opportunities` | employer | `postOpportunity` |
| GET | `/api/employer/opportunities` | employer | `providerId === me` |
| GET | `/api/employer/candidates` | employer | replace hardcoded list |
| GET | `/api/admin/overview` | admin | dashboard stats |
| GET/PATCH | `/api/admin/users` | admin | `setUserStatus` |
| DELETE | `/api/admin/opportunities/:id` | admin | `removeOpportunity` |
| GET/POST/PATCH | `/api/admin/categories` | admin | taxonomy |

\* Public portfolio: allow if `published && visibility === public`, or unlisted + valid secret/link, or owner/admin. Private: owner only (employers still receive CV on apply).

## Authentication and security

### Prototype (do not ship)

- Any password for `amara@example.com`.
- OTP `481920` or even last digit.
- Role stored only in React state.
- No CSRF, no rate limit, no password hashing.

### Production must

- Email + password with **bcrypt/argon2id**, min 8 characters (prototype UI says 6 — raise it and update copy).
- Session: httpOnly secure cookies (or Auth.js / Clerk / Cognito). Never store session tokens in `localStorage`.
- Email verification with time-limited OTP or magic link; rate-limit resend.
- Optional TOTP 2FA (settings toggle is already in the UI).
- RBAC middleware matching `AppShell` `requiredRole`.
- Employer accounts: admin or domain verification before posting.
- CSRF on cookie sessions; SameSite=Lax.
- Rate-limit login, register, OTP, apply, contact-candidate.
- Lockout / step-up after N failed logins.
- File uploads: type allow-list (PDF, PNG, JPEG), **10MB** max (copy already says this), malware scan, signed download URLs.
- PII: encrypt evidence at rest; GDPR export/delete (settings already has delete).
- Audit admin suspend/remove.
- Content-Security-Policy, HSTS, and `ignoreBuildErrors: false`.

## Matching engine

Port `matchScore` as a **pure function** first (unit-test against Amara + seed opportunities), then:

1. Persist last score on `(user_id, opportunity_id)` for list sort.
2. Recompute on profile skill change, interest change, or listing skill change (queue).
3. Return an explanation payload for the detail page: matched skills, gaps, interest boost.
4. Weight verified evidence higher (already +0.1).
5. Clamp 18–98 is a prototype UX choice — production may use 0–100 with a “new profile” floor.

Do not call the model on every keystroke of search; filter/sort cached scores in SQL.

## File and media

| Asset | Prototype | Production |
| --- | --- | --- |
| Evidence | Labels only | Multipart upload → object storage → `evidence.file_key` |
| Avatar | Initials | Optional image, cropped, 256px |
| Hero | `/volunteer-connect-hero.jpg` | Optimized `next/image` |
| CV PDF | `window.print()` | Server PDF (e.g. React-PDF or Playwright) stored 24h |
| Portfolio OG | None | Generate `og:image` from theme + name |

## Email

| Event | Recipient |
| --- | --- |
| Verify account | New user |
| Password reset | User |
| Evidence verified / rejected | Student |
| New high match (if `matchAlerts`) | Student |
| Application received | Employer |
| Application status change | Student |
| Account suspended | User |

Honor `privacy.emailNotifications` and `matchAlerts`.

## Frontend implementation notes

- **RSC:** Marketing and public portfolio can be server-rendered. Dashboards stay client-interactive but hydrate from server-fetched props.
- **State:** Replace `usePrototype()` with React Query / SWR + server actions, keeping the same method names where possible to limit churn.
- **Guards:** Middleware for cookie session; keep the friendly session-reset and restricted-area cards.
- **Deep links:** Honor `?tab=` on `/profile` and `?next=` on `/verify` / `/register?role=`.
- **Theme:** Keep `vc-theme`; add toggle to AppShell and marketing header.
- **A11y:** WCAG 2.1 AA; add modal focus trap; tablist arrow keys; `prefers-reduced-motion`.
- **i18n:** Copy is English-only. Structure strings for later extraction if required.

## Environment

```
DATABASE_URL=
AUTH_SECRET=
SMTP_URL=                  # or provider API key
S3_BUCKET=
S3_REGION=
S3_ACCESS_KEY=
NEXT_PUBLIC_APP_URL=       # portfolio absolute URLs
```

Never commit secrets. `.env` is not in this prototype.

## Quality gates

| Gate | Requirement |
| --- | --- |
| Typecheck | `tsc --noEmit` clean (`ignoreBuildErrors` removed) |
| Lint | `pnpm lint` |
| Unit | `matchScore`, validators, slug sanitize, categorize() |
| Component | Button/Field/Modal/Toast states (Storybook or Vitest + Testing Library) |
| E2E | Register → verify → onboard → apply; employer post; admin suspend |
| A11y | axe on auth, dashboard, opportunities, modal |
| Perf | LCP &lt; 2.5s marketing; INP &lt; 200ms on filter/sort |
| Security | Dependency audit; upload tests; auth bypass tests |

## Prototype → production gap list

Ship blockers:

1. Persistent database and authenticated API.
2. Real email verification and password reset.
3. Evidence file storage + verification workflow (referee email).
4. Employer candidate list from real applications (remove hardcoded `CANDIDATES`).
5. PDF export (not print dialog).
6. Public portfolio route by slug with visibility rules.
7. Session that survives refresh.
8. Admin audit log and confirmation on suspend/delete.
9. Rate limiting and RBAC on the server.
10. Legal: privacy policy, terms, cookie consent, age-appropriate design (users may be 16–18).

Should-have shortly after MVP:

- Drag-and-drop application pipeline + employer status updates.
- Search that includes location / remote / deadline.
- Notifications via email + in-app (webhook/queue).
- Theme toggle in the product chrome.
- Edit existing profile rows (prototype is add/remove only).
- Rejected column on the applications board.
- `prefers-reduced-motion` and focus trap.

## File map for implementers

```
app/
  page.tsx                    Marketing
  layout.tsx                  Fonts, PrototypeProvider, ToastProvider
  globals.css                 Tokens
  login|register|verify/      Auth
  onboarding/                 6-step wizard
  dashboard|profile|skills/   Student core
  cv|portfolio|portfolio/edit
  opportunities/ + [id]/
  applications|notifications
  settings|settings/privacy|help
  employer|employer/post|employer/candidates
  admin|admin/users|admin/opportunities|admin/categories
  design-system|components    Living style guide
components/
  prototype-store.tsx         Domain types + seed + matchScore
  app-shell.tsx               Role nav + guards
  auth-shell.tsx
  form-controls.tsx
  ui-bits.tsx                 Chip, rings, empty
  ui-kit/                     Nav, data, forms, feedback, utility
  ui/button.tsx
  modal.tsx | toast.tsx
docs/handoff/                 This pack
```

## Definition of done (production feature)

A feature is done when:

1. It matches the flow in [04](./04-user-flows.md) and interactions in [05](./05-interaction-specifications.md).
2. It uses tokens and components from [02](./02-design-system-tokens.md) and [03](./03-component-specifications.md).
3. It works at 320px, 768px, and 1280px per [06](./06-responsive-breakpoints.md).
4. Data is persisted, authorized, and audited where required above.
5. Empty, loading, error, and forbidden states are implemented.
6. Automated tests cover the happy path and the validation table.
