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
  - `sql/004_cleanup_bookings.sql`

4) Create admin user
- Supabase Dashboard -> Authentication -> Users -> Create user (email/password).

5) Run locally
```bash
npm run dev
```

## Deployment (Vercel)
- Set the same env vars in Vercel Project Settings -> Environment Variables.
- Redeploy after changing env variables.

## Telegram bot commands
Enable bot commands via webhook:

1) Set webhook:
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook" \\
  -d "url=https://your-domain.com/api/telegram" \\
  -d "secret_token=<YOUR_SECRET>"
```

2) Add env vars:
```
TELEGRAM_BOT_TOKEN=
TELEGRAM_WEBHOOK_SECRET=
```

Commands:
- `/list 2026-01-24` — list of names for the date
- `/stats 2026-01-24` — booked/free stats for the date

Date formats: `YYYY-MM-DD` or `DD.MM.YYYY`.

## Cleanup old bookings
Use SQL function to delete bookings for trainings before a date:
```sql
select cleanup_old_bookings('2026-01-01');
```

## API endpoints
- `GET /api/trainings?from=YYYY-MM-DD&to=YYYY-MM-DD`
- `GET /api/trainings/by-date?date=YYYY-MM-DD`
- `POST /api/bookings`

## Notes
- Bookings are inserted only via server API with `SUPABASE_SERVICE_ROLE_KEY`.
- Capacity checks are enforced in Postgres function `create_booking`.
- Telegram messages are sent via Bot API if tokens are set.

## Telegram Mini App

The mobile application validates Telegram `initData` on the server, creates a profile linked to `telegram_user_id`, and lets that verified user view and cancel only their own individual bookings. `initDataUnsafe` is not trusted for authorization and `SUPABASE_SERVICE_ROLE_KEY` remains server-only.

Additional environment variables:

```env
NEXT_PUBLIC_APP_URL=https://your-domain.com
TELEGRAM_INIT_DATA_MAX_AGE_SECONDS=86400
```

Apply `sql/005_telegram_mini_app.sql` after migrations 001–004. It adds `profiles`, links `bookings.profile_id`, adds indexes, preserves legacy `name + phone`, and installs profile-aware atomic booking/cancellation RPCs.

### BotFather and webhook setup

1. Deploy the app over HTTPS and set `NEXT_PUBLIC_APP_URL` to its public origin.
2. In BotFather use `/mybots` → your bot → **Bot Settings** → **Menu Button** and set the application URL.
3. Configure **Main Mini App** with the same URL.
4. Configure commands `start`, `next`, `list`, `stats`, and `help`.
5. Register `/api/telegram` as the webhook and pass a strong `secret_token` matching `TELEGRAM_WEBHOOK_SECRET`.

`/start` sends an «Открыть приложение» Web App button. The administrative `/next`, `/list`, `/stats`, and `/help` commands remain available. Cancellation is performed inside the Mini App against one selected booking.

The public screens render in a regular browser without Telegram. Personal actions require a signed Telegram launch and show a clear entry-state instead of crashing.

### Verification

```bash
npm run lint
npm test
npm run build
```
