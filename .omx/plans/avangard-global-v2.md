# Avangard Global V2 — Approved implementation plan

## Architecture invariants

1. Public, Mini App, and admin surfaces have distinct layouts and route namespaces.
2. Telegram SDK and initData authentication are confined to `/app`; every personal API validates
   initData signature and age on every request.
3. Public schedule data is server-rendered and cacheable; personal/manage/admin data is always
   dynamic with `Cache-Control: private, no-store`.
4. Booking capacity, duplicate prevention, cancellation, token rotation, and booking claims are
   atomic database operations protected by row locks and unique partial indexes.
5. Browser management tokens are 256-bit CSPRNG values, returned once, transported in a URL
   fragment, and stored only as SHA-256 hashes.
6. A phone number may claim prior web bookings only after verified Telegram contact ownership.
7. All club-time comparisons use `timezone('Asia/Irkutsk', now())`.
8. Anonymous users cannot read `bookings`, `profiles`, token hashes, or audit data.
9. Generated media never blocks primary content or reduced-motion fallbacks.
10. All migrations are additive and backward-compatible until a later, separately approved
    contract migration.

## Current production-to-canonical mapping

- `profiles` is the canonical Telegram identity table.
- `bookings.profile_id` is the canonical personal-booking relationship.
- `players`, `bookings.player_id`, `auth_codes`, `auth_sessions`, `telegram_links`, and
  `telegram_booking_states` are retained as read-compatible legacy structures; V2 does not drop or
  dual-write them.
- `bookings.phone_normalized` is canonical for duplicate detection and claim matching.
- Existing `profile_id IS NOT NULL` bookings backfill to `source='telegram'`; all remaining
  bookings backfill to `source='web'`.
- `claim_player` and `cancel_booking_and_promote` remain callable for legacy compatibility but V2
  routes use the new explicit RPCs.

Before migration authoring, capture table columns, indexes, constraints, RLS policies, grants, and
`pg_get_functiondef` output for all production RPCs. Store a redacted schema snapshot as test input.

Clean installs add `sql/005a_legacy_production_compat.sql`, which runs before `006` and recreates
the captured production legacy objects exactly: `players`, `auth_codes`, `auth_sessions`,
`telegram_links`, `telegram_booking_states`, `bookings.player_id`, `bookings.phone_normalized`,
their indexes/grants/RLS, and the captured `claim_player`/`cancel_booking_and_promote` definitions.
Objects absent from the captured production snapshot are not invented. `006` and `007` remain
unchanged and become valid on a clean sequential run.

## Route and layout cutover

1. Reduce `app/layout.tsx` to fonts, metadata, and global CSS only.
2. Add `app/(public)/layout.tsx` for public header/footer and server-rendered data.
3. Add `app/app/layout.tsx` for Telegram script, `TelegramProvider`, Mini App cache, and shell.
4. Keep `app/admin/layout.tsx` as the authenticated admin boundary.
5. Move existing personal pages first:
   - `/schedule` → `/app/schedule`
   - `/trainings/[id]` → `/app/trainings/[id]`
   - `/bookings` → `/app/bookings`
   - `/profile` → `/app/profile`
6. Update all Mini App links and Bot deep links, then install redirects:
   - `/bookings` → `/app/bookings`
   - `/profile` → `/app/profile`
   - legacy Mini App training links may include `?surface=app` and redirect to `/app/trainings/[id]`.
7. Only after Mini App route acceptance, assign `/schedule` and `/trainings/[id]` to public pages.

Exact flag routing:

| Mini flag | Site flag | Route behavior |
|---|---|---|
| false | false | all legacy routes and legacy UI remain active |
| true | false | V2 lives under `/app/**`; `/schedule` and `/trainings/**` remain legacy |
| false | true | invalid combination; site flag fails closed and legacy UI is served |
| true | true | `/app/**` is V2 and public pages own `/schedule` plus `/trainings/**` |

`ADMIN_V2_ENABLED=true` is valid only when both Mini and Site flags are true. The compatibility
route shell and strict combination parser ship before any surface flag is enabled.

## Cache contract

- Shared server DAL uses `unstable_cache` rather than self-fetching route handlers.
- Tags:
  - `public-trainings`
  - `training:<uuid>`
- Public DAL: `revalidate: 60`; public API emits
  `public, s-maxage=60, stale-while-revalidate=300`.
