-- Preserve compatibility with the legacy bookings.phone_normalized constraint.
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
  insert into bookings(training_id, profile_id, name, phone, phone_normalized)
  values(p_training_id, p_profile_id, p_name, p_phone, p_phone) returning id into booking_id;
  update profiles set display_name = p_name, phone = p_phone, updated_at = now() where id = p_profile_id;
  remaining := v_training.capacity - v_active_count - 1;
  return query select booking_id, remaining;
end $$;

revoke all on function public.create_profile_booking(uuid, uuid, text, text) from public, anon, authenticated;
grant execute on function public.create_profile_booking(uuid, uuid, text, text) to service_role;
