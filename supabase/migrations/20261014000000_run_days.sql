-- runtrack: un registro por día y por usuario.
-- Días sin fila = "sin anotar". ran = false = "no corrí".

create table if not exists public.run_days (
  user_id    uuid        not null default auth.uid() references auth.users (id) on delete cascade,
  day        date        not null,
  ran        boolean     not null,
  km         numeric(6, 2),
  sec        integer,
  updated_at timestamptz not null default now(),
  primary key (user_id, day),
  constraint run_days_ran_has_km check (not ran or (km is not null and km > 0)),
  constraint run_days_rest_is_empty check (ran or (km is null and sec is null)),
  constraint run_days_sec_positive check (sec is null or sec >= 0)
);

-- updated_at automático
create or replace function public.run_days_touch()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists run_days_touch on public.run_days;
create trigger run_days_touch
  before update on public.run_days
  for each row execute function public.run_days_touch();

-- Seguridad: cada usuario ve y edita solo sus propios días.
alter table public.run_days enable row level security;

drop policy if exists "run_days: leer los propios" on public.run_days;
create policy "run_days: leer los propios" on public.run_days
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "run_days: crear los propios" on public.run_days;
create policy "run_days: crear los propios" on public.run_days
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "run_days: editar los propios" on public.run_days;
create policy "run_days: editar los propios" on public.run_days
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "run_days: borrar los propios" on public.run_days;
create policy "run_days: borrar los propios" on public.run_days
  for delete to authenticated
  using ((select auth.uid()) = user_id);
