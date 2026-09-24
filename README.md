# LinkPulse

URL shortener and click analytics for a polished full-stack MVP.

## Stack

- Next.js 16 (App Router) · TypeScript · Tailwind CSS
- Supabase Auth · PostgreSQL · Row Level Security
- Zod · Lucide React · Vercel-ready

## Local setup

### 1. Install

```bash
npm install
cp .env.local.example .env.local
```

### 2. Configure environment

Set in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL` (e.g. `http://localhost:3000`)

Do **not** add a service-role key. Public redirects use a `SECURITY DEFINER` RPC.

### 3. Supabase project (manual)

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run the full contents of:

   `supabase/migrations/001_linkpulse_init.sql`

3. **Authentication → Providers**: enable Email. Disable OAuth / magic link for this MVP.
4. **Authentication → URL configuration**:
   - Site URL: `http://localhost:3000` (or your deployed origin)
   - Redirect URLs: `http://localhost:3000/auth/callback` (and production equivalent)
5. If **Confirm email** is enabled, signup without an immediate session shows a “Check your email” state; `/auth/callback` exchanges the confirmation code for a session.

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run lint` | ESLint |
| `npm run build` | Production build |
| `npm start` | Serve production build |

## Security notes

- Dashboard mutations use the user session + RLS (`user_id = auth.uid()`).
- Public `/{shortCode}` calls `resolve_and_click` with the anon key only.
- Missing and disabled links share the same unavailable experience.
- Destination URLs are validated to `http:` / `https:` only; the app never fetches destinations.
- Click analytics store coarse referrer / device / browser only — no IP, geo, or raw UA.

## Redirect vs analytics

If a link is valid and active but click insert fails inside the RPC, the visitor is still redirected. Availability is prioritized over perfect click counts.
