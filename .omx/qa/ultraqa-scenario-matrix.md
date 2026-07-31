# Avangard V2 UltraQA scenario matrix

Date: 2026-07-31  
Environment: local Windows workspace, Next.js development server, Chromium  
Scope: public site, Telegram Mini App, management API, database migration contract

| Class | Scenario | Oracle | Evidence | Result |
|---|---|---|---|---|
| Baseline | Public and Mini App routes at 390×844, 375×812, 768×1024, 1440×900 | Visible main content, no horizontal overflow, no serious/critical Axe findings | `e2e/surface-smoke.spec.ts` | Pass |
| Baseline | Web booking → one-time management link → cancellation | Token leaves the URL after exchange; cancellation succeeds | `e2e/user-journeys.spec.ts` | Pass |
| Baseline | Mini App bootstrap → one-tap booking | Consent evidence sent; success state rendered | `e2e/user-journeys.spec.ts` | Pass |
| Baseline | Optimistic Mini App cancellation | Stable booking id sent; optimistic UI settles | `e2e/user-journeys.spec.ts` | Pass |
| Malformed input | Invalid JSON, impossible date, reversed range, out-of-budget year | 400 without database access or internal details | `e2e/adversarial-api.spec.ts` | Pass |
| Oversized input | 60 emoji name and over-limit command-like name | 400 validation response, private cache policy | `e2e/adversarial-api.spec.ts` | Pass |
| Injection-like input | Honeypot URL and command-like text | Rejected before persistence; no secret material returned | `e2e/adversarial-api.spec.ts` | Pass |
| Stale/hostile state | Malformed management identifier and absent management cookie | Uniform 404, no storage lookup for malformed id | `e2e/adversarial-api.spec.ts` | Pass |
| Time boundaries | Irkutsk date, UTC weekday, impossible dates, upper year | Stable club-local date and weekday decisions | `lib/club-time.test.ts`, `lib/public-training-range.test.ts` | Pass |
| Concurrency | Reservation owner fencing, stale owner, expired replay | Only current lease owner can complete/release | `sql/tests/008_contract_assertions.sql` | CI contract added; local PostgreSQL unavailable |
| Abuse | Distributed ingress and rolling phone/IP limits | Denied requests do not extend their own window; Retry-After is positive | `sql/tests/008_contract_assertions.sql` | CI contract added; local PostgreSQL unavailable |
| Security | Legacy token tables and RPCs in production-shaped schema | RLS enabled; `anon`/`authenticated` privileges revoked | `sql/tests/008_legacy_security_fixture.sql` | CI contract added; production not mutated |
| Dirty worktree | Resume after user pause with pre-existing uncommitted work | Existing checkpoint and unrelated work remain intact | Git status + checkpoint `22740f9` | Pass |
| Interruption/resume | Stop for computer shutdown, continue later | Work resumes from saved state without restart or data loss | `.omx/state/autopilot-state.json` | Pass |
| Hung command | Playwright wrapper/Lighthouse process does not terminate | Do not count partial output; terminate bounded process; retry from clean cache | QA logs and clean rerun | Pass |
| Misleading output | A run prints many passing tests but ends non-zero | Only exit code 0 is accepted | First E2E run rejected, second clean run 51 passed | Pass |
| Flakiness | Next dev cache produces `__webpack_require__.C is not a function` | Clean `.next`, restart isolated server, full suite passes | Failure screenshot + second full run | Pass after recovery |
| Cleanup | Background development server | No listener remains on port 3100 and no Node test process remains | Post-run port/process check | Pass |

The API adversarial tests run once on the desktop project; the nine skips are
intentional duplicates across the other three viewport projects.
