"use client";

import { useState, type CSSProperties } from "react";
import { DAYS_LETTER, MONTHS, addDays, dow, keyOf } from "@/lib/dates";
import { fmtKm, plural } from "@/lib/format";
import { jitter } from "@/lib/hand";
import { levelOf } from "@/lib/stats";
import { placeEmoji, type RunDB } from "@/lib/types";

type Props = {
  db: RunDB;
  today: Date;
  onOpen: (key: string) => void;
  onDemo: () => void;
  onWipe: () => void;
};

const monthStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);

/** Historial como calendario: un mes a la vez, cada día con sus km y dónde corriste. */
export function History({ db, today, onOpen, onDemo, onWipe }: Props) {
  const [month, setMonth] = useState(() => monthStart(today));
  const tk = keyOf(today);
  const y = month.getFullYear();
  const m = month.getMonth();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const offset = dow(month);
  const isCurrent = y === today.getFullYear() && m === today.getMonth();

  let runs = 0;
  let km = 0;
  let rests = 0;
  const cells = Array.from({ length: daysInMonth }, (_, i) => {
    const d = addDays(month, i);
    const k = keyOf(d);
    const e = db[k];
    if (e?.ran) { runs++; km += e.km; } else if (e) rests++;
    return { d, k, e, future: d > today };
  });

  const go = (delta: number) => setMonth(new Date(y, m + delta, 1));

  return (
    <div className="cal">
      <div className="cal-head">
        <h1 className="h1">historial</h1>
        <div className="cal-nav">
          <button className="cal-arrow" onClick={() => go(-1)} aria-label="mes anterior">‹</button>
          <span className="cal-month">{MONTHS[m]} {y}</span>
          <button className="cal-arrow" onClick={() => go(1)} disabled={isCurrent} aria-label="mes siguiente">›</button>
        </div>
      </div>

      <p className="cal-summary">
        {runs
          ? <><span className="hl hl-g">{runs} {plural(runs, "corrida", "corridas")}</span> · {fmtKm(Math.round(km * 10) / 10)} km{rests > 0 && <> · {rests} {plural(rests, "descanso", "descansos")}</>}</>
          : <span className="muted">sin corridas este mes</span>}
      </p>

      <div className="cal-grid">
        {DAYS_LETTER.map((l, i) => <span key={`h${i}`} className="cal-dow">{l}</span>)}
        {Array.from({ length: offset }, (_, i) => <span key={`b${i}`} />)}
        {cells.map(({ d, k, e, future }) => {
          const j = jitter(k);
          return (
            <button
              key={k}
              className={`cal-day ${future ? "future" : levelOf(e)}${k === tk ? " is-today" : ""}`}
              style={{ "--rot": j.rot, "--r": j.radius } as CSSProperties}
              disabled={future}
              onClick={() => onOpen(k)}
              aria-label={`${d.getDate()} de ${MONTHS[m]}${e ? (e.ran ? `, ${fmtKm(e.km)} km` : ", no corrí") : ""}`}
            >
              <span className="cal-n">{d.getDate()}</span>
              {e?.ran && <span className="cal-km">{fmtKm(Math.round(e.km * 10) / 10)}</span>}
              {e?.ran && placeEmoji(e) && <span className="cal-place" aria-hidden="true">{placeEmoji(e)}</span>}
            </button>
          );
        })}
      </div>

      <div className="danger-zone">
        <button className="link" onClick={onDemo}>cargar datos de ejemplo</button>
        <button className="link link--danger" onClick={onWipe}>borrar todo</button>
      </div>
    </div>
  );
}
