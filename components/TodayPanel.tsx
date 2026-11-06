"use client";

import { useState } from "react";
import { DAYS, MONTHS_SHORT, dow } from "@/lib/dates";
import { fmtClock, fmtKm, fmtPace, plural } from "@/lib/format";
import { paceOf } from "@/lib/stats";
import { PLACES, type DayEntry, type RunDB } from "@/lib/types";
import { DayForm } from "./DayForm";

type Props = {
  dayKey: string;
  db: RunDB;
  today: Date;
  weekKm: number;
  streak: number;
  onSave: (key: string, entry: DayEntry) => void;
  onDelete: (key: string) => void;
};

/**
 * Panel de hoy: bloque naranja con el número grande de la semana y el título,
 * y adentro una tarjeta blanca con el formulario (o el resumen si ya anotaste).
 */
export function TodayPanel({ dayKey, db, today, weekKm, streak, onSave, onDelete }: Props) {
  const entry = db[dayKey];
  const [editing, setEditing] = useState(false);
  const showForm = !entry || editing;

  const title = !entry || editing
    ? <>¿Corriste <span>hoy?</span></>
    : entry.ran
      ? <>Hoy <span>corriste</span></>
      : <>Hoy <span>descansaste</span></>;

  return (
    <section className="hero today-panel">
      <div className="hero-top">
        <span className="chip">{DAYS[dow(today)]} {today.getDate()} {MONTHS_SHORT[today.getMonth()]}</span>
        <span className="chip chip--ghost">{streak} {plural(streak, "día", "días")} de racha</span>
      </div>

      <div className="hero-figure">
        <span className="hero-number">{fmtKm(Math.round(weekKm * 10) / 10)}</span>
        <span className="hero-unit">km<br />esta semana</span>
      </div>

      <h1 className="hero-title">{title}</h1>

      <div className="hero-card">
        {showForm ? (
          <DayForm
            dayKey={dayKey}
            db={db}
            active={showForm}
            onSave={(k, e) => { onSave(k, e); setEditing(false); }}
            onDelete={entry ? (k) => { onDelete(k); setEditing(false); } : undefined}
            onCancel={entry ? () => setEditing(false) : undefined}
          />
        ) : entry.ran ? (
          <Summary entry={entry} onEdit={() => setEditing(true)} />
        ) : (
          <div className="summary">
            <p className="meta">descanso</p>
            <p className="summary-line">Descansar también es entrenar.</p>
            <button className="btn btn--ghost" onClick={() => setEditing(true)}>¿Al final saliste? Cambiar</button>
          </div>
        )}
      </div>
    </section>
  );
}

function Summary({ entry, onEdit }: { entry: Extract<DayEntry, { ran: true }>; onEdit: () => void }) {
  const pace = paceOf(entry);
  const place = entry.place ? PLACES[entry.place] : null;
  return (
    <div className="summary">
      <div className="summary-stats">
        <div>
          <p className="meta">distancia</p>
          <p className="summary-value">{fmtKm(entry.km)}<small>km</small></p>
        </div>
        <div>
          <p className="meta">tiempo</p>
          <p className="summary-value">{entry.sec > 0 ? fmtClock(entry.sec) : "—"}</p>
        </div>
        <div>
          <p className="meta">ritmo</p>
          <p className="summary-value">{pace ? fmtPace(pace) : "—"}<small>min/km</small></p>
        </div>
      </div>
      <div className="summary-foot">
        {place && <span className="chip chip--light">{place.label}</span>}
        <button className="btn btn--ghost" onClick={onEdit}>Editar</button>
      </div>
    </div>
  );
}
