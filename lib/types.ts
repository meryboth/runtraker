/** Dónde corriste: al aire libre o bajo techo (cinta, gimnasio). */
export type Place = "outdoor" | "indoor";

export const PLACES: Record<Place, { emoji: string; label: string }> = {
  outdoor: { emoji: "🌳", label: "afuera" },
  indoor: { emoji: "🏠", label: "adentro" },
};

/** Un día anotado. Los días sin entrada son "sin anotar". */
export type DayEntry =
  | { ran: true; km: number; sec: number; place?: Place }
  | { ran: false };

/** Clave: fecha local "YYYY-MM-DD". */
export type RunDB = Record<string, DayEntry>;

export const placeEmoji = (e: DayEntry | undefined) => (e?.ran && e.place ? PLACES[e.place].emoji : "");
