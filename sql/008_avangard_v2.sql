create extension if not exists "pgcrypto";

create or replace function public.normalize_avangard_phone(p_phone text)
returns text
language plpgsql immutable strict
set search_path = public
as $$
declare v_digits text := regexp_replace(p_phone, '[^0-9]', '', 'g');
begin
  if length(v_digits) = 11 and left(v_digits, 1) = '8' then
    return '+7' || substr(v_digits, 2);
  elsif length(v_digits) = 11 and left(v_digits, 1) = '7' then
    return '+' || v_digits;
  elsif length(v_digits) between 10 and 15 then
    return '+' || v_digits;
  end if;
  raise exception 'phone_invalid' using errcode = 'P0001';
end $$;

alter table public.bookings
  add column if not exists source text,
  add column if not exists manage_token_hash bytea,
  add column if not exists manage_token_expires_at timestamptz,
  add column if not exists manage_token_version integer not null default 0,
  add column if not exists cancel_idempotency_hash bytea,
  add column if not exists cancel_idempotency_expires_at timestamptz,
  add column if not exists consent_version text,
  add column if not exists consented_at timestamptz;

alter table public.profiles
  add column if not exists phone_verified_at timestamptz;

-- Migration 007's index uses pre-canonical values. Rebuild it only after
-- normalization and duplicate reconciliation below.
drop index if exists public.bookings_training_phone_idx;
drop index if exists public.bookings_training_active_phone_normalized_idx;

update public.bookings
set phone_normalized = public.normalize_avangard_phone(phone)
where phone is not null and phone <> '';

update public.bookings
set source = case when profile_id is not null then 'telegram' else 'web' end
where source is null;

alter table public.bookings
  alter column source set default 'web',
  alter column source set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'bookings_source_check'
      and conrelid = 'public.bookings'::regclass
  ) then
    alter table public.bookings
      add constraint bookings_source_check check (source in ('web', 'telegram')) not valid;
  end if;
end $$;

alter table public.bookings validate constraint bookings_source_check;

create index if not exists bookings_manage_token_hash_idx
  on public.bookings(manage_token_hash)
  where manage_token_hash is not null;

