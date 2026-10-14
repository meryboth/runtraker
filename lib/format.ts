import { pad } from "./dates";

export const fmtKm = (km: number) => km.toLocaleString("es-AR", { maximumFractionDigits: 2 });

/** 28:30 o 1:05:12 */
export function fmtClock(sec: number) {
  const s = Math.round(sec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return h ? `${h}:${pad(m)}:${pad(ss)}` : `${m}:${pad(ss)}`;
}

/** 26 h 10 min */
export function fmtLong(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.round((sec % 3600) / 60);
  return h ? `${h} h ${m} min` : `${m} min`;
}

/** 5'29" */
export function fmtPace(secPerKm: number) {
  const r = Math.round(secPerKm);
  return `${Math.floor(r / 60)}'${pad(r % 60)}"`;
}

export const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);
