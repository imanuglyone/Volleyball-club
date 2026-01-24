# Volleyball Club Booking (Next.js 14 + Supabase)

Production-ready booking site for a volleyball club with public calendar UI and admin panel.

## Features
- Public calendar: select a date and see trainings for that day.
- Booking form: name + phone, no online payments.
- Capacity control with atomic booking (Postgres RPC).
- Admin panel: create/edit trainings, manage capacity and visibility.
- Booking list per training with cancel action.
- Telegram notifications on new booking and cancel.
- Dark, modern UI with animations.

## Tech stack
- Next.js 14 (App Router) + TypeScript
- TailwindCSS
- Supabase (Postgres + Auth)
- Server-side Route Handlers for all writes

## Folder structure
- `app/` - routes, layouts, API handlers
- `components/` - UI components
- `lib/` - helpers, validators, Supabase clients
- `sql/` - database migrations

## Quick start
1) Install dependencies
```bash
npm install
```

2) Create `.env.local` from `.env.example`
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

3) Supabase setup
- Create a Supabase project.
- Run SQL migrations in this order:
  - `sql/001_init.sql`
  - `sql/002_add_location.sql`
  - `sql/003_refresh_trainings_stats.sql`

4) Create admin user
- Supabase Dashboard -> Authentication -> Users -> Create user (email/password).

5) Run locally
```bash
npm run dev
```

## Deployment (Vercel)
- Set the same env vars in Vercel Project Settings -> Environment Variables.
- Redeploy after changing env variables.

## API endpoints
- `GET /api/trainings?from=YYYY-MM-DD&to=YYYY-MM-DD`
- `GET /api/trainings/by-date?date=YYYY-MM-DD`
- `POST /api/bookings`

## Notes
- Bookings are inserted only via server API with `SUPABASE_SERVICE_ROLE_KEY`.
- Capacity checks are enforced in Postgres function `create_booking`.
- Telegram messages are sent via Bot API if tokens are set.
