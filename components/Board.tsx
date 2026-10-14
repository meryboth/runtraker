"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { DAYS_LETTER, MONTHS_SHORT, addDays, dayLabel, dow, keyOf } from "@/lib/dates";
import { fmtKm } from "@/lib/format";
import { jitter } from "@/lib/hand";
import { levelOf } from "@/lib/stats";
import { placeEmoji, type RunDB } from "@/lib/types";

const MAX_WEEKS = 53;
const MIN_WEEKS = 8;
const DAY_COL = 16; // columna de las letras de los días

type Props = { db: RunDB; today: Date; onOpen: (key: string) => void };

/**
 * Tablero tipo GitHub: una columna por semana, de lunes a domingo.
 * Muestra solo las semanas que entran a lo ancho (sin scroll), terminando en la actual.
 */
export function Board({ db, today, onOpen }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const [weeks, setWeeks] = useState<number | null>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const measure = () => {
      const css = getComputedStyle(el);
      const c = parseFloat(css.getPropertyValue("--c")) || 15;
      const gap = parseFloat(css.getPropertyValue("--gap")) || 4;
      const fit = Math.floor((el.clientWidth - DAY_COL) / (c + gap));
      setWeeks(Math.max(MIN_WEEKS, Math.min(MAX_WEEKS, fit)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const WEEKS = weeks ?? MIN_WEEKS;

  const tk = keyOf(today);
  const end = addDays(today, 6 - dow(today));
  const start = addDays(end, -WEEKS * 7 + 1);
  const items: ReactNode[] = [];

  DAYS_LETTER.forEach((l, i) => {
    if (i % 2 === 0) items.push(<span key={`d${i}`} className="b-day" style={{ gridRow: i + 2 }}>{l}</span>);
  });

  let lastMonth = start.getMonth();
  for (let w = 0; w < WEEKS; w++) {
    const weekStart = addDays(start, w * 7);
    const m = weekStart.getMonth();
    if (m !== lastMonth) {
      if (w < WEEKS - 1) {
        items.push(
          <span key={`m${w}`} className="b-month" style={{ gridColumn: `${w + 2} / span 3` }}>
            {MONTHS_SHORT[m]}
          </span>,
        );
      }
      lastMonth = m;
    }

    for (let i = 0; i < 7; i++) {
      const d = addDays(weekStart, i);
      const k = keyOf(d);
      const e = db[k];
      const future = d > today;
      const j = jitter(k);
      const label = future
        ? ""
        : `${dayLabel(d)} · ${e ? (e.ran ? `${fmtKm(e.km)} km ${placeEmoji(e)}`.trim() : "no corrí") : "sin anotar"}`;
      items.push(
        <button
          key={k}
          className={`cell ${future ? "future" : levelOf(e)}${k === tk ? " is-today" : ""}`}
          style={{ gridColumn: w + 2, gridRow: i + 2, "--rot": j.rot, "--r": j.radius } as CSSProperties}
          disabled={future}
          tabIndex={future ? -1 : 0}
          title={label}
          aria-label={label || undefined}
          onClick={() => onOpen(k)}
        />,
      );
    }
  }

  return (
    <div className="board-wrap" ref={wrap}>
      {weeks && <div className="board" style={{ "--weeks": WEEKS } as CSSProperties}>{items}</div>}
    </div>
  );
}

export function BoardLegend() {
  return (
    <div className="legend">
      <span>menos</span>
      <i className="cell none" /><i className="cell l1" /><i className="cell l2" /><i className="cell l3" /><i className="cell l4" />
      <span>más</span>
      <span className="legend-sep" />
      <i className="cell rest" /><span>no corrí</span>
    </div>
  );
}
