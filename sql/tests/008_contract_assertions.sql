-- Run after 008 on an isolated test database.
do $$
declare
  v_duplicates integer;
  v_rls boolean;
  v_public_execute boolean;
begin
  if public.normalize_avangard_phone('8 (900) 123-45-67') <> '+79001234567' then
    raise exception 'canonical_phone_assertion_failed';
  end if;

  select active_phone_duplicate_groups into v_duplicates
  from public.migration_reconciliation
  where migration = '008_avangard_v2';
  if v_duplicates is null then
    raise exception 'migration_reconciliation_missing';
  end if;

  select relrowsecurity into v_rls
  from pg_class where oid = 'public.booking_idempotency'::regclass;
  if v_rls is not true then raise exception 'idempotency_rls_disabled'; end if;

  select relrowsecurity into v_rls
  from pg_class where oid = 'public.public_booking_requests'::regclass;
  if v_rls is not true then raise exception 'booking_requests_rls_disabled'; end if;

  select relrowsecurity into v_rls
  from pg_class where oid = 'public.bookings'::regclass;
  if v_rls is not true then raise exception 'bookings_rls_disabled'; end if;

  select relrowsecurity into v_rls
  from pg_class where oid = 'public.profiles'::regclass;
  if v_rls is not true then raise exception 'profiles_rls_disabled'; end if;

  if has_table_privilege('anon', 'public.bookings', 'SELECT') then
    raise exception 'anonymous_bookings_read_leak';
  end if;
  if has_table_privilege('anon', 'public.profiles', 'SELECT') then
    raise exception 'anonymous_profiles_read_leak';
  end if;

  select has_function_privilege(
    'anon',
    'public.create_public_booking(uuid,text,text,text,text,uuid,text,uuid,text,timestamptz)',
    'EXECUTE'
  ) into v_public_execute;
  if v_public_execute then raise exception 'public_rpc_grant_leak'; end if;

  select has_function_privilege(
    'anon',
    'public.reserve_public_booking_request(uuid,text,uuid,text,text)',
    'EXECUTE'
  ) into v_public_execute;
  if v_public_execute then raise exception 'public_reservation_rpc_grant_leak'; end if;

  select has_function_privilege(
    'anon',
    'public.check_booking_ingress_rate_limit(text)',
    'EXECUTE'
  ) into v_public_execute;
  if v_public_execute then raise exception 'public_ingress_rpc_grant_leak'; end if;

  if not exists (
    select 1 from pg_proc
    where oid = 'public.create_profile_booking_v2(uuid,uuid,text,text,text)'::regprocedure
  ) then raise exception 'mini_consent_rpc_missing'; end if;

  if has_function_privilege('anon', 'public.anonymize_profile(uuid)', 'EXECUTE') then
    raise exception 'anonymous_anonymize_rpc_leak';
  end if;

  if to_regclass('public.auth_sessions') is not null then
    select relrowsecurity into v_rls
    from pg_class where oid = 'public.auth_sessions'::regclass;
    if v_rls is not true then raise exception 'legacy_auth_sessions_rls_disabled'; end if;
    if has_table_privilege('anon', 'public.auth_sessions', 'SELECT') then
      raise exception 'legacy_auth_sessions_read_leak';
    end if;
  end if;

  if to_regclass('public.players') is not null then
    select relrowsecurity into v_rls
    from pg_class where oid = 'public.players'::regclass;
    if v_rls is not true then raise exception 'legacy_players_rls_disabled'; end if;
    if has_table_privilege('anon', 'public.players', 'SELECT')
       or has_table_privilege('authenticated', 'public.players', 'SELECT')
    then
      raise exception 'legacy_players_read_leak';
    end if;
  end if;

  if to_regclass('public.telegram_links') is not null then
    select relrowsecurity into v_rls
    from pg_class where oid = 'public.telegram_links'::regclass;
    if v_rls is not true then raise exception 'legacy_telegram_links_rls_disabled'; end if;
    if has_table_privilege('authenticated', 'public.telegram_links', 'SELECT') then
      raise exception 'legacy_telegram_links_authenticated_read_leak';
    end if;
  end if;

  if to_regprocedure('public.claim_player(text,text)') is not null
     and has_function_privilege(
       'anon', 'public.claim_player(text,text)', 'EXECUTE'
     )
  then
    raise exception 'legacy_claim_player_execute_leak';
  end if;

  if to_regprocedure('public.claim_player(text)') is not null
     and has_function_privilege(
       'anon', 'public.claim_player(text)', 'EXECUTE'
     )
  then
    raise exception 'legacy_claim_player_overload_execute_leak';
  end if;

  if to_regprocedure('public.create_booking(uuid,text,text)') is not null
     and has_function_privilege(
       'authenticated',
       'public.create_booking(uuid,text,text)',
       'EXECUTE'
     )
  then
    raise exception 'legacy_create_booking_execute_leak';
  end if;
