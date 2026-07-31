# Avangard V2 UltraQA report

## Verdict

Local application quality gate: **PASS WITH RELEASE BLOCKERS**.

The implementation passed static analysis, unit tests, production build,
bundle budget, dependency audit, full responsive browser coverage, Axe checks,
core user journeys, and adversarial API boundary tests.

Release remains blocked until:

1. the credentialed production schema export is captured and the migrations
   are replayed on a disposable production-shaped database;
2. the reviewed migration is applied through the staged rollout, never
   directly from this local QA run.

## Evidence

| Gate | Result |
|---|---|
| ESLint | Pass |
| TypeScript | Pass |
| Vitest | 11 files, 39 tests passed |
| Next.js production build | Pass |
| Mini App bundle | 119.5 KiB gzip max; budget 180 KiB |
| Dependency audit | 0 vulnerabilities |
| Playwright | 51 passed, 9 intentional cross-project skips, exit code 0 |
| Lighthouse public | Performance 0.95, accessibility 1.00, SEO 1.00, LCP 2667 ms, CLS 0.000006 |
| Lighthouse Mini App | Performance 0.98, accessibility 1.00, LCP 2270 ms, TBT 2.5 ms |
| Production Supabase inspection | 36 trainings, 445 bookings, 13 profiles; read-only |
| Independent code review | APPROVE |
| Independent architecture review | CLEAR / APPROVE |

Lighthouse evidence was captured at 2026-07-31T05:52–05:53Z. The later code
changes affected validation, SQL contracts, and tests rather than visual
layout; the fresh production build and bundle budget passed after those
changes. A subsequent Lighthouse wrapper attempt hung and was not counted.

## Rework cycle

The first current E2E attempt was correctly rejected:

- one adversarial fixture was not guaranteed to exceed the schema limit and
  reached the unavailable local database;
- one Mini App test hit a corrupted Next development cache and displayed
  `__webpack_require__.C is not a function`.

The fixture was made deterministically invalid, `.next` was removed after
verifying the exact workspace path, the server was restarted, and the full
suite was rerun. The second run completed with exit code 0.

## Database security finding

Read-only Supabase inspection found four existing production tables with RLS
disabled: `telegram_links`, `auth_codes`, `auth_sessions`, and
`telegram_booking_states`. `auth_sessions` contains a token column and was
directly accessible to `anon` and `authenticated`. The legacy PII-bearing
`players` table had RLS enabled but also retained client-role grants.

Migration `008_avangard_v2.sql` now conditionally enables RLS and revokes
client-role access for these legacy tables and `players`. It also
catalog-enumerates every overload of the legacy RPC names `claim_player`,
`cancel_booking_and_promote`, and `create_booking`, restricts them to
`service_role`, and pins their search path. A redacted production-shaped CI
fixture proves this contract without copying production data.

Production was deliberately not changed during this QA run.

## Existing Vercel runtime observations

The currently deployed legacy build recorded 45 Telegram `sendMessage` 400
responses in the previous seven days and one duplicate-date training creation
error. These are documented in
`docs/vercel-runtime-audit-2026-07-31.md` and remain rollout smoke checks; the
V2 working tree has not been deployed.
