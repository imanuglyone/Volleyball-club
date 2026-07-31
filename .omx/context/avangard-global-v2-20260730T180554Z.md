# Avangard Global V2 — Context

## Activation

User explicitly requested implementation of the approved global update plan for the
Avangard volleyball club.

## Desired outcome

- A standalone cinematic public site with browser booking and secure cancellation.
- A faster Telegram Mini App for repeat players.
- A redesigned responsive admin workspace.
- A new dark ice-cobalt identity, generated media, and custom iconography.

## Clarified product decisions

- The public surface is one large landing page plus public schedule/detail/manage routes.
- Browser users can book without Telegram.
- Browser bookings use a secret management link.
- Web bookings can be claimed after a phone number is verified by a Telegram contact share.
- The Mini App prioritizes the nearest training and keeps the existing core feature set.
- No SMS login, payments, CMS, waitlist, or attendance statistics.
- Visual direction (revised by user 2026-07-31): cinematic sport, night navy `#080B12`,
  cobalt `#4D6BFF`, ice blue `#A7D8FF`, and off-white `#F3F1EA`.
- No real photos. Gemini supplies scene loops; ChatGPT supplies brand exploration and icons.
- No runtime WebGL. Use prerendered 3D media and lightweight motion.
- Public site is visual-first; Mini App is performance-first.
- Admin UX and visual language are included.
- Rollout is phased with server-side feature flags.

## Repository evidence

- Next.js 14 App Router, React 18, Supabase, Telegram Web App.
- The global layout currently loads Telegram SDK on every surface.
- Public and Mini App routes currently overlap.
- `TrainingFeed` fetches only after hydration and repeats requests.
- Production schema includes `player_id`, `phone_normalized`, `claim_player`, and
  `cancel_booking_and_promote`, but repo migrations do not reproduce them.
- Production inventory at audit: 36 trainings, 445 bookings, 13 profiles.
- The database uses UTC defaults while the club operates in `Asia/Irkutsk`.

## Constraints

- Preserve business rules and atomic capacity control.
- Never expose phones, Telegram initData, service keys, or management tokens.
- Preserve the checkpoint commit `22740f9`.
- Gemini videos are an external delivery; the implementation must ship poster fallbacks.
- Production database mutations and feature-flag activation require a separate explicit
  deployment step after local verification.

## Main touchpoints

- `DESIGN.md`
- `app/`, `components/`, `styles/`
- `lib/services`, `lib/telegram`, `lib/supabase`
- `sql/`
- tests and visual artifacts

## Interview completion

The prior planning conversation resolved product scope, audience, identity, media strategy,
route separation, browser booking management, Telegram phone verification, performance
priorities, admin scope, contacts, and rollout. No material ambiguity remains for local
implementation.
