alter table trainings
  add column if not exists location_name text,
  add column if not exists address text;