end $$;

-- Reservation leases are fenced, all expired states are ignored, and stale
-- owners cannot complete or release a renewed lease.
do $$
declare
  v_key uuid := '00000000-0000-4000-8000-000000000841';
  v_expired_key uuid := '00000000-0000-4000-8000-000000000842';
  v_owner_one uuid := '00000000-0000-4000-8000-000000000843';
  v_owner_two uuid := '00000000-0000-4000-8000-000000000844';
  v_status text;
  v_released boolean;
begin
  select reservation_status into v_status
  from public.reserve_public_booking_request(
    v_key, repeat('a', 64), v_owner_one, repeat('1', 64), repeat('2', 64)
  );
  if v_status <> 'owner' then raise exception 'reservation_owner_missing'; end if;

  select reservation_status into v_status
  from public.reserve_public_booking_request(
    v_key, repeat('a', 64), v_owner_two, repeat('1', 64), repeat('2', 64)
  );
  if v_status <> 'pending' then raise exception 'reservation_pending_missing'; end if;

  select public.release_public_booking_request(
    v_key, repeat('a', 64), v_owner_two
  ) into v_released;
  if v_released is true then raise exception 'wrong_owner_released_lease'; end if;

  update public.public_booking_requests
  set expires_at = now() - interval '1 second'
  where scope = 'public-create' and key = v_key;

  select reservation_status into v_status
  from public.reserve_public_booking_request(
    v_key, repeat('a', 64), v_owner_two, repeat('3', 64), repeat('4', 64)
  );
  if v_status <> 'owner' then raise exception 'expired_pending_not_renewed'; end if;

  select public.release_public_booking_request(
    v_key, repeat('a', 64), v_owner_one
  ) into v_released;
  if v_released is true then raise exception 'stale_owner_released_new_lease'; end if;

  begin
    perform public.create_public_booking(
      '00000000-0000-4000-8000-000000000899',
      'Fixture', '+79000000841', '+79000000841', '2026-07-31-v1',
      v_key, repeat('a', 64), v_owner_one, repeat('b', 64), now() + interval '1 day'
    );
    raise exception 'stale_owner_completed_new_lease';
  exception
    when sqlstate 'P0001' then
      if sqlerrm <> 'reservation_lost' then raise; end if;
  end;

  insert into public.public_booking_requests(
    scope, key, request_hash, state, expires_at
  ) values (
    'public-create', v_expired_key, decode(repeat('c', 64), 'hex'),
    'completed', now() - interval '1 second'
  );
  select reservation_status into v_status
  from public.reserve_public_booking_request(
    v_expired_key, repeat('c', 64), v_owner_one,
    repeat('5', 64), repeat('6', 64)
  );
  if v_status <> 'owner' then raise exception 'expired_completed_replayed'; end if;

  delete from public.public_booking_requests
  where key in (v_key, v_expired_key);
  delete from public.rate_limit_buckets
  where bucket_hash in (
    decode(repeat('1', 64), 'hex'), decode(repeat('2', 64), 'hex'),
    decode(repeat('3', 64), 'hex'), decode(repeat('4', 64), 'hex'),
    decode(repeat('5', 64), 'hex'), decode(repeat('6', 64), 'hex')
  );
