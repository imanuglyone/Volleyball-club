-- Run after migrations 001-007 and before 008 on an isolated test database.
-- Then apply 008 and run 008_contract_assertions.sql.
drop index if exists public.bookings_training_phone_idx;

insert into public.trainings(
  id, date, start_time, end_time, price, capacity, is_active
) values (
  '00000000-0000-4000-8000-000000000801',
  '2099-12-30', '18:00', '20:00', 500, 10, true
) on conflict (id) do nothing;

insert into public.bookings(
  id, training_id, name, phone, phone_normalized, status
) values
  (
    '00000000-0000-4000-8000-000000000811',
    '00000000-0000-4000-8000-000000000801',
    'Fixture A', '8 (900) 123-45-67', '89001234567', 'active'
  ),
  (
    '00000000-0000-4000-8000-000000000812',
    '00000000-0000-4000-8000-000000000801',
    'Fixture B', '+7 900 123 45 67', '+79001234567', 'active'
  )
on conflict (id) do nothing;

