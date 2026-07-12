-- Keep duplicate protection for active bookings while allowing a user to
-- book the same training again after cancelling an earlier booking.
drop index if exists public.bookings_training_phone_idx;

create unique index if not exists bookings_training_phone_idx
  on public.bookings(training_id, phone_normalized)
  where status = 'active';