end $$;

-- Phone/training protection is a true rolling window and reports the bucket
-- without retaining the phone or IP.
do $$
declare
  v_result record;
  v_phone_hash text := repeat('7', 64);
  v_index integer;
  v_attempts integer;
begin
  for v_index in 1..3 loop
    select * into v_result
    from public.check_booking_rate_limit(
      encode(digest('fixture-ip-' || v_index::text, 'sha256'), 'hex'),
      v_phone_hash
    );
  end loop;
  update public.rate_limit_buckets
  set attempt_times = array[
        clock_timestamp() - interval '14 minutes',
        clock_timestamp() - interval '7 minutes',
        clock_timestamp() - interval '1 minute'
      ],
      attempts = 3,
      window_started_at = clock_timestamp() - interval '14 minutes'
  where bucket_hash = decode(v_phone_hash, 'hex');
  select * into v_result
  from public.check_booking_rate_limit(
    encode(digest('fixture-ip-4', 'sha256'), 'hex'),
    v_phone_hash
  );
  if v_result.allowed is true
    or v_result.limited_bucket <> 'phone_training'
    or v_result.retry_after <= 0
  then
    raise exception 'rolling_phone_limit_not_reported';
  end if;
  select cardinality(attempt_times) into v_attempts
  from public.rate_limit_buckets
  where bucket_hash = decode(v_phone_hash, 'hex');
  if v_attempts <> 3 then
    raise exception 'denied_attempt_extended_rolling_window';
  end if;

  update public.rate_limit_buckets
  set attempt_times = array[now() - interval '16 minutes'],
      attempts = 1,
      window_started_at = now() - interval '16 minutes'
  where bucket_hash = decode(v_phone_hash, 'hex');
  select * into v_result
  from public.check_booking_rate_limit(
    encode(digest('fixture-ip-reset', 'sha256'), 'hex'),
    v_phone_hash
  );
  if v_result.allowed is not true then
    raise exception 'rolling_phone_limit_did_not_prune';
  end if;

  delete from public.rate_limit_buckets
  where bucket_hash = decode(v_phone_hash, 'hex')
     or bucket_hash in (
       select digest('fixture-ip-' || value::text, 'sha256')
       from generate_series(1, 4) value
     )
     or bucket_hash = digest('fixture-ip-reset', 'sha256');
end $$;

-- Cancellation revokes manage access but remains retry-safe for ten minutes
-- using a separate digest that cannot read or exchange the booking.
do $$
declare
  v_booking uuid := '00000000-0000-4000-8000-000000000821';
  v_training uuid := '00000000-0000-4000-8000-000000000802';
  v_first boolean;
  v_second boolean;
  v_wrong boolean;
begin
  insert into public.trainings(
    id, date, start_time, end_time, price, capacity, is_active
  ) values (
    v_training, '2099-12-29', '18:00', '20:00', 500, 10, true
  ) on conflict (id) do nothing;
  insert into public.bookings(
    id, training_id, name, phone, phone_normalized, status, source,
    manage_token_hash, manage_token_expires_at
  ) values (
    v_booking, v_training, 'Fixture', '+79009999999', '+79009999999',
    'active', 'web', digest('fixture-token', 'sha256'), now() + interval '1 day'
  ) on conflict (id) do nothing;

  select c.cancelled into v_first
  from public.cancel_public_booking(
    v_booking, encode(digest('fixture-token', 'sha256'), 'hex')
  ) c;
  select c.cancelled into v_second
  from public.cancel_public_booking(
    v_booking, encode(digest('fixture-token', 'sha256'), 'hex')
  ) c;
  select c.cancelled into v_wrong
  from public.cancel_public_booking(
    v_booking, encode(digest('wrong-token', 'sha256'), 'hex')
  ) c;

  if v_first is not true or v_second is not true or v_wrong is not false then
    raise exception 'cancel_idempotency_assertion_failed';
  end if;
  if exists (
    select 1 from public.get_public_booking_by_token(
      v_booking, encode(digest('fixture-token', 'sha256'), 'hex')
    )
  ) then raise exception 'cancelled_manage_token_not_revoked'; end if;

  delete from public.bookings where id = v_booking;
  delete from public.trainings where id = v_training;
