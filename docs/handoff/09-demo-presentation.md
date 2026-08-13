# 09 — Demo presentation guide

Use this the day you show VOLUNTEER CONNECT. Goal: a calm 8–12 minute story — **experience becomes evidence, evidence becomes a CV and portfolio, and that profile unlocks matched opportunities.**

Companion QA: [08 — Testing checklist](./08-testing-checklist.md).

---

## 1. Deployment setup

### Local (safest for a room with unreliable wifi)

```bash
cd volunteer-connect
pnpm install
pnpm dev
```

Open **http://localhost:3000**. Keep this terminal visible only on your machine, not on the projector.

Production-mode rehearsal (catches build-only issues):

```bash
pnpm build
pnpm start
```

Then open **http://localhost:3000**.

### Vercel (shareable URL)

1. Push the repo to GitHub.
2. [vercel.com/new](https://vercel.com/new) → import the repo.
3. Framework: **Next.js**. Build `next build`, output default. No env vars required for the prototype.
4. Deploy. Copy the `*.vercel.app` URL into the speaker notes below.

CLI alternative:

```bash
pnpm dlx vercel
```

Production deploy: `pnpm dlx vercel --prod`.

### Presenter machine checklist

| Item | Setting |
| --- | --- |
| Browser | Chrome or Edge, fresh profile or Incognito **closed** after rehearsal (session lives in `sessionStorage` per tab) |
| Zoom | 100% (125% only if the room is far from the screen) |
| Theme | Light mode on `/design-system` if you will show tokens; otherwise leave default |
| Notifications | Mute Slack/email; OS do-not-disturb |
| Dock / bookmarks | Hide bookmark bar; fullscreen (`F11`) after the first slide |
| Network | Prefer local `pnpm start`; Vercel is the backup URL |
| Second tab | Pre-open `/demo` (Amara) and `/demo/admin` — do not show these URLs on the projector until needed |

### Session behavior (updated for demo)

| Action | Result |
| --- | --- |
| Refresh in the same tab | Session **restored** (`sessionStorage`) |
| New tab / Incognito | Empty session — use `/demo` |
| Logout | Clears session |
| `/demo` | Reloads **seed Amara** (wipes in-session applies) |
| `/demo/admin` | Admin console |

**Do not hit `/demo` again after you have applied to a role** unless you want a clean Amara.

---

## 2. Demo script (10 minutes)

Speak in the second person. Click slowly. Pause on match rings and verified badges — those are the “aha.”

### 0:00 — Cold open (30s)

**On screen:** `/` landing.

**Do:** Scroll only enough to show the hero product card (Amara, skills, 95% match). Do not scroll the whole page unless asked.

**Say:**

> Young people already have experience — volunteering, school projects, internships — but it rarely shows up as a CV or a job match. VolunteerConnect turns that activity into verified skills, a professional CV, a shareable portfolio, and opportunities ranked to you.

**Talking points**

- Not a job board bolted onto a form. Profile is the product.
- Built for people with little formal work history.
- Three audiences: students, opportunity providers, platform admins.

### 0:30 — Enter the product (45s)

**Click:** **Explore a demo profile** → `/demo` → Amara’s dashboard.

**Say:**

> I’ll show a completed student — Amara Okafor, a college leaver in Manchester. Two years of mentoring, a marketing internship, a campus recycling project. The platform has already turned that into a 100% profile.

**Point at:** Profile strength 100%, four stat tiles, recommended matches with rings, skills rail.

**Talking points**

- Strength is a guided checklist, not a score that shames gaps.
- Matches are skill-based, not keyword spam.
- One click to CV or portfolio from here.

### 1:15 — Evidence, not just a bio (90s)

**Click:** **My Profile**.

**Say:**

> This is the source of truth. Everything here powers the CV, the portfolio, and the match score. Notice the evidence chips — references and certificates, some already verified.

**Do:** Scroll Experience (Youth Mentor + Marketing Intern) → Projects (Recycling Drive) → Skills → Achievements. Do **not** open Edit unless asked.

**Talking points**

- Volunteering is first-class, same as internships and work.
- Projects capture school, community, and personal initiative.
- Leadership and awards sit with evidence, not as a hobby list.
- Verified vs pending is visible — employers can trust the difference.

**If asked “how does verification work?”**

> In production a named referee or organisation confirms a certificate or reference. In this prototype the statuses are seeded so you can see both states.

### 2:45 — Skills analysis (60s)

**Click:** **Skills Analysis**.

**Say:**

> We don’t ask Amara to invent a skill taxonomy. Skills are extracted from what she did, levelled 1–5, and grouped. This panel also shows demand she doesn’t cover yet — so growth is specific, not generic “add more experience.”

**Point at:** Verified count, strongest area, “Skills to develop.”

**Talking points**

- Experience-to-skill mapping is the engine.
- Gaps are framed as the next opportunity, not a deficit.

### 3:45 — CV in one click (75s)

**Click:** **CV Builder**.

**Say:**

> Same data, recruiter-ready layout. Three templates — Modern for community and creative roles, Classic for formal employers, Compact when she needs more on one page.

**Do:** Click **Classic**, pause, click **Compact**, return to **Modern**. Hover **Print** / **Export PDF** but only click Print if the room can handle a dialog. Prefer: “Export uses the browser print-to-PDF — I’ll skip the dialog.”

**Talking points**

- No retyping. Profile in, CV out.
- Verified skills marked.
- She can iterate the profile and regenerate.

### 5:00 — Portfolio she can share (60s)

**Click:** **Portfolio** (sidebar).

**Say:**

> This is the page she sends in a message or QR. Theme, visibility, and whether contact details show are under her control.

**Do:** **Edit** → click **Bold**, then **Aurora** again. Mention Public / Unlisted / Private. **Preview**. Click **Share** once (“Link copied”).

**Talking points**

- Unlisted = link only; Private = only she sees it; apply still attaches a CV.
- Evidence badges travel with the story.

### 6:00 — Matched opportunities (2 min) — the climax

**Click:** **Opportunities**.

**Say:**

> Five kinds of opportunity in one marketplace: jobs, internships, scholarships, volunteering, and training. Ranked by how well Amara’s verified skills and interests fit — not by who applied first.

**Do:**

1. Point at the top card match ring (Sustainability Programme Assistant should be high).
2. Click **Internship** filter, then **All**.
3. Type `EarthWise` in search, clear it.
4. Open **Sustainability Programme Assistant**.
5. Show “You already have” vs gaps.
6. **Apply** (or Quick apply) → confirmation.
7. **Applications** — card in Applied.

**Talking points**

- Match is explainable: required skills vs her profile.
- Save/bookmark for later; pipeline is Saved → Applied → Interview → Offer.
- One profile, many opportunity types — she does not need five portals.

### 8:00 — Optional fork (90s) — pick ONE

**A. Employer (if the audience is providers)**  
New tab: `/register?role=employer` is slow. Prefer: stay student, *say* providers post roles and see ranked candidates, then open `/demo/admin` only if needed.  
To *show* employer: logout → register is risky live. Better: “I have a provider view prepared” → only if rehearsed with a second flow.

Practical employer show: you cannot reach employer nav from Amara. Skip unless you pre-opened a second browser profile. **Default: skip.**

**B. Admin (if the audience is operators)**  
New tab (not the Amara tab): `/demo/admin`.

**Say:**

> Operators see sign-ups, pending approvals, live listings, and the skill taxonomy. They can suspend a user or take down a listing without touching student data entry.

**Do:** Overview stats → **User Management** (filter Pending) → do **not** click Remove on opportunities.

**C. Onboarding (if asked “what about a new user?”)**  
“Guided six steps: about you, education, experience, projects, achievements, skills we detect. Skip any time — the dashboard checklist brings you back.” Do not live-register unless spare time.

### 9:30 — Close (30s)

**Back to** Amara **Dashboard** (original tab).

**Say:**

> That’s the loop. Capture real experience. Turn it into skills you can prove. Walk out with a CV, a portfolio, and a shortlist that already fits. The next step for us is persistence, real verification, and live employer listings — the product story is already here.

**Stop talking. Wait for questions.**

---

## 3. Key talking points (keep these in your pocket)

| Theme | Line |
| --- | --- |
| Positioning | Career readiness for young people, not another LinkedIn. |
| Equity | Volunteering and projects count as much as a job title. |
| Trust | Verification and evidence sit next to every claim. |
| Matching | Skills + proficiency + verified bonus + interests — explainable. |
| Speed | One profile feeds CV, portfolio, and applications. |
| Providers | They search for evidence-backed capability, not keyword stuffing. |
| Safety | She controls search, employer visibility, and portfolio access. |
| Honesty | This build is an interactive prototype; refresh is safe in-tab; no real PII is stored. |

If challenged “is this production?”:

> The UX, information architecture, and matching rules are implementation-ready. Auth, file storage, and PDF export are the engineering follow-through — they’re specified in the handoff pack.

---

## 4. Backup plans

### Before you start

| Risk | Backup |
| --- | --- |
| Wifi dies | Local `pnpm start` already running; bookmark localhost |
| Vercel slow | Switch to localhost; say “I’ll use the local build” |
| Wrong browser profile | `/demo` in the address bar |
| Projector 1024px | Still fine — sidebar at 768+. Avoid 375 demo unless asked |
| Dark OS theme flash | Theme script runs before paint; if ugly, `/design-system` → Light mode |

### During the talk

| What happens | What you do | What you say |
| --- | --- | --- |
| Accidental refresh | Wait ~0.5s — session restores | “Still here — the session persists in this tab.” |
| Session-reset card | Click **Open Amara’s demo** | “I’ll jump back to the sample profile.” |
| Typed `/demo` after applying | Applications reset | “I’ll re-apply — takes two seconds.” Then Quick apply again |
| Print dialog opens | Cancel immediately (`Esc`) | “That’s the export path — we won’t print now.” |
| Search returns nothing | Clear the box; click **All** | “Filters are live — back to the full set.” |
| Clicked Logout | `/demo` | “Back to Amara.” |
| Restricted area (admin URL as student) | **Back to your dashboard** | “Role-gated — students don’t see ops tools.” |
| Tab crash | Second tab already on `/demo` | Switch tabs; don’t narrate the failure |
| Build error / white screen | Open the Vercel URL or the rehearsal recording | “I’ll switch to the hosted build.” |
| Someone asks to type their name | Politely defer: “Happy to after — live register is a longer path.” | — |
| Modal stuck | `Esc` | — |
| Wrong opportunity | Use Back; don’t improvise a new story | — |

### Hard fallback (no live app)

Narrate from the handoff screenshots / this script using `/design-system` and `/components` if the app router is up but data is empty. Last resort: walk the landing page only and describe the five steps.

### URLs to keep on a paper card

```
Local          http://localhost:3000
Landing        /
Amara          /demo
Admin          /demo/admin
Login          /login
Design tokens  /design-system
Components     /components
OTP            481920
Email          amara@example.com  (any password)
```

---

## 5. Performance optimizations (already in this build)

| Change | Why it helps the demo |
| --- | --- |
| `sessionStorage` snapshot | Refresh no longer kills the story |
| `/demo` and `/demo/admin` | One-URL recovery |
| Hero is a live product card, not a missing PNG | No broken image on the first slide |
| Theme `beforeInteractive` script | No light/dark flash |
| Fonts `display: swap` | Text paints immediately |
| Login prefetches `/dashboard` and `/admin` | Faster transition after “Explore” |
| Favicon is the local SVG only | No 404s for missing PNG icons |
| Session restore spinner | No false “logged out” flash on refresh |

### Presenter-side performance

- Close other Chrome tabs; one window, two tabs max (Amara + admin).
- Disable extensions on the demo profile.
- If using Vercel: load `/` once 10 minutes before, then `/demo`, so caches are warm.
- Do not open DevTools on the projector.
- Avoid entering long search strings; `EarthWise` is enough.
- Prefer `pnpm start` (production bundle) over `pnpm dev` for the actual presentation — faster, fewer overlay badges.

### If the room feels laggy

Skip Skills Analysis and Portfolio Edit. Path: Dashboard → Profile (scroll) → CV Modern only → Opportunities → Apply → Applications.

---

## 6. Presentation tips

**Setup**

- Arrive 20 minutes early. Run the [morning preflight](./08-testing-checklist.md#6-demo-day-runbook-do-this-the-morning-of).
- Fullscreen after you confirm the URL is correct.
- Cursor: large / highlight if the OS supports it.
- Stand so you can click without blocking the match ring.

**Pacing**

- One idea per screen. If they lean in, pause — don’t keep clicking.
- Never talk through a spinner. Wait, then name what appeared.
- The apply confirmation is a full stop. Count to two before Applications.

**Language**

- “Amara” not “the user.” “Verified” not “we scraped.”
- Don’t say “prototype” on every screen. Once in the close is enough.
- Don’t apologize for missing PDF bytes or file uploads unless asked.

**Do not click**

- Delete account
- Admin **Remove** opportunity
- Register + OTP as the main path
- Theme toggle mid-story (resets visual continuity)
- Logout “to show the landing again” (use a new tab for `/` if needed)

**Questions — short answers**

| Question | Answer |
| --- | --- |
| Where is the data stored? | In this demo, in the browser tab. Production: Postgres + object storage. |
| Can she download a PDF? | Print / Save as PDF today; dedicated PDF job is specified next. |
| How is 95% calculated? | Overlap of required skills with hers, weighted by level and verification, plus a small interest boost. |
| GDPR / under 18? | Privacy toggles are in Settings; production needs parental/age policy — called out in tech requirements. |
| Mobile? | Responsive shell: sidebar from tablet up, horizontal nav on phones. Offer to resize only if asked. |

**Close body language**

End on the dashboard with matches visible. That image should stay up during Q&A.

---

## 7. Timing variants

| Slot | Path |
| --- | --- |
| **5 min** | Landing → `/demo` dashboard → CV Modern → Opportunities apply → Applications |
| **10 min** | Full script above (no employer) |
| **15 min** | Full script + admin tab + one privacy toggle on Settings |
| **Workshop** | Let one volunteer click `/register` on a *second* machine, not yours |

---

## 8. Day-of timeline

| When | Action |
| --- | --- |
| Night before | `pnpm build && pnpm start`; walk the 10-min script once |
| T−20 min | Do-not-disturb; start `pnpm start`; open `/` and `/demo` |
| T−10 min | Projector 1280×720+; zoom 100%; hide desktop files |
| T−2 min | Hard-refresh `/`; confirm hero card and CTAs |
| T−0 | Fullscreen; begin cold open |
| After | Logout or close the tab so the next person gets a clean `/demo` |

**Go / no-go:** If `/demo` does not show Amara’s 100% dashboard, do not start. Fix or switch host. Everything else can be skipped; that screen cannot.
