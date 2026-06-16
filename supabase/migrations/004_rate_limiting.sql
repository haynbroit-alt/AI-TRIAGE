-- Rate limiting : 10 analyses / jour / utilisateur (free tier)

create table if not exists daily_usage (
  user_id text    not null,
  date    date    not null default current_date,
  count   integer not null default 0,
  primary key (user_id, date)
);

create index if not exists idx_daily_usage_date on daily_usage(date);

-- Incrément atomique.
-- Retourne le nouveau compteur, ou NULL si la limite est atteinte.
create or replace function try_increment_usage(p_user_id text, p_limit integer)
returns integer
language plpgsql
as $$
declare
  v_count integer;
begin
  insert into daily_usage (user_id, date, count)
  values (p_user_id, current_date, 1)
  on conflict (user_id, date)
  do update
    set count = daily_usage.count + 1
    where daily_usage.count < p_limit
  returning count into v_count;

  return v_count; -- NULL si aucune ligne mise à jour = limite atteinte
end;
$$;