create table if not exists public.booking_idempotency (
  scope text not null,
  key uuid not null,
  request_hash bytea not null,
  booking_id uuid not null references public.bookings(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  primary key (scope, key)
);

create table if not exists public.public_booking_requests (
  scope text not null,
  key uuid not null,
  request_hash bytea not null,
  state text not null check (state in ('pending', 'completed')),
  owner_token uuid,
  booking_id uuid references public.bookings(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  primary key (scope, key)
);

create table if not exists public.rate_limit_buckets (
  bucket_hash bytea primary key,
  bucket_type text not null check (bucket_type in ('ip', 'phone_training', 'ingress_ip')),
  attempts integer not null,
  window_started_at timestamptz not null,
  attempt_times timestamptz[] not null default '{}'::timestamptz[],
  expires_at timestamptz not null
);

alter table public.public_booking_requests
  add column if not exists owner_token uuid;

alter table public.rate_limit_buckets
  add column if not exists attempt_times timestamptz[] not null default '{}'::timestamptz[];

alter table public.rate_limit_buckets
  drop constraint if exists rate_limit_buckets_bucket_type_check;
alter table public.rate_limit_buckets
  add constraint rate_limit_buckets_bucket_type_check
  check (bucket_type in ('ip', 'phone_training', 'ingress_ip')) not valid;
alter table public.rate_limit_buckets
  validate constraint rate_limit_buckets_bucket_type_check;

create table if not exists public.privacy_audit (
  id bigint generated always as identity primary key,
  event_type text not null,
  outcome text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '90 days')
);

create table if not exists public.migration_reconciliation (
  migration text primary key,
  active_phone_duplicate_groups integer not null,
  orphan_profile_bookings integer not null,
  checked_at timestamptz not null default now()
);

insert into public.migration_reconciliation(
  migration, active_phone_duplicate_groups, orphan_profile_bookings, checked_at
)
select
  '008_avangard_v2',
  (
    select count(*) from (
      select training_id, phone_normalized
      from public.bookings
      where status = 'active' and phone_normalized is not null
      group by training_id, phone_normalized
      having count(*) > 1
    ) duplicate_groups
  ),
  (
    select count(*) from public.bookings b
    where b.profile_id is not null
      and not exists (select 1 from public.profiles p where p.id = b.profile_id)
  ),
  now()
on conflict (migration) do update set
  active_phone_duplicate_groups = excluded.active_phone_duplicate_groups,
  orphan_profile_bookings = excluded.orphan_profile_bookings,
  checked_at = excluded.checked_at;

do $$
declare v_duplicates integer;
begin
  select active_phone_duplicate_groups into v_duplicates
  from public.migration_reconciliation where migration = '008_avangard_v2';
  if v_duplicates = 0 then
    create unique index if not exists bookings_training_phone_idx
      on public.bookings(training_id, phone_normalized)
      where status = 'active' and phone_normalized is not null;
    insert into public.privacy_audit(event_type, outcome, metadata)
    values (
      'migration_reconciliation', 'clear',
      jsonb_build_object('duplicate_groups', 0)
    );
  else
    create index if not exists bookings_training_active_phone_lookup_idx
      on public.bookings(training_id, phone_normalized)
      where status = 'active' and phone_normalized is not null;
    insert into public.privacy_audit(event_type, outcome, metadata)
    values (
      'migration_reconciliation', 'blocked_unique_index',
      jsonb_build_object('duplicate_groups', v_duplicates)
    );
  end if;
end $$;

alter table public.booking_idempotency enable row level security;
alter table public.public_booking_requests enable row level security;
alter table public.rate_limit_buckets enable row level security;
alter table public.privacy_audit enable row level security;
alter table public.migration_reconciliation enable row level security;
alter table public.bookings enable row level security;
alter table public.profiles enable row level security;

-- Production contains a retired PII-bearing players table and several
-- Telegram/auth tables that are absent from the clean-install history. If
-- they exist, keep them service-role-only instead of leaving identity or
-- token-bearing rows exposed through PostgREST.
do $$
declare
  v_table text;
begin
  foreach v_table in array array[
    'players',
    'telegram_links',
    'auth_codes',
    'auth_sessions',
    'telegram_booking_states'
  ]
  loop
    if to_regclass(format('public.%I', v_table)) is not null then
      execute format('alter table public.%I enable row level security', v_table);
      execute format(
        'revoke all on table public.%I from public, anon, authenticated',
        v_table
      );
      execute format(
        'grant select, insert, update, delete on table public.%I to service_role',
        v_table
      );
    end if;
  end loop;
end $$;

-- The same production catalog includes three legacy RPC names. Enumerate
-- every actual overload by OID so a signature drift cannot silently preserve
-- anonymous execution. The current application does not call these directly,
-- so retain organizer compatibility through service_role only.
do $$
declare
  v_procedure regprocedure;
begin
  for v_procedure in
    select p.oid::regprocedure
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in (
        'claim_player',
        'cancel_booking_and_promote',
        'create_booking'
      )
    order by p.oid
  loop
    execute format(
      'alter function %s set search_path = public',
      v_procedure
    );
    execute format(
      'revoke all on function %s from public, anon, authenticated',
      v_procedure
    );
    execute format(
      'grant execute on function %s to service_role',
      v_procedure
    );
  end loop;
end $$;

create or replace function public.avangard_club_now()
returns timestamp without time zone
language sql stable
set search_path = public
as $$ select timezone('Asia/Irkutsk', now()) $$;

drop function if exists public.reserve_public_booking_request(uuid, text);
drop function if exists public.reserve_public_booking_request(uuid, text, uuid, text, text);
drop function if exists public.release_public_booking_request(uuid, text);
drop function if exists public.release_public_booking_request(uuid, text, uuid);
drop function if exists public.create_public_booking(
  uuid, text, text, text, text, uuid, text, text, timestamptz
);
drop function if exists public.create_public_booking(
  uuid, text, text, text, text, uuid, text, uuid, text, timestamptz
);
drop function if exists public.check_booking_ingress_rate_limit(text);
drop function if exists public.check_booking_rate_limit(text, text);
create function public.check_booking_rate_limit(
  p_ip_hash text,
  p_phone_training_hash text
) returns table (allowed boolean, retry_after integer, limited_bucket text)
language plpgsql security definer set search_path = public
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_ip public.rate_limit_buckets%rowtype;
  v_phone public.rate_limit_buckets%rowtype;
  v_ip_times timestamptz[];
  v_phone_times timestamptz[];
  v_retry integer := 0;
  v_limited_bucket text := null;
begin
  insert into public.rate_limit_buckets(
    bucket_hash, bucket_type, attempts, window_started_at, attempt_times, expires_at
  ) values (
    decode(p_ip_hash, 'hex'), 'ip', 0, v_now, '{}'::timestamptz[], v_now + interval '24 hours'
  )
  on conflict (bucket_hash) do nothing;
  select * into v_ip from public.rate_limit_buckets
  where bucket_hash = decode(p_ip_hash, 'hex') for update;
  select coalesce(array_agg(value order by value), '{}'::timestamptz[])
  into v_ip_times
  from unnest(coalesce(v_ip.attempt_times, '{}'::timestamptz[])) value
  where value > v_now - interval '10 minutes';

  insert into public.rate_limit_buckets(
    bucket_hash, bucket_type, attempts, window_started_at, attempt_times, expires_at
  ) values (
    decode(p_phone_training_hash, 'hex'), 'phone_training', 0, v_now, '{}'::timestamptz[], v_now + interval '24 hours'
  )
  on conflict (bucket_hash) do nothing;
  select * into v_phone from public.rate_limit_buckets
  where bucket_hash = decode(p_phone_training_hash, 'hex') for update;
  select coalesce(array_agg(value order by value), '{}'::timestamptz[])
  into v_phone_times
  from unnest(coalesce(v_phone.attempt_times, '{}'::timestamptz[])) value
  where value > v_now - interval '15 minutes';

  if cardinality(v_ip_times) >= 20 then
    v_limited_bucket := 'ip';
    v_retry := greatest(v_retry, ceil(extract(epoch from (
      v_ip_times[1] + interval '10 minutes' - v_now
    )))::integer);
  end if;
  if cardinality(v_phone_times) >= 3 then
    if v_limited_bucket is null then v_limited_bucket := 'phone_training'; end if;
    v_retry := greatest(v_retry, ceil(extract(epoch from (
      v_phone_times[1] + interval '15 minutes' - v_now
    )))::integer);
  end if;

  if v_retry <= 0 then
    v_ip_times := array_append(v_ip_times, v_now);
    v_phone_times := array_append(v_phone_times, v_now);
  end if;

  update public.rate_limit_buckets set
    attempts = cardinality(v_ip_times),
    window_started_at = coalesce(v_ip_times[1], v_now),
    attempt_times = v_ip_times,
    expires_at = v_now + interval '24 hours'
  where bucket_hash = decode(p_ip_hash, 'hex');
  update public.rate_limit_buckets set
    attempts = cardinality(v_phone_times),
    window_started_at = coalesce(v_phone_times[1], v_now),
    attempt_times = v_phone_times,
    expires_at = v_now + interval '24 hours'
  where bucket_hash = decode(p_phone_training_hash, 'hex');

  return query select v_retry <= 0, greatest(v_retry, 0), v_limited_bucket;
end $$;

create function public.check_booking_ingress_rate_limit(
  p_ip_hash text
) returns table (allowed boolean, retry_after integer)
language plpgsql security definer set search_path = public
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_bucket public.rate_limit_buckets%rowtype;
  v_times timestamptz[];
  v_retry integer := 0;
begin
  insert into public.rate_limit_buckets(
    bucket_hash, bucket_type, attempts, window_started_at, attempt_times, expires_at
  ) values (
    decode(p_ip_hash, 'hex'), 'ingress_ip', 0, v_now,
    '{}'::timestamptz[], v_now + interval '24 hours'
  )
  on conflict (bucket_hash) do nothing;
  select * into v_bucket from public.rate_limit_buckets
  where bucket_hash = decode(p_ip_hash, 'hex') for update;
  select coalesce(array_agg(value order by value), '{}'::timestamptz[])
  into v_times
  from unnest(coalesce(v_bucket.attempt_times, '{}'::timestamptz[])) value
  where value > v_now - interval '1 minute';

  if cardinality(v_times) >= 60 then
    v_retry := greatest(1, ceil(extract(epoch from (
      v_times[1] + interval '1 minute' - v_now
    )))::integer);
  else
    v_times := array_append(v_times, v_now);
  end if;

  update public.rate_limit_buckets set
    attempts = cardinality(v_times),
    window_started_at = coalesce(v_times[1], v_now),
    attempt_times = v_times,
    expires_at = v_now + interval '24 hours'
  where bucket_hash = decode(p_ip_hash, 'hex');
  return query select v_retry = 0, v_retry;
end $$;

drop function if exists public.reserve_public_booking_request(uuid, text);
drop function if exists public.reserve_public_booking_request(uuid, text, uuid, text, text);
create function public.reserve_public_booking_request(
  p_idempotency_key uuid,
  p_request_hash text,
  p_owner_token uuid,
  p_ip_hash text,
  p_phone_training_hash text
) returns table (
  reservation_status text,
  reservation_owner_token uuid,
  limited_bucket text,
  retry_after integer
)
language plpgsql security definer set search_path = public
as $$
declare
  v_existing public.booking_idempotency%rowtype;
  v_request public.public_booking_requests%rowtype;
  v_limit record;
begin
  perform pg_advisory_xact_lock(
    hashtextextended('public-create:' || p_idempotency_key::text, 0)
  );

  delete from public.booking_idempotency
  where scope = 'public-create'
    and key = p_idempotency_key
    and expires_at <= now();

  select * into v_existing
  from public.booking_idempotency
  where scope = 'public-create'
    and key = p_idempotency_key
    and expires_at > now();
  if found then
    if v_existing.request_hash <> decode(p_request_hash, 'hex') then
      raise exception 'idempotency_conflict' using errcode = 'P0001';
    end if;
    return query select 'replay', null::uuid, null::text, 0;
    return;
  end if;

  delete from public.public_booking_requests
  where scope = 'public-create'
    and key = p_idempotency_key
    and expires_at <= now();

  select * into v_request
  from public.public_booking_requests
  where scope = 'public-create' and key = p_idempotency_key
  for update;
  if found then
    if v_request.request_hash <> decode(p_request_hash, 'hex') then
      raise exception 'idempotency_conflict' using errcode = 'P0001';
    end if;
    return query select
      case when v_request.state = 'completed' then 'replay' else 'pending' end,
      null::uuid, null::text, 0;
    return;
  end if;

  select * into v_limit
  from public.check_booking_rate_limit(p_ip_hash, p_phone_training_hash);
  if v_limit.allowed is not true then
    return query select
      'rate_limited', null::uuid, v_limit.limited_bucket, v_limit.retry_after;
    return;
  end if;

  insert into public.public_booking_requests(
    scope, key, request_hash, state, owner_token, expires_at
  ) values (
    'public-create', p_idempotency_key, decode(p_request_hash, 'hex'),
    'pending', p_owner_token, now() + interval '10 minutes'
  );
  return query select 'owner', p_owner_token, null::text, 0;
end $$;

drop function if exists public.release_public_booking_request(uuid, text);
drop function if exists public.release_public_booking_request(uuid, text, uuid);
create function public.release_public_booking_request(
  p_idempotency_key uuid,
  p_request_hash text,
  p_owner_token uuid
) returns boolean
language plpgsql security definer set search_path = public
as $$
declare v_changed integer;
begin
  delete from public.public_booking_requests
  where scope = 'public-create'
    and key = p_idempotency_key
    and request_hash = decode(p_request_hash, 'hex')
    and owner_token = p_owner_token
    and state = 'pending';
  get diagnostics v_changed = row_count;
  return v_changed > 0;
end $$;

drop function if exists public.public_booking_replay_exists(uuid, text);

drop function if exists public.create_public_booking(
  uuid, text, text, text, text, uuid, text, text, timestamptz
);
create function public.create_public_booking(
  p_training_id uuid,
  p_name text,
  p_phone text,
  p_phone_normalized text,
  p_consent_version text,
  p_idempotency_key uuid,
  p_request_hash text,
  p_reservation_owner_token uuid,
  p_manage_token_hash text,
  p_manage_token_expires_at timestamptz
) returns table (booking_id uuid, remaining integer, replayed boolean)
language plpgsql security definer set search_path = public
as $$
declare
  v_training public.trainings%rowtype;
  v_existing public.booking_idempotency%rowtype;
  v_request public.public_booking_requests%rowtype;
  v_active_count integer;
  v_booking_id uuid;
  v_phone_normalized text;
begin
  v_phone_normalized := public.normalize_avangard_phone(p_phone);
  if v_phone_normalized <> p_phone_normalized then
    raise exception 'phone_invalid' using errcode = 'P0001';
  end if;
  perform pg_advisory_xact_lock(hashtextextended('public-create:' || p_idempotency_key::text, 0));

  delete from public.booking_idempotency
  where scope = 'public-create'
    and key = p_idempotency_key
    and expires_at <= now();

  select * into v_existing
  from public.booking_idempotency
  where scope = 'public-create'
    and key = p_idempotency_key
    and expires_at > now()
  for update;

  if found then
    if v_existing.request_hash <> decode(p_request_hash, 'hex') then
      raise exception 'idempotency_conflict' using errcode = 'P0001';
    end if;
    update public.bookings
    set manage_token_hash = decode(p_manage_token_hash, 'hex'),
        manage_token_expires_at = p_manage_token_expires_at,
        manage_token_version = manage_token_version + 1
    where id = v_existing.booking_id
    returning id into v_booking_id;
    if v_booking_id is null then
      raise exception 'booking_not_found' using errcode = 'P0001';
    end if;
    insert into public.public_booking_requests(
      scope, key, request_hash, state, booking_id, expires_at
    ) values (
      'public-create', p_idempotency_key, decode(p_request_hash, 'hex'),
      'completed', v_booking_id, v_existing.expires_at
    )
    on conflict (scope, key) do update set
      request_hash = excluded.request_hash,
      state = 'completed',
      owner_token = null,
      booking_id = excluded.booking_id,
      expires_at = excluded.expires_at;
    select greatest(t.capacity - count(b.id) filter (where b.status = 'active'), 0)::integer
      into v_active_count
    from public.trainings t
    left join public.bookings b on b.training_id = t.id
    where t.id = (select training_id from public.bookings where id = v_booking_id)
    group by t.capacity;
    return query select v_booking_id, v_active_count, true;
    return;
  end if;

  select * into v_request
  from public.public_booking_requests
  where scope = 'public-create'
    and key = p_idempotency_key
    and request_hash = decode(p_request_hash, 'hex')
    and state = 'pending'
    and owner_token = p_reservation_owner_token
    and expires_at > now()
  for update;
  if not found then
    raise exception 'reservation_lost' using errcode = 'P0001';
  end if;

  select * into v_training
  from public.trainings where id = p_training_id for update;
  if not found then raise exception 'training_not_found' using errcode = 'P0001'; end if;
  if v_training.is_active is not true then
    raise exception 'training_inactive' using errcode = 'P0001';
  end if;
  if (v_training.date + v_training.start_time) <= public.avangard_club_now() then
    raise exception 'training_inactive' using errcode = 'P0001';
  end if;
  if exists (
    select 1 from public.bookings
    where training_id = p_training_id
      and phone_normalized = v_phone_normalized
      and status = 'active'
  ) then
    raise exception 'booking_duplicate' using errcode = 'P0001';
  end if;

  select count(*) into v_active_count
  from public.bookings
  where training_id = p_training_id and status = 'active';
  if v_active_count >= v_training.capacity then
    raise exception 'booking_full' using errcode = 'P0001';
  end if;

  insert into public.bookings(
    training_id, name, phone, phone_normalized, source,
    manage_token_hash, manage_token_expires_at, manage_token_version,
    consent_version, consented_at
  ) values (
    p_training_id, trim(p_name), v_phone_normalized, v_phone_normalized, 'web',
    decode(p_manage_token_hash, 'hex'), p_manage_token_expires_at, 1,
    p_consent_version, now()
  ) returning id into v_booking_id;

  insert into public.booking_idempotency(
    scope, key, request_hash, booking_id, expires_at
  ) values (
    'public-create', p_idempotency_key, decode(p_request_hash, 'hex'),
    v_booking_id, now() + interval '24 hours'
  );

  insert into public.public_booking_requests(
    scope, key, request_hash, state, booking_id, expires_at
  ) values (
    'public-create', p_idempotency_key, decode(p_request_hash, 'hex'),
    'completed', v_booking_id, now() + interval '24 hours'
  )
  on conflict (scope, key) do update set
      request_hash = excluded.request_hash,
      state = 'completed',
      owner_token = null,
      booking_id = excluded.booking_id,
    expires_at = excluded.expires_at;

  return query select v_booking_id, v_training.capacity - v_active_count - 1, false;
end $$;

create or replace function public.exchange_public_booking_token(
  p_booking_id uuid,
  p_token_hash text,
  p_replacement_hash text,
  p_replacement_expires_at timestamptz
) returns boolean
language plpgsql security definer set search_path = public
as $$
declare v_changed integer;
begin
  update public.bookings
  set manage_token_hash = decode(p_replacement_hash, 'hex'),
      manage_token_expires_at = p_replacement_expires_at,
      manage_token_version = manage_token_version + 1
  where id = p_booking_id
    and manage_token_hash = decode(p_token_hash, 'hex')
    and manage_token_expires_at > now();
  get diagnostics v_changed = row_count;
  return v_changed = 1;
end $$;

create or replace function public.get_public_booking_by_token(
  p_booking_id uuid,
  p_token_hash text
) returns table (
  id uuid, status text, training_id uuid, training_date date,
  start_time time, end_time time, location_name text, address text
)
language sql security definer stable set search_path = public
as $$
  select b.id, b.status, b.training_id, t.date, t.start_time, t.end_time,
         t.location_name, t.address
  from public.bookings b
  join public.trainings t on t.id = b.training_id
  where b.id = p_booking_id
    and b.manage_token_hash = decode(p_token_hash, 'hex')
    and b.manage_token_expires_at > now()
$$;

create or replace function public.cancel_public_booking(
  p_booking_id uuid,
  p_token_hash text
) returns table (cancelled boolean, training_id uuid)
language plpgsql security definer set search_path = public
as $$
declare v_training_id uuid;
begin
  select b.training_id into v_training_id
  from public.bookings b
  where b.id = p_booking_id
    and b.status = 'cancelled'
    and b.cancel_idempotency_hash = decode(p_token_hash, 'hex')
    and b.cancel_idempotency_expires_at > now();
  if v_training_id is not null then
    return query select true, v_training_id;
    return;
  end if;

  update public.bookings
  set status = 'cancelled',
      cancel_idempotency_hash = manage_token_hash,
      cancel_idempotency_expires_at = least(
        manage_token_expires_at,
        now() + interval '10 minutes'
      ),
      manage_token_hash = null,
      manage_token_expires_at = null,
      manage_token_version = manage_token_version + 1
  where id = p_booking_id
    and manage_token_hash = decode(p_token_hash, 'hex')
    and manage_token_expires_at > now()
  returning bookings.training_id into v_training_id;
  if v_training_id is null then
    return query select false, null::uuid;
  else
    return query select true, v_training_id;
  end if;
end $$;

create or replace function public.claim_web_bookings(p_profile_id uuid)
returns table (claimed integer, conflicts integer)
language plpgsql security definer set search_path = public
as $$
declare
  v_phone text;
  v_claimed integer := 0;
  v_conflicts integer := 0;
  v_row record;
begin
  select public.normalize_avangard_phone(phone) into v_phone
  from public.profiles
  where id = p_profile_id and phone_verified_at is not null
  for update;
  if v_phone is null then
    raise exception 'phone_not_verified' using errcode = 'P0001';
  end if;
  for v_row in
    select id, training_id, status
    from public.bookings
    where source = 'web' and profile_id is null and phone_normalized = v_phone
    order by created_at
    for update
  loop
    if v_row.status = 'active' and exists (
      select 1 from public.bookings
      where profile_id = p_profile_id
        and training_id = v_row.training_id
        and status = 'active'
    ) then
      v_conflicts := v_conflicts + 1;
    else
      update public.bookings set profile_id = p_profile_id where id = v_row.id;
      v_claimed := v_claimed + 1;
    end if;
  end loop;
  if v_conflicts > 0 then
    insert into public.privacy_audit(event_type, outcome, metadata)
    values (
      'claim_web_bookings',
      'conflict',
      jsonb_build_object('conflicts', v_conflicts)
    );
  end if;
  return query select v_claimed, v_conflicts;
end $$;

create or replace function public.verify_contact_and_claim_web_bookings(
  p_telegram_user_id bigint,
  p_phone text,
  p_phone_normalized text
) returns table (claimed integer, conflicts integer)
language plpgsql security definer set search_path = public
as $$
declare v_profile_id uuid;
begin
  if public.normalize_avangard_phone(p_phone) <> p_phone_normalized then
    raise exception 'phone_invalid' using errcode = 'P0001';
  end if;
  update public.profiles
  set phone = p_phone_normalized,
      phone_verified_at = now(),
      updated_at = now()
  where telegram_user_id = p_telegram_user_id
  returning id into v_profile_id;
  if v_profile_id is null then
    raise exception 'profile_not_found' using errcode = 'P0001';
  end if;
  return query select * from public.claim_web_bookings(v_profile_id);
end $$;

create or replace function public.create_profile_booking_v2(
  p_training_id uuid,
  p_profile_id uuid,
  p_name text,
  p_phone text,
  p_consent_version text
) returns table (booking_id uuid, remaining integer)
language plpgsql security definer set search_path = public
as $$
declare
  v_training public.trainings%rowtype;
  v_profile public.profiles%rowtype;
  v_phone text;
  v_active_count integer;
begin
  select * into v_training from public.trainings where id = p_training_id for update;
  if not found then raise exception 'training_not_found' using errcode = 'P0001'; end if;
  if v_training.is_active is not true or
     (v_training.date + v_training.start_time) <= public.avangard_club_now() then
    raise exception 'training_inactive' using errcode = 'P0001';
  end if;
  select * into v_profile from public.profiles where id = p_profile_id for update;
  if not found then raise exception 'profile_not_found' using errcode = 'P0001'; end if;
  if v_profile.phone_verified_at is null then
    raise exception 'phone_not_verified' using errcode = 'P0001';
  end if;
  v_phone := public.normalize_avangard_phone(p_phone);
  if public.normalize_avangard_phone(v_profile.phone) <> v_phone then
    raise exception 'phone_not_verified' using errcode = 'P0001';
  end if;
  if p_consent_version is null or trim(p_consent_version) = '' then
    raise exception 'consent_required' using errcode = 'P0001';
  end if;
  if exists (
    select 1 from public.bookings
    where training_id = p_training_id and profile_id = p_profile_id and status = 'active'
  ) then raise exception 'booking_duplicate' using errcode = 'P0001'; end if;
  if exists (
    select 1 from public.bookings
    where training_id = p_training_id
      and phone_normalized = v_phone
      and status = 'active'
  ) then raise exception 'booking_duplicate' using errcode = 'P0001'; end if;
  select count(*) into v_active_count from public.bookings
  where training_id = p_training_id and status = 'active';
  if v_active_count >= v_training.capacity then
    raise exception 'booking_full' using errcode = 'P0001';
  end if;
  insert into public.bookings(
    training_id, profile_id, name, phone, phone_normalized, source,
    consent_version, consented_at
  ) values (
    p_training_id, p_profile_id, trim(p_name), v_phone, v_phone, 'telegram',
    trim(p_consent_version), now()
  ) returning id into booking_id;
  remaining := v_training.capacity - v_active_count - 1;
  return query select booking_id, remaining;
end $$;

create or replace function public.cancel_profile_booking(
  p_booking_id uuid,
  p_profile_id uuid
) returns boolean
language plpgsql security definer set search_path = public
as $$
declare v_status text;
begin
  select status into v_status
  from public.bookings
  where id = p_booking_id and profile_id = p_profile_id
  for update;
  if not found then return false; end if;
  if v_status = 'cancelled' then return true; end if;

  update public.bookings
  set status = 'cancelled',
      manage_token_hash = null,
      manage_token_expires_at = null,
      cancel_idempotency_hash = null,
      cancel_idempotency_expires_at = null
  where id = p_booking_id and profile_id = p_profile_id and status = 'active';
  return found;
end $$;

create or replace function public.anonymize_profile(p_profile_id uuid)
returns integer
language plpgsql security definer set search_path = public
as $$
declare v_anonymized integer;
begin
  perform 1 from public.profiles where id = p_profile_id for update;
  if not found then
    raise exception 'profile_not_found' using errcode = 'P0001';
  end if;
  if exists (
    select 1 from public.bookings
    where profile_id = p_profile_id and status = 'active'
  ) then
    raise exception 'profile_has_active_bookings' using errcode = 'P0001';
  end if;

  update public.bookings
  set name = 'Удалено',
      phone = '',
      phone_normalized = null,
      profile_id = null,
      manage_token_hash = null,
      manage_token_expires_at = null,
      cancel_idempotency_hash = null,
      cancel_idempotency_expires_at = null
  where profile_id = p_profile_id;
  get diagnostics v_anonymized = row_count;

  delete from public.profiles where id = p_profile_id;
  insert into public.privacy_audit(event_type, outcome, metadata)
  values (
    'profile_anonymization',
    'completed',
    jsonb_build_object('bookings_anonymized', v_anonymized)
  );
  return v_anonymized;
end $$;

create or replace function public.create_profile_booking(
  p_training_id uuid, p_profile_id uuid, p_name text, p_phone text
) returns table (booking_id uuid, remaining integer)
language plpgsql security definer set search_path = public
as $$
declare
  v_training public.trainings%rowtype;
  v_active_count integer;
  v_phone text;
begin
  v_phone := public.normalize_avangard_phone(p_phone);
  select * into v_training from public.trainings where id = p_training_id for update;
  if not found then raise exception 'training_not_found' using errcode = 'P0001'; end if;
  if v_training.is_active is not true or
     (v_training.date + v_training.start_time) <= public.avangard_club_now() then
    raise exception 'training_inactive' using errcode = 'P0001';
  end if;
  if not exists (select 1 from public.profiles where id = p_profile_id) then
    raise exception 'profile_not_found' using errcode = 'P0001';
  end if;
  if exists (
    select 1 from public.bookings
    where training_id = p_training_id and profile_id = p_profile_id and status = 'active'
  ) then raise exception 'booking_duplicate' using errcode = 'P0001'; end if;
  if exists (
    select 1 from public.bookings
    where training_id = p_training_id
      and phone_normalized = v_phone
      and status = 'active'
  ) then raise exception 'booking_duplicate' using errcode = 'P0001'; end if;
  select count(*) into v_active_count from public.bookings
  where training_id = p_training_id and status = 'active';
  if v_active_count >= v_training.capacity then
    raise exception 'booking_full' using errcode = 'P0001';
  end if;
  insert into public.bookings(
    training_id, profile_id, name, phone, phone_normalized, source
  ) values (
    p_training_id, p_profile_id, trim(p_name), v_phone, v_phone, 'telegram'
  ) returning id into booking_id;
  update public.profiles set display_name = trim(p_name), phone = v_phone, updated_at = now()
  where id = p_profile_id;
  remaining := v_training.capacity - v_active_count - 1;
  return query select booking_id, remaining;
end $$;

create or replace function public.run_privacy_retention()
returns table (anonymized integer, rate_limits_pruned integer, idempotency_pruned integer, audit_pruned integer)
language plpgsql security definer set search_path = public
as $$
declare v_anonymized integer; v_limits integer; v_idem integer; v_audit integer;
begin
  update public.bookings b
  set name = 'Удалено', phone = '', phone_normalized = null,
      manage_token_hash = null, manage_token_expires_at = null,
      cancel_idempotency_hash = null, cancel_idempotency_expires_at = null
  from public.trainings t
  where t.id = b.training_id
    and (b.status = 'cancelled' or t.date < public.avangard_club_now()::date)
    and t.date < (public.avangard_club_now()::date - 365)
    and (b.name <> 'Удалено' or b.phone <> '');
  get diagnostics v_anonymized = row_count;
  delete from public.rate_limit_buckets where expires_at < now();
  get diagnostics v_limits = row_count;
  delete from public.booking_idempotency where expires_at < now();
  get diagnostics v_idem = row_count;
  delete from public.public_booking_requests where expires_at < now();
  delete from public.privacy_audit where expires_at < now();
  get diagnostics v_audit = row_count;
  return query select v_anonymized, v_limits, v_idem, v_audit;
end $$;

revoke all on table public.booking_idempotency from public, anon, authenticated;
revoke all on table public.public_booking_requests from public, anon, authenticated;
revoke all on table public.rate_limit_buckets from public, anon, authenticated;
revoke all on table public.privacy_audit from public, anon, authenticated;
revoke all on table public.migration_reconciliation from public, anon, authenticated;
revoke all on table public.bookings from public, anon, authenticated;
revoke all on table public.profiles from public, anon, authenticated;
grant select, insert, update, delete on table public.bookings to service_role;
grant select, insert, update, delete on table public.profiles to service_role;
grant select, insert, update, delete on table public.trainings to service_role;
grant select on table public.trainings_stats to service_role;

revoke all on function public.avangard_club_now() from public, anon, authenticated;
revoke all on function public.normalize_avangard_phone(text) from public, anon, authenticated;
revoke all on function public.check_booking_ingress_rate_limit(text) from public, anon, authenticated;
revoke all on function public.check_booking_rate_limit(text, text) from public, anon, authenticated;
revoke all on function public.reserve_public_booking_request(uuid, text, uuid, text, text) from public, anon, authenticated;
revoke all on function public.release_public_booking_request(uuid, text, uuid) from public, anon, authenticated;
revoke all on function public.create_public_booking(uuid, text, text, text, text, uuid, text, uuid, text, timestamptz) from public, anon, authenticated;
revoke all on function public.exchange_public_booking_token(uuid, text, text, timestamptz) from public, anon, authenticated;
revoke all on function public.get_public_booking_by_token(uuid, text) from public, anon, authenticated;
revoke all on function public.cancel_public_booking(uuid, text) from public, anon, authenticated;
revoke all on function public.claim_web_bookings(uuid) from public, anon, authenticated;
revoke all on function public.verify_contact_and_claim_web_bookings(bigint, text, text) from public, anon, authenticated;
revoke all on function public.run_privacy_retention() from public, anon, authenticated;
revoke all on function public.create_profile_booking_v2(uuid, uuid, text, text, text) from public, anon, authenticated;
revoke all on function public.cancel_profile_booking(uuid, uuid) from public, anon, authenticated;
revoke all on function public.anonymize_profile(uuid) from public, anon, authenticated;

grant execute on function public.avangard_club_now() to service_role;
grant execute on function public.normalize_avangard_phone(text) to service_role;
grant execute on function public.check_booking_ingress_rate_limit(text) to service_role;
grant execute on function public.check_booking_rate_limit(text, text) to service_role;
grant execute on function public.reserve_public_booking_request(uuid, text, uuid, text, text) to service_role;
grant execute on function public.release_public_booking_request(uuid, text, uuid) to service_role;
grant execute on function public.create_public_booking(uuid, text, text, text, text, uuid, text, uuid, text, timestamptz) to service_role;
grant execute on function public.exchange_public_booking_token(uuid, text, text, timestamptz) to service_role;
grant execute on function public.get_public_booking_by_token(uuid, text) to service_role;
grant execute on function public.cancel_public_booking(uuid, text) to service_role;
grant execute on function public.claim_web_bookings(uuid) to service_role;
grant execute on function public.verify_contact_and_claim_web_bookings(bigint, text, text) to service_role;
grant execute on function public.run_privacy_retention() to service_role;
grant execute on function public.create_profile_booking_v2(uuid, uuid, text, text, text) to service_role;
grant execute on function public.cancel_profile_booking(uuid, uuid) to service_role;
grant execute on function public.anonymize_profile(uuid) to service_role;