- Admin create/update/delete/toggle, public create/cancel, Mini App create/cancel, and claim RPC
  callers invoke `revalidateTag('public-trainings')` and the affected training tag.
- `/api/mini-app/**`, `/api/public/bookings/**/manage`, `/admin/**`, and all token exchanges are
  forced dynamic and emit `private, no-store`.
- Cached remaining-capacity values are informational. The locked RPC is authoritative and returns
  the post-mutation remaining count.

## Booking and identity contracts

### Distributed abuse protection

- Production public booking requires a valid Cloudflare Turnstile token. Development/test can use
  an explicit mock verifier; production fails closed if Turnstile secrets are absent.
- A Supabase-backed atomic rate-limit RPC supplements Turnstile:
  - 20 attempts per HMAC-hashed IP per rolling 10 minutes;
  - 3 attempts per HMAC-hashed normalized phone + training per 15 minutes;
  - hashes use a server-only rotating `RATE_LIMIT_HMAC_SECRET`; raw IP and phone are never stored.
- Limit rows expire after 24 hours and are pruned opportunistically plus by daily cron.
- Responses use `429` and `Retry-After`; limit outcome events contain only bucket type and result.
- The booking form includes a server-validated honeypot field.

### Atomic create

1. Lock the target training `FOR UPDATE`.
2. Validate active state and Irkutsk-local start time.
3. Reject an existing active normalized-phone or profile booking via partial unique constraints.
4. Count active bookings while holding the training lock.
5. Reject when capacity is exhausted.
6. Insert and return booking id plus remaining capacity in the same transaction.

### Management token

- Generate 32 random bytes and encode base64url.
- Persist `digest(token, 'sha256')`, `manage_token_expires_at` (30 days), and
  `manage_token_version`; never persist raw token.
- Return `/booking/<id>#token=<raw-token>`.
- The manage client reads the fragment, removes it with `history.replaceState`, and POSTs the token
  to the exchange endpoint with same-origin validation.
- Exchange verifies expiry and digest in the database, rotates to a new random token/digest, and
  issues a booking-specific `__Host-avangard-booking-<id>` cookie with `Secure`, `HttpOnly`,
  `SameSite=Lax`, `Path=/`, and a 30-day lifetime so the corresponding `/api/**` handlers receive it.
- Cancellation validates the cookie token atomically, marks the booking cancelled, clears/revokes
  the digest, and expires the cookie.
- Replayed, expired, rotated, or mismatched tokens return `404` without revealing booking existence.
- Tokens, digests, phones, cookies, initData, and service credentials are mandatory log-redaction
  fields.

### Telegram contact and claims

- Handle `message.contact` before text-command parsing.
- Accept only a private-chat message where `message.from.id === message.contact.user_id`.
- A single database RPC/transaction normalizes the phone, updates `profiles.phone` and
  `phone_verified_at`, and claims eligible bookings; the server must not split these into
  sequential Supabase requests.
- `claim_web_bookings` re-checks `phone_verified_at`, matches active/history web bookings by
  `phone_normalized`, and sets `profile_id`.
- If that profile already owns another active booking for the same training, preserve the
  profile-owned booking and leave the web booking unclaimed; emit a non-PII conflict audit event.
- Claims are idempotent. No automatic unlinking is provided in V2.

## Versioned API contracts

- `GET /api/public/trainings` → `{ version: 1, trainings: PublicTraining[] }`.
- `POST /api/public/bookings` accepts
  `{ version: 1, training_id, name, phone, consent: true, consent_version,
  idempotency_key, turnstile_token, website }` and returns
  `{ booking_id, remaining, manage_url }`.
- `POST /api/public/bookings/[id]/manage/exchange` accepts `{ token }`; success is `204` plus cookie.
- `GET /api/public/bookings/[id]/manage` returns a PII-minimized booking summary when cookie-valid.
- `POST /api/public/bookings/[id]/manage/cancel` is cookie-authenticated and idempotent.
- `POST /api/mini-app/bootstrap` → `{ version: 1, server_time, profile, next_training,
  bookings_summary }`.
- Compatibility endpoints keep their existing shapes and delegate to the same services during the
  seven-day window.
- Public create uses `booking_idempotency(scope, key, request_hash, booking_id, created_at,
  expires_at)` with unique `(scope, key)`. `scope='public-create'`, `key` is a UUID,
  `request_hash` is SHA-256 of the canonical validated payload excluding Turnstile response.
