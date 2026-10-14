import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { DayEntry, Place, RunDB } from "./types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** null si no hay credenciales: la app sigue funcionando solo en local. */
export const supabase: SupabaseClient | null =
  url && key ? createClient(url, key, { auth: { persistSession: true, detectSessionInUrl: true } }) : null;

export const TABLE = "run_days";

export type RunRow = {
  user_id?: string;
  day: string;
  ran: boolean;
  km: number | null;
  sec: number | null;
  place?: Place | null;
};

export const toRow = (day: string, e: DayEntry, userId: string): RunRow =>
  e.ran
    ? { user_id: userId, day, ran: true, km: e.km, sec: e.sec, place: e.place ?? null }
    : { user_id: userId, day, ran: false, km: null, sec: null, place: null };

export const toRows = (db: RunDB, userId: string) => Object.entries(db).map(([k, e]) => toRow(k, e, userId));

export function fromRows(rows: RunRow[]): RunDB {
  const db: RunDB = {};
  for (const r of rows) {
    db[r.day] = r.ran
      ? { ran: true, km: Number(r.km), sec: r.sec ?? 0, ...(r.place ? { place: r.place } : {}) }
      : { ran: false };
  }
  return db;
}
