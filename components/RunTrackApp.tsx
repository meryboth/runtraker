"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DAYS, MONTHS_SHORT, dow, keyOf, startOfToday } from "@/lib/dates";
import { computeStats, demoData } from "@/lib/stats";
import type { DayEntry } from "@/lib/types";
import { useRuns } from "@/lib/useRuns";
import { AccountSheet, CloudBadge } from "./Account";
import { Board, BoardLegend } from "./Board";
import { DaySheet } from "./DaySheet";
import { RoughFilters } from "./Hand";
import { History } from "./History";
import { Minis } from "./Minis";
import { Numbers } from "./Numbers";
import { QuoteCard } from "./QuoteCard";
import { Tabs, type View } from "./Tabs";
import { TodayPanel } from "./TodayPanel";
import { WeekStrip } from "./WeekStrip";

type SheetState = { key: string; ran?: boolean; pickDate?: boolean };

const RAN_TOASTS = ["bien ahí ✓", "un cuadradito más en verde", "sumado ✓"];

export default function RunTrackApp() {
  const { db, ready, setDay, removeDay, replaceAll, cloud } = useRuns();
  const [today, setToday] = useState<Date | null>(null);
  const [view, setView] = useState<View>("hoy");
  const [sheet, setSheet] = useState<SheetState | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [toast, setToast] = useState({ msg: "", show: false });
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const viewsRef = useRef<HTMLDivElement>(null);

  // "hoy" se calcula en el cliente (y se refresca si la app vuelve de fondo)
  useEffect(() => {
    const refresh = () => setToday(startOfToday());
    refresh();
    document.addEventListener("visibilitychange", refresh);
    return () => document.removeEventListener("visibilitychange", refresh);
  }, []);

  const showToast = useCallback((msg: string) => {
    clearTimeout(toastTimer.current);
    setToast({ msg, show: true });
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), 1900);
  }, []);

  // Si el link del mail falló (vencido, ya usado…), Supabase vuelve con #error=… en la URL.
  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    if (!hash.get("error")) return;
    const expired = hash.get("error_code") === "otp_expired";
    showToast(expired ? "el link venció, pedí otro" : "el link no funcionó, pedí otro");
    setAccountOpen(true);
    window.history.replaceState(null, "", window.location.pathname);
  }, [showToast]);

  const openDay = useCallback((key: string, opts: Omit<SheetState, "key"> = {}) => {
    setSheet({ key, ...opts });
    setSheetOpen(true);
  }, []);

  const closeSheet = useCallback(() => {
    setSheetOpen(false);
    setAccountOpen(false);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeSheet();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeSheet]);

  const stats = useMemo(() => (today ? computeStats(db, today) : null), [db, today]);

  if (!ready || !today || !stats) {
    return (
      <div className="stage">
        <main className="phone" />
      </div>
    );
  }

  const tk = keyOf(today);

  const save = (key: string, entry: DayEntry) => {
    setDay(key, entry);
    closeSheet();
    showToast(entry.ran ? RAN_TOASTS[Math.floor(Math.random() * RAN_TOASTS.length)] : "descansar también cuenta");
  };

  const deleteDay = (key: string) => {
    removeDay(key);
    closeSheet();
    showToast("borrado");
  };

  const loadDemo = () => {
    if (Object.keys(db).length && !confirm("Esto reemplaza lo que anotaste por datos de ejemplo. ¿Seguimos?")) return;
    replaceAll(demoData(today));
    showToast("listo, datos de ejemplo");
  };

  const wipe = () => {
    if (!confirm("¿Borrar todos los días anotados? No se puede deshacer.")) return;
    replaceAll({});
    showToast("hoja en blanco");
  };

  const changeView = (v: View) => {
    setView(v);
    viewsRef.current?.scrollTo({ top: 0 });
    window.scrollTo({ top: 0 });
  };

  const ranThisYear = Object.keys(db).filter((k) => k.startsWith(String(today.getFullYear())) && db[k].ran).length;

  return (
    <div className="stage">
      <RoughFilters />
      <main className="phone">
        <header className="top">
          <span className="brand">runtrack<span className="dot">.</span></span>
          <span className="top-date">{DAYS[dow(today)]} {today.getDate()} {MONTHS_SHORT[today.getMonth()]}</span>
          <CloudBadge cloud={cloud} onClick={() => setAccountOpen(true)} />
        </header>

        <div className="views" ref={viewsRef}>
          {view === "hoy" && (
            <section className="view is-active view-hoy">
              <div className="area-today">
                <TodayPanel dayKey={tk} db={db} onSave={save} onDelete={deleteDay} />
              </div>

              <div className="block area-week">
                <h2 className="h2">esta semana</h2>
                <WeekStrip db={db} today={today} onOpen={openDay} />
              </div>

              <div className="block area-board">
                <div className="h2-row">
                  <h2 className="h2">el tablero</h2>
                  <span className="note note--sm">
                    {ranThisYear ? `${ranThisYear} ${ranThisYear === 1 ? "día" : "días"} en verde este año` : "tocá un cuadradito ↓"}
                  </span>
                </div>
                <Board db={db} today={today} onOpen={openDay} />
                <BoardLegend />
              </div>

              <div className="area-minis"><Minis s={stats} /></div>
              <QuoteCard />
            </section>
          )}

          {view === "numeros" && (
            <section className="view is-active view-numeros">
              <Numbers s={stats} onDemo={loadDemo} />
            </section>
          )}

          {view === "historial" && (
            <section className="view is-active view-historial">
              <History
                db={db}
                today={today}
                onOpen={openDay}
                onDemo={loadDemo}
                onWipe={wipe}
              />
            </section>
          )}
        </div>

        <Tabs view={view} onChange={changeView} />

        <DaySheet
          open={sheetOpen}
          dayKey={sheet?.key ?? null}
          presetRan={sheet?.ran}
          pickDate={sheet?.pickDate}
          db={db}
          today={today}
          onClose={closeSheet}
          onSave={save}
          onDelete={deleteDay}
          onPickDate={(k) => setSheet((s) => ({ ...s, key: k, ran: undefined }))}
        />

        <AccountSheet open={accountOpen} cloud={cloud} onClose={() => setAccountOpen(false)} />

        <div className={`toast${toast.show ? " show" : ""}`} role="status" aria-live="polite">{toast.msg}</div>
      </main>
    </div>
  );
}

