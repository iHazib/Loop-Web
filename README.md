# Loop Retail

Marketing website and content platform for **Loop Retail** — a UK retail growth operator helping foreign brands enter and scale in the UK across marketplaces, brand protection, retail expansion, and DTC.

The project is a single‑page React app (the public marketing site + a built‑in blog and admin CMS) backed by a small Express API that persists content and enforces admin authentication server‑side.

- **Theme:** red / black / white · Inter + Space Grotesk
- **Stack:** React 19 · TypeScript · Vite 6 · Tailwind CSS v4 · Framer Motion · React Router · Express

---

## Features

**Marketing site**
- Animated home page and four service pages — Marketplace Control, Brand Protection, Retail Expansion, DTC Growth — sharing a common navbar/footer and a cohesive premium hero system.

**Blog**
- Public journal with a featured post, category filters and search (`/blog`)
- Individual article pages with markdown rendering and related posts (`/blog/:slug`)

**Contact**
- Contact form (`/contact`) that submits enquiries straight into the admin inbox, tagged by category.

**Admin CMS** (`/admin`)
- Dashboard with content/enquiry stats
- Post manager + editor (markdown, live preview, cover image, tags, SEO fields, draft/publish, featured)
- Filterable enquiry inbox (by status + category + search) with reply / mark‑replied / archive / delete

**Authentication** (server‑enforced)
- Google Sign‑In → Google ID token **verified on the server**
- Email **allowlist** + **passcode** (two factors)
- httpOnly, signed session cookie

---

## Architecture

```
Browser (React SPA)                Express API (server/)
┌────────────────────┐  /api/*    ┌─────────────────────────┐
│ pages, blog, admin │ ─────────▶ │ auth · posts · queries  │
│ src/lib/store.ts   │  fetch     │ Google token verify     │
│  (reactive cache)  │ ◀───────── │ allowlist + passcode    │
└────────────────────┘            │ JSON store (data.json)  │
                                   └─────────────────────────┘
```

- **Frontend** reads through a reactive in‑memory cache (`src/lib/store.ts`) hydrated from the API; mutations call the API and update the cache.
- **Backend** owns all data (`server/storage.ts`, a JSON file) and all authorization (`server/auth.ts`). No security decision is made in the browser.
- In dev, Vite proxies `/api` to the API server. In production the API server serves the built frontend from `dist/`.

---

## Quick start

**Prerequisites:** Node.js 18+

```bash
# 1. Install
npm install

# 2. Configure (see Environment variables below)
cp .env.example .env        # then fill in the values

# 3. Run frontend + API together
npm run dev:full
```

- Site: http://localhost:3000
- API:  http://localhost:8787

> The public site and blog work without any configuration. **Admin login requires the auth env vars below.**

---

## Environment variables

Create a `.env` file in the project root (it is git‑ignored). Both Vite and the API server read it.

| Variable | Required | Scope | Description |
|---|---|---|---|
| `VITE_GOOGLE_CLIENT_ID` | for admin | client | Google OAuth Client ID — renders the Sign‑In button. Public by design. |
| `GOOGLE_CLIENT_ID` | for admin | server | Same value as above — used to verify ID tokens. |
| `ADMIN_EMAILS` | for admin | server | Comma‑separated allowlist of admin emails, e.g. `you@gmail.com,team@brand.com`. |
| `ADMIN_PASSCODE` | for admin | server | Second‑factor passcode. **Never** prefix with `VITE_`. |
| `JWT_SECRET` | in production | server | Long random string used to sign session cookies. Required in prod; random per‑boot in dev. |
| `PORT` | no | server | API port (default `8787`). |

> Admin login is **fail‑closed**: without `ADMIN_EMAILS` + `ADMIN_PASSCODE`, no one can sign in. There are no built‑in defaults.

### Setting up Google Sign‑In

