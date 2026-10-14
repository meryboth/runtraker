-- Dónde corriste: 'outdoor' (afuera) o 'indoor' (adentro: cinta, gimnasio).
-- Opcional: los días viejos quedan en null ("sin marcar"). Solo aplica a días corridos.

alter table public.run_days
  add column if not exists place text;

alter table public.run_days
  drop constraint if exists run_days_place_valid;

alter table public.run_days
  add constraint run_days_place_valid
  check (place is null or (ran and place in ('outdoor', 'indoor')));
