"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { mergeDays } from "./merge";
import { TABLE, fromRows, supabase, toRow, toRows, type RunRow } from "./supabase";
import type { DayEntry, RunDB } from "./types";

const KEY = "runtrack.v1";

function read(): RunDB {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}") as RunDB;
  } catch {
    return {};
  }
}

function write(db: RunDB) {
  try {
    localStorage.setItem(KEY, JSON.stringify(db));
  } catch {
    /* sin almacenamiento: la app sigue andando en memoria */
  }
}

/** off = sin Supabase configurado · local = configurado pero sin sesión */
export type SyncState = "off" | "local" | "loading" | "ok" | "error";

/**
 * Store local-first: localStorage siempre; si hay sesión de Supabase,
 * cada cambio se replica en la tabla run_days. En iOS esto pasa a ser SwiftData + sync.
 */
export function useRuns() {
  const [db, setDb] = useState<RunDB>({});
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [sync, setSync] = useState<SyncState>(supabase ? "local" : "off");
  const userId = session?.user.id ?? null;

  useEffect(() => {
    setDb(read());
    setReady(true);
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  // Al iniciar sesión (y en cada carga con sesión): combinamos lo local con la nube.
  // Los días que solo están en este dispositivo se suben; si un día está en los dos, gana la nube.
  // Nunca se borra nada local por iniciar sesión.
  useEffect(() => {
    if (!supabase) return;
    if (!userId) { setSync("local"); return; }
    const sb = supabase;
    let cancelled = false;

    (async () => {
      setSync("loading");
      const { data, error } = await sb.from(TABLE).select("day, ran, km, sec, place");
      if (cancelled) return;
      if (error) { console.error(error); setSync("error"); return; }

      const local = read();
      const { merged, onlyLocal } = mergeDays(local, fromRows(data as RunRow[]));

      write(merged);
      setDb(merged);

      if (Object.keys(onlyLocal).length === 0) { setSync("ok"); return; }
      const { error: upErr } = await sb.from(TABLE).upsert(toRows(onlyLocal, userId));
      if (cancelled) return;
      if (upErr) console.error(upErr);
      setSync(upErr ? "error" : "ok");
    })();

    return () => { cancelled = true; };
  }, [userId]);

  const pushRemote = useCallback(
    async (op: () => PromiseLike<{ error: unknown }>) => {
      if (!supabase || !userId) return;
      setSync("loading");
      const { error } = await op();
      if (error) console.error(error);
      setSync(error ? "error" : "ok");
    },
    [userId],
  );

  const setDay = useCallback(
    (key: string, entry: DayEntry) => {
      setDb((prev) => {
        const next = { ...prev, [key]: entry };
        write(next);
        return next;
      });
      if (userId) pushRemote(() => supabase!.from(TABLE).upsert(toRow(key, entry, userId)));
    },
    [userId, pushRemote],
  );

  const removeDay = useCallback(
    (key: string) => {
      setDb((prev) => {
        const next = { ...prev };
        delete next[key];
        write(next);
        return next;
      });
      if (userId) pushRemote(() => supabase!.from(TABLE).delete().eq("day", key));
    },
    [userId, pushRemote],
  );

  const replaceAll = useCallback(
    (next: RunDB) => {
      write(next);
      setDb(next);
      if (userId) {
        pushRemote(async () => {
          const del = await supabase!.from(TABLE).delete().eq("user_id", userId);
          if (del.error || Object.keys(next).length === 0) return del;
          return supabase!.from(TABLE).insert(toRows(next, userId));
        });
      }
    },
    [userId, pushRemote],
  );

  const signIn = useCallback(async (email: string) => {
    if (!supabase) return { error: "Supabase no está configurado" };
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/` },
    });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase?.auth.signOut();
  }, []);

  return {
    db,
    ready,
    setDay,
    removeDay,
    replaceAll,
    cloud: {
      enabled: !!supabase,
      email: session?.user.email ?? null,
      sync,
      signIn,
      signOut,
    },
  };
}

export type Cloud = ReturnType<typeof useRuns>["cloud"];
