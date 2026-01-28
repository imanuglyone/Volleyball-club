create extension if not exists "pgcrypto";

create table if not exists trainings (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  start_time time not null,
  end_time time not null,
  price integer not null,
  capacity integer not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  training_id uuid not null references trainings(id) on delete cascade,
  name text not null,
  phone text not null,
  status text not null default 'active' check (status in ('active', 'cancelled')),
  created_at timestamptz not null default now()
);

create unique index if not exists trainings_date_idx on trainings(date);
create index if not exists trainings_active_date_idx on trainings(is_active, date);
create unique index if not exists bookings_training_phone_idx on bookings(training_id, phone);
create index if not exists bookings_training_status_idx on bookings(training_id, status);

create or replace view trainings_stats as
  select
    t.*,
    coalesce(count(b.id) filter (where b.status = 'active'), 0) as active_bookings,
    coalesce(count(b.id), 0) as total_bookings,
    (t.capacity - coalesce(count(b.id) filter (where b.status = 'active'), 0)) as remaining
  from trainings t
  left join bookings b on b.training_id = t.id
  group by t.id;

create or replace function create_booking(
  p_training_id uuid,
  p_name text,
  p_phone text
)
returns table (booking_id uuid, remaining integer)
language plpgsql
as $$
declare
  v_training trainings%rowtype;
  v_active_count integer;
begin
  select * into v_training from trainings where id = p_training_id for update;
  if not found then
    raise exception 'training_not_found' using errcode = 'P0001';
  end if;

  if v_training.is_active is not true then
    raise exception 'training_inactive' using errcode = 'P0001';
  end if;

  if v_training.date < current_date then
    raise exception 'training_past' using errcode = 'P0001';
  end if;

  if exists (
    select 1 from bookings where training_id = p_training_id and phone = p_phone
  ) then
    raise exception 'booking_duplicate' using errcode = 'P0001';
  end if;

  select count(*) into v_active_count
  from bookings
  where training_id = p_training_id and status = 'active';

  if v_active_count >= v_training.capacity then
    raise exception 'booking_full' using errcode = 'P0001';
  end if;

  insert into bookings (training_id, name, phone)
  values (p_training_id, p_name, p_phone)
  returning id into booking_id;

  remaining := v_training.capacity - (v_active_count + 1);
  return query select booking_id, remaining;
end;
$$;

alter table trainings enable row level security;
alter table bookings enable row level security;

create policy "Public read active trainings"
  on trainings
  for select
  using (is_active = true and date >= current_date);

grant select on trainings_stats to anon, authenticated;