end $$;

-- Organizer anonymization refuses active bookings, while Mini cancellation
-- revokes management material and makes the profile eligible for deletion.
do $$
declare
  v_profile uuid := '00000000-0000-4000-8000-000000000831';
  v_training uuid := '00000000-0000-4000-8000-000000000832';
  v_booking uuid := '00000000-0000-4000-8000-000000000833';
  v_cancelled boolean;
  v_anonymized integer;
begin
  insert into public.trainings(
    id, date, start_time, end_time, price, capacity, is_active
  ) values (
    v_training, '2099-12-31', '18:00', '20:00', 500, 10, true
  );
  insert into public.profiles(
    id, telegram_user_id, first_name, display_name, phone, phone_verified_at
  ) values (
    v_profile, 9000000831, 'Fixture', 'Fixture', '+79000000831', now()
  );
  insert into public.bookings(
    id, training_id, profile_id, name, phone, phone_normalized, status, source,
    manage_token_hash, manage_token_expires_at
  ) values (
    v_booking, v_training, v_profile, 'Fixture', '+79000000831', '+79000000831',
    'active', 'telegram', digest('mini-manage-token', 'sha256'), now() + interval '1 day'
  );

  begin
    perform public.anonymize_profile(v_profile);
    raise exception 'active_profile_anonymization_was_not_blocked';
  exception
    when sqlstate 'P0001' then
      if sqlerrm <> 'profile_has_active_bookings' then raise; end if;
  end;

  select public.cancel_profile_booking(v_booking, v_profile) into v_cancelled;
  if v_cancelled is not true then raise exception 'mini_cancel_failed'; end if;
  if exists (
    select 1 from public.bookings
    where id = v_booking
      and (status <> 'cancelled' or manage_token_hash is not null)
  ) then raise exception 'mini_cancel_did_not_revoke_management_token'; end if;

  select public.anonymize_profile(v_profile) into v_anonymized;
  if v_anonymized <> 1 then raise exception 'profile_anonymization_count_failed'; end if;
  if exists (select 1 from public.profiles where id = v_profile) then
    raise exception 'profile_not_deleted';
  end if;
  if not exists (
    select 1 from public.bookings
    where id = v_booking and name = 'Удалено' and phone = '' and profile_id is null
  ) then raise exception 'profile_booking_not_anonymized'; end if;

  delete from public.trainings where id = v_training;
end $$;

-- When the duplicate fixture was loaded, migration 008 must complete without
-- creating a broken unique index and must record the collision without PII.
do $$
declare v_fixture_exists boolean; v_duplicates integer;
begin
  select exists(
    select 1 from public.bookings
    where id = '00000000-0000-4000-8000-000000000811'
  ) into v_fixture_exists;
  if v_fixture_exists then
    select active_phone_duplicate_groups into v_duplicates
    from public.migration_reconciliation where migration = '008_avangard_v2';
    if v_duplicates < 1 then raise exception 'duplicate_preflight_not_recorded'; end if;
    if to_regclass('public.bookings_training_active_phone_lookup_idx') is null then
      raise exception 'duplicate_lookup_index_missing';
    end if;
  end if;
end $$;