- The idempotency row and booking are created/locked in the same transaction. Concurrent identical
  retries serialize, return the same booking, and atomically rotate a fresh management token/link.
- Reusing a key with a different request hash returns `409 conflict`. Rows expire after 24 hours
  and are removed after 48 hours by the daily cleanup.
- Stable error codes: `validation`, `unauthorized`, `expired`, `booking_duplicate`,
  `booking_full`, `training_inactive`, `not_found`, `conflict`, `rate_limited`, `server_error`.

## Migration sequence

1. **Snapshot:** capture and redact exact production schema/functions; record row counts.
2. **Expand:** add nullable `source`, token digest/expiry/version, idempotency key,
   `profiles.phone_verified_at`, consent evidence fields, rate-limit/idempotency/audit tables,
   indexes, and new V2 RPCs. Do not change current reads.
3. **Backfill:** normalize missing phones in bounded batches; set deterministic source values;
   validate orphan and duplicate counts.
4. **Validate:** assert table counts equal the captured snapshot; 36 trainings, 445 bookings, and
   13 profiles are the current audited baseline, not hard-coded future expectations. Assert all
   active duplicates and orphans are understood.
5. **Switch writes:** V2 APIs use the new RPCs; legacy APIs remain available.
6. **Switch reads:** public DAL and Mini App bootstrap use canonical columns.
7. **Observe:** seven-day compatibility window with reconciliation and error metrics.
8. **Contract later:** legacy tables/columns/functions are not dropped in this delivery. Removal
   requires a separate backup, approval, and migration after the observation window.

Rollback before switch-writes is schema-only and non-destructive. After switch-writes, rollback
means disabling V2 flags and returning to legacy APIs while retaining additive columns and data.

## Feature flags

All flags are server-only, parsed strictly as `value === 'true'`, and default to false:

| Flag | Requires | Kill-switch behavior |
|---|---|---|
| `SITE_V2_ENABLED` | expand/backfill/validate complete | serve legacy public UI |
| `MINI_APP_V2_ENABLED` | V2 APIs + moved routes + site-compatible schema | serve legacy app routes |
| `ADMIN_V2_ENABLED` | canonical DAL + invalidation | serve legacy admin UI |

Schema migrations are never flag-controlled. Preview values are explicitly set in Vercel. Invalid
flag combinations fail closed to legacy UI. Compatibility APIs remain deployed through observation.

## Delivery stories and dependencies

### G001 — Design, snapshot, and foundation

- Preserve checkpoint `22740f9`.
- Capture production schema and turn this document into the active `DESIGN.md`.
- Add new brand mark, deterministic SVG icon system, generated poster art, asset manifest, and
  Gemini prompts.
- Add strict feature-flag parser, minimal root layout, route layouts, shared DAL, cache tags, and
  log redaction.
- Add the compatibility route shell before any public route changes.

### G002 — Expand schema and versioned services

- Implement expand/backfill/validate migrations and migration tests.
- Implement timezone, atomic booking/cancel/claim/token/idempotency RPCs.
- Add versioned APIs, compatibility shims, contact state machine, and invalidation.
- Do not enable any V2 flag until migration validation passes.

### G003 — Mini App route migration and UX

- Move routes under `/app`, add one versioned bootstrap request and shared client cache.
- Implement nearest-training home, compact schedule/detail/bookings/profile, custom navigation,
  optimistic changes, and verified-phone state.
- Enable `MINI_APP_V2_ENABLED` in preview only after route/identity acceptance.

### G004 — Public site

- Only after G003 route acceptance, build the cinematic server-rendered landing, public schedule,
  training detail, browser booking, management-link exchange/cancel, FAQ, venue, contacts, SEO,
  and JSON-LD.
- Enable `SITE_V2_ENABLED` in preview only after public acceptance.

### G005 — Admin, privacy, and release gate

- Apply the V2 workbench design and canonical server queries.
- Add search, safe actions, sticky forms, cache invalidation, double-submit protection, and an
  admin-authorized anonymization action.
- Run complete verification, independent review, adversarial QA, and rollback drill.
- Enable `ADMIN_V2_ENABLED` in preview only after admin acceptance.

## Visual contract

- Palette (user-approved 2026-07-31): night navy `#080B12`, deep surface `#0D1320`,
  off-white `#F3F1EA`, primary cobalt `#4D6BFF`, ice blue `#A7D8FF`, steel `#7F8998`.
