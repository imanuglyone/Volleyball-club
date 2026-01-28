drop view if exists trainings_stats;

create or replace view trainings_stats as
  select
    t.*,
    coalesce(count(b.id) filter (where b.status = 'active'), 0) as active_bookings,
    coalesce(count(b.id), 0) as total_bookings,
    (t.capacity - coalesce(count(b.id) filter (where b.status = 'active'), 0)) as remaining
  from trainings t
  left join bookings b on b.training_id = t.id
  group by t.id;