1. In [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services → Credentials → Create credentials → OAuth client ID**, choose **Web application**.
2. Under **Authorised JavaScript origins**, add your origin(s) — e.g. `http://localhost:3000` for dev and your production URL.
3. Copy the Client ID into `.env` as both `VITE_GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_ID`.
4. Set `ADMIN_EMAILS`, `ADMIN_PASSCODE`, and (for production) a strong `JWT_SECRET`:
   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```

---

## Scripts

| Script | Description |
|---|---|
| `npm run dev:full` | Run Vite **and** the API server together (recommended for development). |
| `npm run dev` | Vite dev server only (port 3000). |
| `npm run server` | API server only with watch/reload (port 8787). |
| `npm run build` | Build the frontend to `dist/`. |
| `npm run start` | Run the API server, serving the built `dist/` (production). |
| `npm run preview` | Preview the production build via Vite. |
| `npm run lint` | Type‑check the whole project (`tsc --noEmit`). |

---

## Routes

**Public**

| Path | Page |
|---|---|
| `/` | Home |
| `/marketplace-control` · `/brand-protection` · `/retail-expansion` · `/dtc-growth` | Service pages |
| `/blog` · `/blog/:slug` | Blog index · article |
| `/contact` | Contact form |

**Admin** (gated)

| Path | View |
|---|---|
| `/admin` | Dashboard |
| `/admin/posts` · `/admin/posts/new` · `/admin/posts/:id` | Post list · create · edit |
| `/admin/inbox` | Enquiry inbox |

**API**

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| `POST` | `/api/auth/google` | — | Verify Google token + passcode, set session |
| `GET` | `/api/auth/me` | cookie | Current admin session |
| `POST` | `/api/auth/logout` | — | Clear session |
| `GET` | `/api/posts` | optional | Published posts (all posts if authed) |
| `POST` / `PUT` / `DELETE` | `/api/posts[/:id]` | required | Create / update / delete posts |
| `POST` | `/api/queries` | — | Submit a contact enquiry |
| `GET` / `PATCH` / `DELETE` | `/api/queries[/:id]` | required | List / update / delete enquiries |

---

## Project structure

```
server/                 Express API
  index.ts                routes + static serving
  auth.ts                 Google verify · allowlist · passcode · sessions
  storage.ts              JSON-file data store (data.json — git-ignored)
src/
  main.tsx                router
  pages/                  home + service pages, blog, contact
  admin/                  AdminLayout (auth gate) + dashboard, posts, editor, inbox
  components/             shared UI (NavBar, Footer, Hero, …)
  lib/
    api.ts                frontend API client
    store.ts              reactive cache + hooks (usePosts/useQueries/useReady)
    auth.ts               client auth helpers (Google button + relay)
    markdown.ts           minimal markdown → HTML renderer
```

---

## Security

- **No secrets in the repository or git history** — all credentials come from environment variables only.
- Admin **authorization is enforced server‑side**: Google ID tokens are verified with `google-auth-library`; the email allowlist and passcode are checked in `server/auth.ts`, never in the browser.
- Session cookies are **httpOnly**, `SameSite=Lax`, and `Secure` in production; the passcode is compared in constant time.
- Server‑only secrets are never exposed with a `VITE_` prefix (those get bundled into public client JS). Only the (public) Google Client ID is available client‑side.

If you ever commit a real secret by accident, **rotate it** — git history is public.

---

## Data persistence & deployment

The backend stores content in `server/data.json` (created automatically, git‑ignored). This is ideal for local use and single‑instance hosting.

For serverless/multi‑instance hosts (e.g. Cloud Run) the filesystem is ephemeral — swap `server/storage.ts` for a database (its functions are the only seam you need to change; the HTTP layer and frontend stay the same).

**Production:** `npm run build` then `npm run start` (the API server serves `dist/` and the API on the same origin). Set all required env vars on the host, including a strong `JWT_SECRET`.

---

© Loop Retail. All rights reserved.
