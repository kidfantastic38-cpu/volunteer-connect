# VOLUNTEER CONNECT

Career-readiness web app: students turn volunteering, projects, internships, and leadership into skills, a CV, a digital portfolio, and matched jobs, internships, scholarships, volunteering, and training.

This repository is an interactive **prototype** (Next.js). User accounts are stored in a local **SQLite** database at `data/volunteer-connect.sqlite`. Profile progress is saved to that database after login. A same-tab session is also cached in `sessionStorage`.

## Quick start

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

| Script | Purpose |
| --- | --- |
| `pnpm dev` | Local development |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build (use this for demos) |
| `pnpm lint` | ESLint |

## Demo in 10 seconds

| URL | What happens |
| --- | --- |
| `/` | Marketing landing |
| `/demo` | Sign in as **Amara Okafor** (full sample profile) → dashboard |
| `/demo/admin` | Sign in as platform admin |
| `/login` | Form + “Explore the demo profile” |
| `/design-system` | Tokens |
| `/components` | Component library |

Login: `amara@example.com` / `password` (or **Explore the demo profile**). Admin: `admin@volunteerconnect.org` / `password`. OTP for new accounts: `481920`.

**Presenting?** Follow [docs/handoff/09-demo-presentation.md](docs/handoff/09-demo-presentation.md).

## Deploy (Vercel)

1. Push to GitHub.
2. Import at [vercel.com/new](https://vercel.com/new) — framework Next.js, no environment variables required.
3. Or: `pnpm dlx vercel --prod`

## Documentation

Full handoff pack (IA, tokens, components, flows, QA, demo script):

**[docs/handoff/README.md](docs/handoff/README.md)**
