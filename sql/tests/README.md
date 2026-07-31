# Migration checks

Use an isolated disposable PostgreSQL/Supabase database only.

Clean install:

1. Apply `001` through `007` in filename order, including `005a`.
2. Apply `008_avangard_v2.sql`.
3. Run `008_contract_assertions.sql`.

Production-shape collision fixture:

1. Apply `001` through `007`.
2. Run `008_duplicate_preflight_fixture.sql`.
3. Apply `008_avangard_v2.sql`.
4. Run `008_contract_assertions.sql`.

The second sequence proves canonical normalization can expose an existing
duplicate without aborting the migration or silently deleting a booking. It
records the count and defers the unique index until an operator resolves the
duplicate.

The CI workflow also applies `008_legacy_security_fixture.sql` before migration
008 in a third disposable database. This redacted fixture proves that retired
production auth tables become RLS-protected and that legacy RPC execution is
limited to `service_role`.

The complete production schema dump remains blocked on the credentialed export
described in `../PRODUCTION_SCHEMA_SNAPSHOT_REQUIRED.md`; the fixture contains
only the minimum catalog shape needed for the security contract.
