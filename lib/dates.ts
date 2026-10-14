export const DAYS = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];
export const DAYS_SHORT = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"];
export const DAYS_LETTER = ["L", "M", "X", "J", "V", "S", "D"];
export const MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];
export const MONTHS_SHORT = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

export const pad = (n: number) => String(n).padStart(2, "0");

export const keyOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const fromKey = (k: string) => {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

/** Día de la semana empezando en lunes: 0 = lunes … 6 = domingo. */
export const dow = (d: Date) => (d.getDay() + 6) % 7;

export const dayLabel = (d: Date) => `${DAYS[dow(d)]} ${d.getDate()} de ${MONTHS[d.getMonth()]}`;

export const shortDate = (d: Date) => `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;

export const daysBetween = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / 86400000);

export function relativeLabel(d: Date, today: Date) {
  const n = daysBetween(d, today);
  if (n === 0) return "hoy";
  if (n === 1) return "ayer";
  if (n < 7) return `hace ${n} días`;
  if (n < 14) return "la semana pasada";
  return `hace ${Math.round(n / 7)} semanas`;
}
