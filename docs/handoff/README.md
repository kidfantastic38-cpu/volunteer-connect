# VOLUNTEER CONNECT — Prototype Handoff

This pack is the implementation source of truth for the VOLUNTEER CONNECT prototype. It documents what is already built in this repository, how it should behave, and what production development must add.

**Product.** A career-readiness platform that turns volunteering, school projects, internships, leadership, and practical experience into structured skills, professional CVs, digital portfolios, and matched jobs, internships, scholarships, volunteering, and training.

**Prototype status.** Interactive Next.js app. Session state lives in React context and is restored on refresh in the same tab (`sessionStorage`). No backend, database, or real file storage.

## How to use this pack

| If you need… | Read |
| --- | --- |
| Product scope, roles, and route map | [01 — Product overview](./01-product-overview.md) |
| Color, type, space, radius, elevation | [02 — Design system tokens](./02-design-system-tokens.md) |
| Component API, variants, and states | [03 — Component specifications](./03-component-specifications.md) |
| End-to-end journeys by role | [04 — User flows](./04-user-flows.md) |
| Validation, motion, focus, and feedback | [05 — Interaction specifications](./05-interaction-specifications.md) |
| Layout rules at each viewport | [06 — Responsive breakpoints](./06-responsive-breakpoints.md) |
| Stack, data model, APIs, and production gaps | [07 — Technical requirements](./07-technical-requirements.md) |
| Demo-prioritized QA (function, UI, responsive, perf, edges) | [08 — Testing checklist](./08-testing-checklist.md) |
| Live demo script, deploy, backups, presentation tips | [09 — Demo presentation](./09-demo-presentation.md) |

## Live references in the app

| Surface | Route | Source |
| --- | --- | --- |
| Marketing landing | `/` | `app/page.tsx` |
| Design tokens gallery | `/design-system` | `app/design-system/page.tsx` |
| Component library | `/components` | `app/components/page.tsx` |
| Token definitions | — | `app/globals.css` |
| In-memory domain store | — | `components/prototype-store.tsx` |

## Demo accounts

| Path | Action | Lands on |
| --- | --- | --- |
| `/demo` | Instant Amara student session | `/dashboard` |
| `/demo/admin` | Instant admin session | `/admin` |
| `/login` → **Explore the demo profile (Amara)** | Student with full sample data | `/dashboard` |
| `/login` with `amara@example.com` + any password | Same as demo student | `/dashboard` |
| `/login` with a provisioned admin email + password | Platform admin | `/admin/dashboard` |
| `/register` | New student or employer (empty profile) | `/verify` then onboarding or employer home |

Demo email verification code: `481920` (or any 6-digit code ending in an even digit).

## Brand principles

1. **Growth over gaps** — Frame experience as momentum. Show what someone has built, not what they lack.
2. **Evidence you can trust** — Verification badges, endorsements, and artifacts give informal experience professional weight.
3. **Approachable, not childish** — Warm indigo and amber stay youthful; Space Grotesk + Inter stay employer-ready.
