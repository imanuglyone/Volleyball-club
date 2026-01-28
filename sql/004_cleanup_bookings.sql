create or replace function cleanup_old_bookings(p_before date)
returns integer
language plpgsql
as $$
declare
  deleted_count integer;
begin
  delete from bookings
  where training_id in (
    select id from trainings where date < p_before
  );

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;
