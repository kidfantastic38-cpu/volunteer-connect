# 01 — Product overview

## Problem

Young people accumulate real capability through volunteering, school projects, internships, and leadership — but that work rarely appears as a recruiter-ready CV, a shareable portfolio, or a skills match against open opportunities.

## Solution

VOLUNTEER CONNECT is a single web application that:

1. Captures education, experience, projects, achievements, and evidence.
2. Extracts and levels skills from those activities.
3. Generates a professional CV and a themed digital portfolio.
4. Matches students to jobs, internships, scholarships, volunteering, and training.
5. Lets opportunity providers post roles and review evidence-backed candidates.
6. Gives platform admins user, opportunity, and taxonomy controls.

## Personas and roles

| Role | Who | Primary job |
| --- | --- | --- |
| `student` | Students, graduates, volunteers, young job-seekers | Build a profile, generate CV/portfolio, apply to matches |
| `employer` | Charities, employers, scholarship and training providers | Post opportunities, review matched candidates |
| `admin` | Platform operators | Moderate users, opportunities, and skill categories |

Role is stored on the session (`PrototypeProvider.role`) and gates navigation plus `AppShell` `requiredRole`.

## Information architecture

```
Public
├── /                     Marketing landing
├── /login                Sign in (student demo + admin demo)
├── /register             Create account (student | employer)
├── /verify               Email OTP
├── /design-system        Token gallery
└── /components           Component library

Student (AppShell)
├── /onboarding           6-step guided setup
├── /dashboard            Profile strength, matches, skills
├── /profile              Identity + CRUD sections
├── /skills               Analysis, gaps, sources
├── /cv                   Template switcher + print/PDF
├── /portfolio            Public-style preview
├── /portfolio/edit       Theme, visibility, slug
├── /opportunities        Search, filter, rank, apply
├── /opportunities/[id]   Detail + skill breakdown
├── /applications         Saved → Applied → Interview → Offer
├── /notifications        Inbox
├── /settings             Account, password, delete
├── /settings/privacy     Discoverability + portfolio visibility
└── /help                 FAQ + contact form

Employer (AppShell)
├── /employer             Provider dashboard
├── /employer/post        Create opportunity
└── /employer/candidates  Ranked talent + contact modal

Admin (AppShell)
├── /admin                Platform overview
├── /admin/users          Search, filter, activate / suspend
├── /admin/opportunities  Moderate / remove listings
└── /admin/categories     Skill taxonomy on/off + add
```

## Core domain objects

| Entity | Purpose |
| --- | --- |
| `Profile` | Name, email, headline, location, about, interests |
| `Education` | Institution, qualification, field, dates, grade |
| `Experience` | Volunteer / internship / work + skills + evidence |
| `Project` | School / community / personal + outcome + evidence |
| `Achievement` | Award / certification / leadership + evidence |
| `Skill` | Name, 1–5 level, category, source, verified flag |
| `Evidence` | Certificate, reference, photo, link, or document; pending or verified |
| `Opportunity` | Job, internship, scholarship, volunteering, training |
| `Application` | saved / applied / interview / offer / rejected |
| `PortfolioSettings` | Theme, slug, visibility, publish, contact/evidence toggles |
| `PrivacySettings` | Searchable, employer-visible, analytics, email/match alerts |
| `AppNotification` | match, application, verification, endorsement, system |

Full TypeScript shapes live in `components/prototype-store.tsx`.

## Seeded student: Amara Okafor

Used by **Explore the demo profile** and login `amara@example.com`.

- Headline: Aspiring community & sustainability leader
- Location: Manchester, UK
- Education: Riverside Community College, A-Levels AAB
- Experience: Youth Mentor (current, 240h, verified evidence); Marketing Intern (pending link)
- Project: Campus Recycling Drive (1.2 tonnes diverted, Youth Green Award)
- Achievements: Regional Youth Green Award; Duke of Edinburgh Silver
- Skills: Communication 5, Leadership 4, Teamwork 4, Organization 4, Problem Solving 4 (verified); Content Creation 3, Analytics 3 (unverified)

## Seeded opportunities

| ID | Title | Type | Org | Location |
| --- | --- | --- | --- | --- |
| `op-1` | Sustainability Programme Assistant | Job | EarthWise Foundation | Manchester |
| `op-2` | Digital Marketing Internship | Internship | GreenLeaf Startups | Remote |
| `op-3` | Youth Leadership Scholarship | Scholarship | Future Leaders Trust | UK-wide |
| `op-4` | Weekend Food Bank Volunteer | Volunteering | City Harvest | Manchester |
| `op-5` | Data & Impact Analysis Bootcamp | Training | SkillBridge Academy | Online |
| `op-6` | Communications Assistant | Job | Northern Arts Collective | Leeds |

## Matching (prototype)

`matchScore(opportunity)` in `prototype-store.tsx`:

1. For each required skill, score a **direct name match** (0.55 + proficiency×0.35 + 0.1 if verified), else a **category match** (0.4 + proficiency×0.2), else an **interest overlap** (0.3).
2. Average across required skills, scale to 0–100.
3. Add +6 if any interest appears in the title or description.
4. Clamp to **18–98**.

Empty required-skill lists return **55**. Production should persist scores, explain them, and recompute on profile or listing changes.

## Profile strength

`profileCompletion()` = share of six onboarding flags that are true: basics, education, experience, projects, achievements, skills. Displayed as a 0–100% bar on the student dashboard.

## What the prototype persists

The same-tab session is saved to `sessionStorage` (`vc-demo-session`) so a refresh does not wipe a live demo. Logout or a new tab starts clean. Theme preference (`vc-theme` in `localStorage`) is separate. Production persistence requirements are in [07 — Technical requirements](./07-technical-requirements.md).
