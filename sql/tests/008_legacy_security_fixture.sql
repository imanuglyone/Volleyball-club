-- Minimal redacted production-shape fixture for retired token-bearing tables
-- and RPC signatures discovered by the read-only production schema audit.
-- No production rows or values are copied here.
create table public.players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null
);

create table public.telegram_links (
  telegram_user_id bigint primary key,
  player_id uuid,
  created_at timestamptz not null default now()
);

create table public.auth_codes (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  code text not null,
  expires_at timestamptz not null
);

create table public.auth_sessions (
  token text primary key,
  phone text not null,
  expires_at timestamptz not null
);

create table public.telegram_booking_states (
  telegram_user_id bigint primary key,
  training_id uuid references public.trainings(id),
  updated_at timestamptz not null default now()
);

create function public.claim_player(p_phone text, p_name text)
returns uuid
language plpgsql
security definer
as $$
begin
  return gen_random_uuid();
end
$$;

-- Synthetic overload proves migration 008 enumerates catalog identities
-- instead of relying on one hard-coded production signature.
create function public.claim_player(p_phone text)
returns uuid
language sql
security definer
as $$ select gen_random_uuid() $$;

create function public.cancel_booking_and_promote(p_booking_id uuid)
returns boolean
language sql
as $$ select false $$;

-- create_booking(uuid, text, text) is intentionally reused from 001_init.sql.
-- This mirrors production and verifies that 008 hardens an existing legacy
-- function instead of requiring a fixture-specific replacement.

grant all on table
  public.players,
  public.telegram_links,
  public.auth_codes,
  public.auth_sessions,
  public.telegram_booking_states
to public, anon, authenticated;

grant execute on function public.claim_player(text, text)
to public, anon, authenticated;
grant execute on function public.claim_player(text)
to public, anon, authenticated;
grant execute on function public.cancel_booking_and_promote(uuid)
to public, anon, authenticated;
grant execute on function public.create_booking(uuid, text, text)
to public, anon, authenticated;
