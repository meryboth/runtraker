"use client";

import { useState } from "react";
import { fmtClock, fmtKm, fmtPace } from "@/lib/format";
import { PATHS } from "@/lib/hand";
import { paceOf } from "@/lib/stats";
import { PLACES, type DayEntry, type RunDB } from "@/lib/types";
import { DayForm } from "./DayForm";
import { Arrow } from "./Hand";

type Props = {
  dayKey: string;
  db: RunDB;
  onSave: (key: string, entry: DayEntry) => void;
  onDelete: (key: string) => void;
};

/** Tarjeta de hoy: si no anotaste, el formulario está ahí mismo; si ya anotaste, el resumen. */
export function TodayPanel({ dayKey, db, onSave, onDelete }: Props) {
  const entry = db[dayKey];
  const [editing, setEditing] = useState(false);
  const showForm = !entry || editing;

  if (showForm) {
    return (
      <div className="box today today-panel">
        <p className="note">
          {entry ? "cambiá lo que haga falta" : "no te olvides de anotarlo"} <Arrow d={PATHS.arrowDown} />
        </p>
        <h1 className="h1">¿corriste hoy?</h1>
        <DayForm
          dayKey={dayKey}
          db={db}
          active={showForm}
          onSave={(k, e) => { onSave(k, e); setEditing(false); }}
          onDelete={entry ? (k) => { onDelete(k); setEditing(false); } : undefined}
          onCancel={entry ? () => setEditing(false) : undefined}
        />
      </div>
    );
  }

  if (entry.ran) {
    const pace = paceOf(entry);
    const place = entry.place ? PLACES[entry.place] : null;
    return (
      <div className="box today today-panel">
        <p className="note">bien ahí ✓</p>
        <h1 className="h1">hoy corriste</h1>
        <p className="today-result">
          <span className="hl hl-g">{fmtKm(entry.km)} km</span>
          {entry.sec > 0 && <> en <span className="hl hl-y">{fmtClock(entry.sec)}</span></>}
        </p>
        <div className="today-meta">
          {place && <span className="today-place"><span aria-hidden="true">{place.emoji}</span> {place.label}</span>}
          {pace && <span className="muted">a {fmtPace(pace)} el km</span>}
        </div>
        <div className="today-foot">
          <span />
          <button className="link" onClick={() => setEditing(true)}>editar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="box today today-panel">
      <p className="note">descansar también es entrenar</p>
      <h1 className="h1">hoy<br />descansaste</h1>
      <div className="today-foot">
        <span className="muted">¿al final saliste?</span>
        <button className="link" onClick={() => setEditing(true)}>cambiar</button>
      </div>
    </div>
  );
}
