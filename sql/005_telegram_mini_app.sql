create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  telegram_user_id bigint unique not null,
  telegram_username text,
  first_name text not null,
  last_name text,
  display_name text not null,
  phone text,
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.bookings add column if not exists profile_id uuid references public.profiles(id) on delete set null;
create index if not exists bookings_profile_status_idx on public.bookings(profile_id, status, created_at);
create unique index if not exists bookings_training_active_profile_idx
  on public.bookings(training_id, profile_id) where status = 'active' and profile_id is not null;
create index if not exists trainings_active_datetime_idx on public.trainings(is_active, date, start_time);

alter table public.profiles enable row level security;
-- Mini App identity is Telegram initData, not Supabase Auth. All profile/booking access
-- therefore goes through validated server endpoints. No anon policies are intentional.

drop view if exists public.trainings_stats;
create view public.trainings_stats with (security_invoker = true) as
  select t.*,
    coalesce(count(b.id) filter (where b.status = 'active'), 0) as active_bookings,
    coalesce(count(b.id), 0) as total_bookings,
    (t.capacity - coalesce(count(b.id) filter (where b.status = 'active'), 0)) as remaining
  from public.trainings t
  left join public.bookings b on b.training_id = t.id
  group by t.id;

grant select on public.trainings_stats to anon, authenticated;

create or replace function public.create_profile_booking(
  p_training_id uuid, p_profile_id uuid, p_name text, p_phone text
) returns table (booking_id uuid, remaining integer)
language plpgsql security invoker set search_path = public as $$
declare
  v_training trainings%rowtype;
  v_active_count integer;
begin
  select * into v_training from trainings where id = p_training_id for update;
  if not found then raise exception 'training_not_found' using errcode = 'P0001'; end if;
  if v_training.is_active is not true then raise exception 'training_inactive' using errcode = 'P0001'; end if;
  if (v_training.date + v_training.start_time) <= localtimestamp then
    raise exception 'training_past' using errcode = 'P0001';
  end if;
  if not exists (select 1 from profiles where id = p_profile_id) then
    raise exception 'profile_not_found' using errcode = 'P0001';
  end if;
  if exists (select 1 from bookings where training_id = p_training_id and profile_id = p_profile_id and status = 'active') then
    raise exception 'booking_duplicate' using errcode = 'P0001';
  end if;
  select count(*) into v_active_count from bookings where training_id = p_training_id and status = 'active';
  if v_active_count >= v_training.capacity then raise exception 'booking_full' using errcode = 'P0001'; end if;
  insert into bookings(training_id, profile_id, name, phone)
  values(p_training_id, p_profile_id, p_name, p_phone) returning id into booking_id;
  update profiles set display_name = p_name, phone = p_phone, updated_at = now() where id = p_profile_id;
  remaining := v_training.capacity - v_active_count - 1;
  return query select booking_id, remaining;
end $$;

create or replace function public.cancel_profile_booking(p_booking_id uuid, p_profile_id uuid)
returns boolean language plpgsql security invoker set search_path = public as $$
declare v_count integer;
begin
  update bookings set status = 'cancelled'
  where id = p_booking_id and profile_id = p_profile_id and status = 'active';
  get diagnostics v_count = row_count;
  return v_count = 1;
end $$;

revoke all on function public.create_profile_booking(uuid, uuid, text, text) from public, anon, authenticated;
revoke all on function public.cancel_profile_booking(uuid, uuid) from public, anon, authenticated;
grant execute on function public.create_profile_booking(uuid, uuid, text, text) to service_role;
grant execute on function public.cancel_profile_booking(uuid, uuid) to service_role;