- Red and green are reserved for semantic error/success states. Lime and purple are not used.
- Display: Unbounded; UI: Manrope.
- New forward `A` mark formed by court lines and a ball trajectory.
- ChatGPT assets: mark exploration, 10–12 code-cleaned SVG UI icons, 6–8 3D section emblems.
- Gemini assets: desktop/mobile 5–8 second hero loops and two secondary scenes.
- Gemini videos are optional release enhancements, not blockers. ChatGPT-generated static posters
  ship as the complete fallback. Expected exports: desktop 1920×1080 WebM/MP4 ≤5 MB, mobile
  1080×1920 ≤2.5 MB, 5–8 seconds, silent/autoplay/loop/playsInline, no baked text.
- No runtime WebGL. All video is poster-first, lazy when non-critical, and removed for reduced motion.
- Mini App loads no decorative video.

## Verification and observability

- Clean-database and production-copy migration rerun tests.
- Concurrent last-slot test: exactly one of two competing bookings succeeds.
- Duplicate/idempotency retry returns one booking and a newly rotated valid management link; the
  earlier link is invalidated.
- Abuse tests cover Turnstile failure, distributed concurrent limits, bucket expiry/pruning,
  NAT-like multiple legitimate phones, and no raw IP/phone persistence.
- Create/cancel race preserves a valid status and non-negative remaining capacity.
- Token tests: valid exchange, rotation, replay, expiry, wrong booking, origin failure, revocation.
- Claim tests: valid contact, forged user id, non-private chat, duplicate-training conflict, rerun.
- Cache tests: public responses cache; personal/manage/admin responses never enter shared cache;
  every mutation invalidates both required tags.
- Time tests cover Irkutsk midnight boundaries without DST assumptions.
- Route tests cover all old redirects and Bot `/app` entry.
- RLS tests prove anonymous users cannot read bookings/profiles/tokens/audits.
- Visual/accessibility checks: 390×844, 375×812, 768px, 1440×900; WCAG 2.2 AA; reduced motion.
- Performance gates: public LCP ≤3.5s/CLS<0.1/INP<200ms on mobile 4G; Mini App nearest training
  ≤2.5s cold and ≤1.5s warm; Mini App initial JS ≤180KB gzip.
- Structured non-PII events: booking create/cancel result, claim result/conflict, bootstrap latency,
  cache invalidation, migration reconciliation counts, feature-flag surface, API error code.
- Alerts: booking error rate, bootstrap p95, claim conflicts, migration count mismatch, and V2
  error-rate regression. No analytics payload includes phone, name, token, initData, or cookie.
- Reproducible tooling: Playwright for route/e2e/accessibility scenarios; Lighthouse CI with a
  committed mobile-4G config for LCP/CLS/INP; `scripts/check-bundle-budget.mjs` parses the production
  build manifest and enforces the Mini App gzip budget. CI runs `npm run lint`, `npm test`,
  `npm run build`, `npm run test:e2e`, `npm run test:perf`, and `npm run check:bundle`.

## Consent, retention, and deletion

- Current privacy notice id is `2026-07-31-v1`.
- Every booking stores `consent_version` and `consented_at`; both web and Mini App show the notice
  before the first accepted booking.
- Active booking PII is retained while the booking is actionable. Completed/cancelled booking PII
  is retained for 365 days, then `name`, `phone`, and `phone_normalized` are irreversibly anonymized
  while non-identifying aggregate/status fields remain.
- Profiles remain while Telegram-linked. An organizer-authorized deletion action unlinks the
  profile, anonymizes eligible historical bookings, and refuses deletion while active bookings
  remain unless they are cancelled first.
- `/api/cron/privacy-retention` is protected by `CRON_SECRET` and runs daily; it prunes expired
  rate-limit/idempotency/audit records and applies PII retention.
- Tests prove privacy evidence is stored, deletion authorization is enforced, active records are
  protected, expired records are anonymized, and logs/analytics/cache never retain name, phone,
  raw IP, token, cookie, or initData.

## Completion criteria

- Migrations and rollback drill pass before any preview V2 flag is enabled.
- Build, lint, tests, type checking, accessibility, performance, independent code review, and
  adversarial QA are clean.
- Public content renders before hydration and no route leaks personal data.
- Legacy removal is explicitly excluded until the separate post-observation contract migration.
