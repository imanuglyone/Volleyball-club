# External prerequisite: captured production legacy schema

`005a_legacy_production_compat.sql` restores the two production fields that were
independently observed and are required by migrations 006/007:
`bookings.player_id` and `bookings.phone_normalized`.

The 2026-07-31 read-only catalog audit confirmed the production objects
`players`, `auth_codes`, `auth_sessions`, `telegram_links`, and
`telegram_booking_states`, plus these RPC identities:

- `claim_player(p_phone text, p_name text)`;
- `cancel_booking_and_promote(p_booking_id uuid)`;
- `create_booking(p_training_id uuid, p_name text, p_phone text)`.

Migration 008 conditionally makes every one of those tables service-role-only
and enumerates all existing overloads of the three RPC names from `pg_proc`.
The repository still does not contain authoritative complete table definitions,
constraints, policies, indexes, sequences, or function bodies. Those objects
must not be reconstructed by guesswork.

Before declaring production parity, obtain a redacted, read-only snapshot with:

- table columns, defaults, constraints, indexes, RLS flags and policies;
- grants for tables, sequences and functions;
- `pg_get_function_identity_arguments` and `pg_get_functiondef` for all three
  RPC names and every overload;
- row counts only, without names, phones, tokens, Telegram payloads or secrets.

Copy any definitions needed for clean-install parity into a follow-up
compatibility migration and run the clean-install and production-copy fixtures.
No migration in this repository connects to or mutates production.
