# Avijit Saha — Portfolio

Full-stack personal portfolio for **Avijit Saha**, MERN stack developer & React specialist.

Live: [avijitsaha.netlify.app](https://avijitsaha.netlify.app/)

## Stack

| Layer | Choice |
| --- | --- |
| Framework | [Astro 7](https://astro.build) — content-first, ships almost no JavaScript |
| Content | Astro content collections (Markdown) for projects, experience, education and skills |
| Styling | Hand-written CSS with design tokens (no framework, no build step for styles) |
| Database & auth | [Supabase](https://supabase.com) (Postgres + Row Level Security + email/password auth) |
| Motion | Local `typed.js` for the hero headline, CSS + IntersectionObserver everywhere else |
| Hosting | Netlify adapter (static pages + on-demand `/api/*` and `/admin/*` routes) |

The public portfolio is prerendered to static HTML at build time. Only the contact endpoint and the
protected inbox render on demand, which keeps the site fast while still supporting a real database.

## Features

- Fully responsive layout (360px → 1440px), reduced-motion and keyboard support.
- Contact form that writes to Supabase, with validation, a honeypot and per-IP throttling.
- Graceful fallback: if Supabase is not configured, the form returns a clear message and links to
  email instead of failing silently.
- Password-protected `/admin` inbox: read, mark read/unread, reply and delete messages.
- Content lives in Markdown — no HTML edits needed to add a project.

## Getting started

```bash
npm install
cp .env.example .env   # then fill in your Supabase values
npm run dev            # http://localhost:4321
```

The site runs without Supabase configured. The contact form will explain that messaging is not
connected, and `/admin` shows the setup steps instead of a login form.

## Supabase setup

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. Open **SQL Editor**, paste the contents of [`supabase/schema.sql`](supabase/schema.sql) and run it.
   This creates the `messages` table, indexes and RLS policies.
3. Go to **Project Settings → API Keys** and copy:
   - Project URL → `PUBLIC_SUPABASE_URL`
   - Publishable key (`sb_publishable_…`, or the legacy `anon` JWT) → `PUBLIC_SUPABASE_ANON_KEY`
   - Secret key (`sb_secret_…`, or the legacy `service_role` JWT) → `SUPABASE_SERVICE_ROLE_KEY`
     (server only, never commit). Optional — leave blank to use the anon key + RLS.
4. Create your admin login under **Authentication → Users → Add user → Create new user**.
   Use any email and password you choose and enable **Auto Confirm User**. There is no public
   sign-up, so this is the only account that can read the inbox.
5. Restart `npm run dev`, then sign in at `/admin/login` with that email and password.

> The service role key lets the server write messages and read the inbox without relying on a
> signed-in session. If you omit it, the app falls back to the anon key plus RLS, which still works
> for the admin area once you are signed in.

## Editing content

All portfolio content is Markdown under `src/content/`:

```
src/content/
├── projects/      # one file per project card
├── experience/    # one file per role
├── education/     # one file per school / program
└── skills/        # one file per skill group
```

Frontmatter is validated by Zod in [`src/content.config.ts`](src/content.config.ts), so a typo in a
required field fails the build instead of shipping a broken card.

Identity, contact details, hero copy and section headings live in
[`src/data/site.ts`](src/data/site.ts).

## Project structure

```
public/assets/            images, icons, typed.js
src/
├── components/           Header, Hero, About, Experience, Projects, Skills, Education, Contact
├── content/              Markdown collections
├── data/site.ts          identity, nav, hero + section copy
├── layouts/BaseLayout.astro
├── lib/supabase.ts       admin client, cookie-aware server client
├── middleware.ts         session refresh + /admin guard
├── pages/
│   ├── index.astro       the portfolio (prerendered)
│   ├── api/contact.ts    contact form endpoint
│   ├── api/auth/         sign in / sign out
│   ├── api/messages/[id].ts
│   └── admin/            login + inbox (on demand, noindex)
├── scripts/site.ts       nav, scroll reveal, header state
└── styles/global.css     design tokens and all styling
supabase/schema.sql       table, indexes and RLS policies
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server on port 4321 |
| `npm run build` | Build the static site and the Netlify function |
| `npm run preview` | Preview the production build locally |

## Deploying

The repo includes `netlify.toml`. Connect it to Netlify and add the three environment variables from
`.env.example` under **Site settings → Environment variables**, then deploy. Any Astro adapter can be
swapped in `astro.config.mjs` for Vercel, Cloudflare or Node hosting.

## Contact

- Email: [avijitsahashovo2016@gmail.com](mailto:avijitsahashovo2016@gmail.com)
- GitHub: [github.com/avijitsaha01](https://github.com/avijitsaha01)
- LinkedIn: [linkedin.com/in/avijit2021](https://www.linkedin.com/in/avijit2021/)
