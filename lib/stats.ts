import { addDays, dow, fromKey, keyOf } from "./dates";
import type { DayEntry, RunDB } from "./types";

export type Level = "none" | "rest" | "l1" | "l2" | "l3" | "l4";

/** Intensidad del cuadradito según los km del día. */
export function levelOf(e: DayEntry | undefined): Level {
  if (!e) return "none";
  if (!e.ran) return "rest";
  if (e.km < 3) return "l1";
  if (e.km < 6) return "l2";
  if (e.km < 10) return "l3";
  return "l4";
}

export const paceOf = (e: DayEntry | undefined) =>
  e && e.ran && e.km > 0 && e.sec > 0 ? e.sec / e.km : null;

export type WeekdayStat = { ran: number; rest: number; total: number; km: number };

export type Stats = {
  first: string | null;
  days: number;          // días desde el primer registro hasta hoy
  runs: number;
  rest: number;          // descansos anotados
  km: number;
  sec: number;
  avgPace: number | null;
  longest: { km: number; key: string } | null;
  bestPace: { pace: number; key: string } | null;
  streak: number;        // días seguidos corriendo (hoy todavía no rompe la racha)
  bestStreak: number;
  weekKm: number;
  weekRuns: number;
  lastWeekKm: number;
  monthRuns: number;
  weekday: WeekdayStat[]; // 0 = lunes
  places: { outdoor: { runs: number; km: number }; indoor: { runs: number; km: number }; unknown: number };
};

export function computeStats(db: RunDB, today: Date): Stats {
  const tk = keyOf(today);
  const keys = Object.keys(db).filter((k) => k <= tk).sort();

  const s: Stats = {
    first: keys[0] ?? null,
    days: 0, runs: 0, rest: 0, km: 0, sec: 0,
    avgPace: null, longest: null, bestPace: null,
    streak: 0, bestStreak: 0,
    weekKm: 0, weekRuns: 0, lastWeekKm: 0, monthRuns: 0,
    weekday: Array.from({ length: 7 }, () => ({ ran: 0, rest: 0, total: 0, km: 0 })),
    places: { outdoor: { runs: 0, km: 0 }, indoor: { runs: 0, km: 0 }, unknown: 0 },
  };
  if (!s.first) return s;

  let run = 0;
  let pacedKm = 0;
  let pacedSec = 0;

  for (let d = fromKey(s.first); d <= today; d = addDays(d, 1)) {
    const k = keyOf(d);
    const e = db[k];
    const w = s.weekday[dow(d)];
    s.days++;
    w.total++;

    if (e?.ran) {
      s.runs++;
      s.km += e.km;
      s.sec += e.sec;
      w.ran++;
      w.km += e.km;
      if (e.place) { s.places[e.place].runs++; s.places[e.place].km += e.km; } else s.places.unknown++;
      run++;
      s.bestStreak = Math.max(s.bestStreak, run);
      if (!s.longest || e.km > s.longest.km) s.longest = { km: e.km, key: k };
      const p = paceOf(e);
      if (p) {
        pacedKm += e.km;
        pacedSec += e.sec;
        if (e.km >= 1 && (!s.bestPace || p < s.bestPace.pace)) s.bestPace = { pace: p, key: k };
      }
    } else {
      if (e) { s.rest++; w.rest++; }
      if (k !== tk) run = 0;
    }
  }

  s.avgPace = pacedKm ? pacedSec / pacedKm : null;

  let d = db[tk]?.ran ? today : addDays(today, -1);
  while (db[keyOf(d)]?.ran) { s.streak++; d = addDays(d, -1); }

  const monday = addDays(today, -dow(today));
  for (let i = 0; i < 7; i++) {
    const cur = db[keyOf(addDays(monday, i))];
    const prev = db[keyOf(addDays(monday, i - 7))];
    if (cur?.ran && addDays(monday, i) <= today) { s.weekKm += cur.km; s.weekRuns++; }
    if (prev?.ran) s.lastWeekKm += prev.km;
  }

  const month = tk.slice(0, 7);
  s.monthRuns = keys.filter((k) => k.startsWith(month) && db[k].ran).length;

  return s;
}

/** Datos inventados para ver cómo se ve la app con historia. */
export function demoData(today: Date): RunDB {
  const bias = [0.5, 0.72, 0.4, 0.7, 0.3, 0.78, 0.28];
  const db: RunDB = {};
  for (let i = 160; i >= 1; i--) {
    const d = addDays(today, -i);
    const w = dow(d);
    if (Math.random() < bias[w]) {
      const km = w === 5 ? 8 + Math.random() * 9 : 3 + Math.random() * 5;
      const pace = 295 + Math.random() * 75 + (km > 12 ? 15 : 0);
      db[keyOf(d)] = { ran: true, km: Math.round(km * 10) / 10, sec: Math.round(km * pace), place: Math.random() < 0.8 ? "outdoor" : "indoor" };
    } else if (Math.random() < 0.6) {
      db[keyOf(d)] = { ran: false };
    }
  }
  return db;
}
