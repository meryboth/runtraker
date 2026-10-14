"use client";

import { dayLabel, fromKey, keyOf, relativeLabel } from "@/lib/dates";
import type { DayEntry, RunDB } from "@/lib/types";
import { DayForm } from "./DayForm";

type Props = {
  open: boolean;
  dayKey: string | null;
  presetRan?: boolean;
  pickDate?: boolean;
  db: RunDB;
  today: Date;
  onClose: () => void;
  onSave: (key: string, entry: DayEntry) => void;
  onDelete: (key: string) => void;
  onPickDate: (key: string) => void;
};

/** Hoja inferior para cargar o editar cualquier día (desde el tablero, la semana o el historial). */
export function DaySheet({ open, dayKey, presetRan, pickDate, db, today, onClose, onSave, onDelete, onPickDate }: Props) {
  const d = dayKey ? fromKey(dayKey) : today;

  return (
    <>
      <div className={`backdrop${open ? " open" : ""}`} onClick={onClose} />
      <div className={`sheet${open ? " open" : ""}`} role="dialog" aria-modal="true" aria-hidden={!open} aria-labelledby="sheetTitle">
        <div className="grip" />
        <p className="note">{relativeLabel(d, today)}</p>
        <h2 className="h1 sheet-title" id="sheetTitle">{dayLabel(d)}</h2>

        {pickDate && (
          <label className="date-pick">
            <span>elegí el día</span>
            <input type="date" value={dayKey ?? ""} max={keyOf(today)} onChange={(e) => e.target.value && onPickDate(e.target.value)} />
          </label>
        )}

        <DayForm dayKey={dayKey} db={db} active={open} presetRan={presetRan} onSave={onSave} onDelete={onDelete} />
      </div>
    </>
  );
}
