# Production Supabase schema audit — 2026-07-31

This is a read-only, non-PII catalog audit of Supabase project
`jtgdtalugmcabgklhzsj`. It is not a replacement for the credentialed schema
dump required before rollout.

## Identification

- PostgreSQL: 17.6.1
- `trainings`: 36 rows, RLS enabled
- `bookings`: 445 rows, RLS enabled
- `profiles`: 13 rows, RLS enabled

These three counts match the approved rollout plan and identify the production
project without reading participant records.

## Security findings before migration 008

| Object | Current production state | Migration 008 action |
|---|---|---|
| `bookings` | RLS enabled, client roles still have table grants | Revoke all client grants; service-role only |
| `profiles` | RLS enabled, no policies, client roles still have table grants | Revoke all client grants; service-role only |
| `players` | RLS enabled, legacy PII table with client grants/policies | Revoke all client grants; service-role only |
| `telegram_links` | RLS disabled, client roles have direct grants | Enable RLS; revoke client grants |
| `auth_codes` | RLS disabled, client roles have direct grants | Enable RLS; revoke client grants |
| `auth_sessions` | RLS disabled; token-bearing table exposed to client roles | Enable RLS; revoke client grants |
| `telegram_booking_states` | RLS disabled, client roles have direct grants | Enable RLS; revoke client grants |
| `claim_player(text,text)` and any overload | SECURITY DEFINER, mutable search path, client-executable | Catalog-enumerate all overloads; pin search path; service-role only |
| `cancel_booking_and_promote(uuid)` | Mutable search path, client-executable | Pin search path; service-role only |
| `create_booking(uuid,text,text)` | Mutable search path, client-executable | Pin search path; service-role only |

The Supabase security advisor also reported a broad public listing policy on
the unrelated `avatars` storage bucket and disabled leaked-password
protection. Those findings are outside the Avangard V2 migration scope and
must be reviewed separately before production launch.

## Verification contract

- `sql/tests/008_legacy_security_fixture.sql` recreates only the relevant
  catalog shape with synthetic columns and values.
- `.github/workflows/quality-gates.yml` applies all preceding migrations, the
  fixture, migration 008, and the shared contract assertions on a disposable
  PostgreSQL database.
- No production mutation was made during this audit.

The remaining export requirement is tracked in
`sql/PRODUCTION_SCHEMA_SNAPSHOT_REQUIRED.md`.
