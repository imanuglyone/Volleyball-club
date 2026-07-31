# Telegram Mini App reference correction

## Task statement

Bring only the Telegram Mini App surfaces back toward the approved mobile portion of `MIDNIGHT_COURT_REFERENCE.png`, then show a local preview before any deployment.

## Desired outcome

- Compact 390×844-oriented screens that expose the next useful action immediately.
- Visual hierarchy matching the approved five-phone reference: compact brand header, dense cards, restrained violet signal, small bottom navigation.
- Local screenshots for home, schedule, training detail, bookings, and profile before deployment.

## Known facts and evidence

- Approved reference: `artifacts/visual-ralph/telegram-mini-app/reference.png`.
- Current production screenshots supplied by the owner show oversized marketing typography, excessive vertical gaps, large gradient navigation states, and oversized cards.
- Current routes and business flows are already implemented and must remain unchanged.
- Visual fixtures exist behind `?visual=1` in development.

## Constraints

- Do not deploy, push, or update production before owner approval of preview.
- Do not modify Supabase, Telegram authentication, API contracts, booking RPC, admin behavior, or public-site design.
- Keep four navigation destinations, Telegram safe areas, accessible touch targets, reduced motion, and public roster privacy.
- No Three.js, WebGL, Spline, or new heavy dependency.

## Open questions

- A real player/court photo asset is not available; use existing lightweight CSS/SVG visual language in preview without inventing third-party photography.
- Owner approval is required before deployment.

## Likely codebase touchpoints

- `DESIGN.md`
- `components/app/AppShell.tsx`
- `app/app/page.tsx`
- `components/app/TrainingCard.tsx`
- `styles/mini-app.css`
- Existing Mini App screens and shared UI components, if visual parity requires small markup adjustments.
