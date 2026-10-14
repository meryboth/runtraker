"use client";

import { useEffect, useRef, useState } from "react";
import { pad } from "@/lib/dates";
import { fmtPace } from "@/lib/format";
import { PLACES, type DayEntry, type Place, type RunDB } from "@/lib/types";

type Props = {
  dayKey: string | null;
  db: RunDB;
  /** Cuando pasa a true (o cambia el día) se cargan los valores guardados o el borrador. */
  active: boolean;
  presetRan?: boolean;
  onSave: (key: string, entry: DayEntry) => void;
  onDelete?: (key: string) => void;
  onCancel?: () => void;
};

const digits = (v: string, max: number) => v.replace(/\D/g, "").slice(0, max);

/* Borrador: lo que escribiste sobrevive si se cierra el formulario o la página se recarga. */
const DRAFT_KEY = "runtrack.draft";
type Draft = { key: string; ran: boolean; km: string; min: string; sec: string; place?: Place };

function readDraft(): Draft | null {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_KEY) || "null") as Draft | null;
  } catch {
    return null;
  }
}

function writeDraft(d: Draft) {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify(d)); } catch { /* sin almacenamiento */ }
}

export function clearDraft() {
  try { localStorage.removeItem(DRAFT_KEY); } catch { /* sin almacenamiento */ }
}

/** Formulario de un día: ¿corriste?, dónde, distancia y tiempo. Lo usan la hoja y la tarjeta de hoy. */
export function DayForm({ dayKey, db, active, presetRan, onSave, onDelete, onCancel }: Props) {
  const [ran, setRan] = useState(true);
  const [km, setKm] = useState("");
  const [min, setMin] = useState("");
  const [sec, setSec] = useState("");
  const [place, setPlace] = useState<Place>("outdoor");
  const [shake, setShake] = useState(false);
  const minRef = useRef<HTMLInputElement>(null);
  const secRef = useRef<HTMLInputElement>(null);

  /** Cambia un campo y guarda el borrador. */
  function edit(patch: Partial<Omit<Draft, "key">>) {
    if (!dayKey) return;
    if (patch.ran !== undefined) setRan(patch.ran);
    if (patch.km !== undefined) setKm(patch.km);
    if (patch.min !== undefined) setMin(patch.min);
    if (patch.sec !== undefined) setSec(patch.sec);
    if (patch.place !== undefined) setPlace(patch.place);
    writeDraft({ key: dayKey, ran, km, min, sec, place, ...patch });
  }

  useEffect(() => {
    if (!active || !dayKey) return;
    const draft = readDraft();
    if (draft?.key === dayKey) {
      setRan(draft.ran); setKm(draft.km); setMin(draft.min); setSec(draft.sec); setPlace(draft.place ?? "outdoor");
      return;
    }
    const e = db[dayKey];
    setRan(presetRan ?? (e ? e.ran : true));
    if (e?.ran) {
      setKm(String(e.km).replace(".", ","));
      setMin(e.sec ? String(Math.floor(e.sec / 60)) : "");
      setSec(e.sec ? pad(e.sec % 60) : "");
      setPlace(e.place ?? "outdoor");
    } else {
      setKm(""); setMin(""); setSec(""); setPlace("outdoor");
    }
    // solo al activarse o cambiar de día
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, dayKey]);

  const kmNum = parseFloat(km.replace(",", "."));
  const totalSec = (parseInt(min || "0", 10) || 0) * 60 + Math.min(parseInt(sec || "0", 10) || 0, 59);
  const pace = kmNum > 0 && totalSec > 0 ? totalSec / kmNum : null;
  const exists = !!(dayKey && db[dayKey]);

  function save() {
    if (!dayKey) return;
    if (!ran) {
      clearDraft();
      return onSave(dayKey, { ran: false });
    }
    if (!(kmNum > 0)) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    clearDraft();
    onSave(dayKey, { ran: true, km: Math.round(kmNum * 100) / 100, sec: totalSec, place });
  }

  return (
    <div className="day-form">
      <div className="choice">
        <button className={`btn pill${ran ? " on" : ""}`} data-ran="1" onClick={() => edit({ ran: true })}>sí, corrí</button>
        <button className={`btn pill${!ran ? " on" : ""}`} data-ran="0" onClick={() => edit({ ran: false })}>no corrí</button>
      </div>

      <div className="fields" hidden={!ran}>
        <div className="field field--place">
          <span className="field-label">dónde</span>
          <span className="place-choice" role="radiogroup" aria-label="dónde corriste">
            {(Object.keys(PLACES) as Place[]).map((p) => (
              <button
                key={p}
                type="button"
                role="radio"
                aria-checked={place === p}
                className={`place-pill${place === p ? " on" : ""}`}
                onClick={() => edit({ place: p })}
              >
                <span className="place-emoji" aria-hidden="true">{PLACES[p].emoji}</span>
                {PLACES[p].label}
              </button>
            ))}
          </span>
        </div>
        <label className={`field${shake ? " shake" : ""}`}>
          <span className="field-label">distancia</span>
          <span className="field-input">
            <input
              className="in-km" inputMode="decimal" enterKeyHint="next" autoComplete="off" placeholder="0,0"
              value={km} onChange={(e) => edit({ km: e.target.value.replace(/[^\d.,]/g, "").slice(0, 6) })}
              onKeyDown={(e) => e.key === "Enter" && minRef.current?.focus()}
            />
            <em>km</em>
          </span>
        </label>
        <div className="field">
          <span className="field-label">tiempo</span>
          <span className="field-input">
            <input className="in-min" ref={minRef} inputMode="numeric" enterKeyHint="next" autoComplete="off" placeholder="00" aria-label="minutos"
              value={min} onChange={(e) => edit({ min: digits(e.target.value, 3) })} onKeyDown={(e) => e.key === "Enter" && secRef.current?.focus()} />
            <em>min</em>
            <input className="in-sec" ref={secRef} inputMode="numeric" enterKeyHint="done" autoComplete="off" placeholder="00" aria-label="segundos"
              value={sec} onChange={(e) => edit({ sec: digits(e.target.value, 2) })} onKeyDown={(e) => e.key === "Enter" && save()} />
            <em>seg</em>
          </span>
        </div>
        <p className="pace-preview">{pace ? `≈ ${fmtPace(pace)} el km` : shake ? "falta la distancia ↑" : ""}</p>
      </div>

      <div className="sheet-actions">
        <button className="btn btn--primary" onClick={save}>guardar</button>
        {onCancel && <button className="link" onClick={onCancel}>cancelar</button>}
        {exists && dayKey && onDelete && (
          <button className="link link--danger" onClick={() => { clearDraft(); onDelete(dayKey); }}>borrar este día</button>
        )}
      </div>
    </div>
  );
}
