# Volunteer Connect — Vercel deployment

This guide deploys the existing Next.js 16 App Router app to Vercel with hosted PostgreSQL. It does not change the security model.

Do not use PGlite, local `data/` files, or `ALLOW_DEMO_OTP=true` in Production.

## 1. Create hosted PostgreSQL

Recommended: [Neon](https://neon.tech) or Vercel Postgres.

1. Create a project and database.
2. Copy the connection string.
3. That value is `DATABASE_URL`.
4. Set production to:

```
DATABASE_DRIVER=neon
DATABASE_URL=<SECRET>
```

Do not put the real connection string in git. Never set `NEXT_PUBLIC_DATABASE_URL`.

PGlite remains for local development only (`DATABASE_DRIVER=pglite`). It is disabled when `NODE_ENV=production`.

## 2. Configure Vercel environment variables

In the Vercel project → Settings → Environment Variables.

| Variable | Development | Preview | Production |
| --- | --- | --- | --- |
| `DATABASE_URL` | Local Docker or leave unset if using PGlite | Neon connection string | Neon connection string |
| `DATABASE_DRIVER` | `pglite` | `neon` | `neon` |
| `AUTH_SECRET` | Dev string (16+ chars) | Unique 32+ random string | Unique 32+ random string |
| `BLOB_READ_WRITE_TOKEN` | Optional | Required for upload tests | Required |
| `BREVO_API_KEY` | Optional | Required to send OTP email | Required |
| `EMAIL_FROM` | Optional | Verified sender, e.g. `Volunteer Connect <noreply@your-domain>` | Same |
| `APP_URL` | `http://localhost:3000` | Preview URL | Production URL |
| `ALLOW_DEMO_OTP` | `true` for local demo OTP `481920` | unset / `false` | **unset or `false`** |
| `VOLUNTEER_CONNECT_DATA_DIR` | Optional local path | **unset** | **unset** |

Generate `AUTH_SECRET` with a CSPRNG (for example `openssl rand -hex 32`). Do not reuse the local-dev value.

`ALLOW_DEMO_OTP=true` is ignored on Vercel Production even if someone sets it.

Do not create any `NEXT_PUBLIC_*` copies of secrets.

Vercel Production and Preview must both have:

```
DATABASE_URL
DATABASE_DRIVER=neon
AUTH_SECRET
BLOB_READ_WRITE_TOKEN
BREVO_API_KEY
EMAIL_FROM
APP_URL
```

Leave `ALLOW_DEMO_OTP` unset on Production and Preview. Development may keep `DATABASE_DRIVER=pglite` or `neon` in gitignored `.env.local` only.

## 3. Configure Vercel Blob

1. In the Vercel project, enable **Blob**.
2. Vercel injects `BLOB_READ_WRITE_TOKEN` for server runtimes.
3. Confirm it is **not** marked as a public / `NEXT_PUBLIC_` variable.

Uploads stay private. Clients download only through `GET /api/uploads/[id]` after owner/admin authorization.

## 4. Configure email (Brevo)

Production OTP codes are random 6-digit values, stored as HMAC hashes, and emailed via [Brevo](https://www.brevo.com) (formerly Sendinblue). They are not returned by the API and are not logged.

1. Create a Brevo account and verify your sending domain.
2. Create an SMTP/API key.
3. Set `BREVO_API_KEY` and `EMAIL_FROM` (for example `Volunteer Connect <noreply@your-domain>`).
4. Set `APP_URL` to the public site origin so the email can link to `/verify`.

Local development can keep using the demo OTP when `ALLOW_DEMO_OTP` is not `false`.

## 5. Run migrations (not seed)

Migrations are idempotent `CREATE IF NOT EXISTS` SQL in `drizzle/`.

From a trusted machine with the **production** `DATABASE_URL` (do not point this at PGlite):

```bash
# Production / hosted Postgres only — do not commit the URL
export DATABASE_DRIVER=neon
export DATABASE_URL="<SECRET>"
export NODE_ENV=production
corepack pnpm db:migrate
```

On PowerShell:

```powershell
$env:DATABASE_DRIVER = "neon"
$env:DATABASE_URL = "<SECRET>"
$env:NODE_ENV = "production"
corepack pnpm db:migrate
```

**Do not run `pnpm db:seed` against production.** The seed script refuses `NODE_ENV=production` and `VERCEL_ENV=production`. Seed inserts development demo accounts (`amara@example.com`, `admin@volunteerconnect.org`, `hello@earthwise.org`) and catalog opportunities.

| Command | Environment | Purpose |
| --- | --- | --- |
| `pnpm db:migrate` | Local PGlite, Preview, Production | Apply schema. Does not delete rows. |
| `pnpm db:seed` | Local development only | Insert-if-absent demo users/opportunities |
| `pnpm db:import-sqlite` | One-time local import | Copy missing emails from old SQLite |

## 6. Deploy to Vercel

1. Connect the GitHub repository.
2. Framework preset: Next.js.
3. Install command: `corepack pnpm install` (or Vercel’s default for pnpm).
4. Build command: `corepack pnpm exec next build`
5. Deploy Production after env vars and migrations are in place.

Optional local check (does not print secret values):

```bash
corepack pnpm check:prod-env
```

## 7. Post-deploy smoke checks

These must be run against the **hosted** URL. Local PGlite results do not count as production verification.

### Authentication

- Register a new student (not a demo email).
- Confirm the verification email arrives and the code is not shown in the UI or API JSON.
- Login, logout, restore session, change password (old session must fail).

### Student

- Complete profile, browse opportunities, open one, apply, view the application after refresh.

### Employer

- Register an employer. Organization stays `pending`.
- Confirm they cannot publish.
- Approve the organization as an admin.
- Employer creates and publishes an opportunity.
- Student applies; employer sees the applicant and can change status.

### Security

- Student cannot post opportunities.
- Employer A cannot read/edit Employer B data.
- Public portfolio does not include passwords, sessions, or private applications.
- Uploads reject executables / oversized files; another student cannot download the file.

### Persistence

Create a user, opportunity, and application. Trigger a new serverless request (or redeploy). Confirm the rows still exist in hosted PostgreSQL.

Optional:

```bash
BASE_URL=https://your-production-host corepack pnpm test:security
```

Do not claim the HTTP security suite passed in production unless that command was actually run against the hosted URL.

## 8. Known production limitations

- Rate limits are stored in PostgreSQL and are shared across Vercel instances. They are not a Redis/Upstash limiter and are not fully atomic under heavy concurrent writes.
- There is no long-running worker. Deadline-approaching notifications are not scheduled.
- Admin user/category screens still use prototype lists, not a full admin user API.
- Match scores are a platform heuristic, not a validated psychometric model.
