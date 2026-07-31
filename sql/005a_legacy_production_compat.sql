-- Clean-install bridge for columns observed in production before migrations 006/007.
-- This migration is intentionally additive and runs after 005, before 006.
alter table public.bookings
  add column if not exists player_id uuid,
  add column if not exists phone_normalized text;

update public.bookings
set phone_normalized = regexp_replace(phone, '[\s()-]', '', 'g')
where phone_normalized is null;

create index if not exists bookings_player_id_idx
  on public.bookings(player_id)
  where player_id is not null;

create index if not exists bookings_phone_normalized_idx
  on public.bookings(phone_normalized);

