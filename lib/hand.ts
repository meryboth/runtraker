/** Pequeñas imperfecciones deterministas para que nada quede "de máquina". */

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function jitter(seed: string) {
  const h = hash(seed);
  const r = (i: number) => (2 + ((h >> (i * 4)) & 7) * 0.55).toFixed(1);
  return {
    rot: `${((((h & 15) - 7.5) / 7.5) * 3.5).toFixed(1)}deg`,
    radius: `${r(1)}px ${r(2)}px ${r(3)}px ${r(4)}px`,
  };
}

/** Trazos de lapicera reutilizables. */
export const PATHS = {
  ring: "M21 4.5C30.5 4.2 36 11 35.6 20.3C35.2 29.8 28.4 35.8 19.6 35.4C10.4 35 4.3 28.6 4.6 19.4C4.9 10.6 11.2 4.6 19.8 4.8C24 5 26.6 6.2 28.6 7.6",
  blob: "M20 6.5C28.6 6.2 33.4 12 33.2 20.2C33 28.4 27.6 33.4 19.8 33.2C11.8 33 6.6 27.8 6.8 19.8C7 12 12 6.8 20 6.5Z",
  check: "M12.5 20.5L17.8 26.2L28.5 13.5",
  cross: "M14 14L26 26M26.5 13.8L13.5 26.2",
  arrowDown: "M4 3C9 5 13 10 14 17M14 17L10.5 12.8M14 17L17 12",
  arrowLeft: "M26 4C19 4 10 7 5 14M5 14L5.5 7.8M5 14L11.5 13",
};

export type Quote = { text: string; author: string; book: string };

/** Frases de libros de running (traducción propia, citas cortas con fuente). */
export const QUOTES: Quote[] = [
  { text: "El dolor es inevitable. El sufrimiento es opcional.", author: "Haruki Murakami", book: "De qué hablo cuando hablo de correr" },
  { text: "Dar lo máximo dentro de tus propios límites: esa es la esencia de correr.", author: "Haruki Murakami", book: "De qué hablo cuando hablo de correr" },
  { text: "Por lo menos nunca caminó.", author: "Haruki Murakami", book: "De qué hablo cuando hablo de correr" },
  { text: "Fácil, liviano, suave y rápido.", author: "Caballo Blanco, en Christopher McDougall", book: "Nacidos para correr" },
  { text: "A veces uno simplemente hace las cosas.", author: "Scott Jurek", book: "Correr, comer, vivir" },
  { text: "Corré cuando puedas, caminá si tenés que hacerlo, arrastrate si es necesario; pero nunca abandones.", author: "Dean Karnazes", book: "Ultramarathon Man" },
  { text: "El milagro no es haber terminado. El milagro es haber tenido el coraje de empezar.", author: "John Bingham", book: "The Courage to Start" },
  { text: "Todos somos atletas. La diferencia es que algunos entrenamos y otros no.", author: "George Sheehan", book: "Running & Being" },
];

export function randomQuoteIndex(except = -1) {
  if (QUOTES.length < 2) return 0;
  let i = except;
  while (i === except) i = Math.floor(Math.random() * QUOTES.length);
  return i;
}
