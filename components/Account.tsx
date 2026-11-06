"use client";

import { useState } from "react";
import type { Cloud } from "@/lib/useRuns";

const SYNC_LABEL: Record<Cloud["sync"], string> = {
  off: "",
  local: "Iniciar sesión",
  loading: "guardando…",
  ok: "en la nube ✓",
  error: "sin conexión",
};

/** Botoncito del header: estado de la sincronización. */
export function CloudBadge({ cloud, onClick }: { cloud: Cloud; onClick: () => void }) {
  if (!cloud.enabled) return null;
  return (
    <button
      className={`cloud-badge is-${cloud.sync}`}
      onClick={onClick}
      title={cloud.email ?? "iniciá sesión para ver tus días en todos tus dispositivos"}
      aria-label={cloud.email ? `cuenta: ${cloud.email}` : "iniciar sesión"}
    >
      <svg viewBox="0 0 28 20" aria-hidden="true">
        <path d="M7.5 17.2c-3 .1-5.2-1.8-5.1-4.4.1-2.3 2-4 4.4-3.9.5-3.6 3.4-6.2 7-6.1 3.2.1 5.7 2.3 6.3 5.3 2.7-.2 5 1.7 5.1 4.3.1 2.6-2 4.7-4.8 4.8-4.3.1-8.6 0-12.9 0z" />
      </svg>
      <span>{SYNC_LABEL[cloud.sync]}</span>
    </button>
  );
}

const isEmail = (v: string) => /^\S+@\S+\.\S+$/.test(v.trim());

type Mode = "password" | "code";

/** Hoja de cuenta: entrar con contraseña o con código por mail; con sesión, crear contraseña o salir. */
export function AccountSheet({ open, cloud, onClose }: { open: boolean; cloud: Cloud; onClose: () => void }) {
  return (
    <>
      <div className={`backdrop${open ? " open" : ""}`} onClick={onClose} />
      <div className={`sheet${open ? " open" : ""}`} role="dialog" aria-modal="true" aria-hidden={!open} aria-labelledby="accountTitle">
        <div className="grip" />
        {cloud.email ? <SignedIn cloud={cloud} onClose={onClose} /> : <SignIn cloud={cloud} />}
      </div>
    </>
  );
}

function SignIn({ cloud }: { cloud: Cloud }) {
  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function run(fn: () => Promise<{ error: string | null }>) {
    setBusy(true);
    setError("");
    const { error } = await fn();
    setBusy(false);
    if (error) setError(error);
    return !error;
  }

  async function submit() {
    if (!isEmail(email)) return setError("Ese mail no parece válido.");
    const mail = email.trim();
    if (mode === "password") {
      if (!password) return setError("Escribí tu contraseña.");
      await run(() => cloud.signInWithPassword(mail, password));
    } else if (!codeSent) {
      if (await run(() => cloud.sendCode(mail))) setCodeSent(true);
    } else {
      if (code.replace(/\D/g, "").length < 6) return setError("El código tiene 6 números.");
      await run(() => cloud.verifyCode(mail, code.replace(/\D/g, "")));
    }
  }

  const onEnter = (e: React.KeyboardEvent) => e.key === "Enter" && submit();
  const switchMode = (m: Mode) => { setMode(m); setError(""); setCodeSent(false); setCode(""); };

  const cta = busy
    ? "un segundo…"
    : mode === "password" ? "Entrar" : codeSent ? "Entrar con el código" : "Mandarme el código";

  return (
    <>
      <p className="note">tus km en el celu y en la compu</p>
      <h2 className="h1 sheet-title" id="accountTitle">Iniciar sesión</h2>

      <div className="choice auth-modes" role="tablist">
        <button role="tab" aria-selected={mode === "password"} className={`btn pill${mode === "password" ? " on" : ""}`} onClick={() => switchMode("password")}>Contraseña</button>
        <button role="tab" aria-selected={mode === "code"} className={`btn pill${mode === "code" ? " on" : ""}`} onClick={() => switchMode("code")}>Código por mail</button>
      </div>

      <label className="text-field">
        <span>tu mail</span>
        <input
          type="email" inputMode="email" autoComplete="email" placeholder="vos@mail.com"
          value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} onKeyDown={onEnter}
          disabled={mode === "code" && codeSent}
        />
      </label>

      {mode === "password" && (
        <label className="text-field">
          <span>contraseña</span>
          <input
            type="password" autoComplete="current-password" placeholder="••••••"
            value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} onKeyDown={onEnter}
          />
        </label>
      )}

      {mode === "code" && codeSent && (
        <>
          <p className="account-text auth-hint">
            Te mandamos un código a <b>{email.trim()}</b>. Escribilo acá, en este navegador.
          </p>
          <label className="text-field">
            <span>código de 6 números</span>
            <input
              className="code-input" inputMode="numeric" autoComplete="one-time-code" placeholder="000000" maxLength={6}
              value={code} onChange={(e) => { setCode(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }} onKeyDown={onEnter}
            />
          </label>
        </>
      )}

      {mode === "password" && (
        <p className="account-text auth-hint">¿Todavía no tenés contraseña? Entrá con <button className="link" onClick={() => switchMode("code")}>código por mail</button> y creala desde tu cuenta.</p>
      )}

      <p className="auth-error" role="alert">{error}</p>

      <div className="sheet-actions">
        <button className="btn btn--primary" onClick={submit} disabled={busy}>{cta}</button>
        {mode === "code" && codeSent && (
          <button className="link" onClick={() => { setCodeSent(false); setCode(""); setError(""); }}>Cambiar el mail o pedir otro código</button>
        )}
      </div>
    </>
  );
}

function SignedIn({ cloud, onClose }: { cloud: Cloud; onClose: () => void }) {
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function savePassword() {
    if (pw.length < 6) return setMsg({ ok: false, text: "La contraseña tiene que tener al menos 6 caracteres." });
    setBusy(true);
    const { error } = await cloud.setPassword(pw);
    setBusy(false);
    setMsg(error ? { ok: false, text: error } : { ok: true, text: "Listo. Ya podés entrar con tu mail y esta contraseña desde cualquier dispositivo." });
    if (!error) setPw("");
  }

  return (
    <>
      <p className="note">{SYNC_LABEL[cloud.sync]}</p>
      <h2 className="h1 sheet-title" id="accountTitle">Tu cuenta</h2>
      <p className="account-text">
        Tus días se guardan en la nube con <b>{cloud.email}</b>. Entrá con el mismo mail desde el celu o la compu y vas a ver lo mismo.
      </p>
      {cloud.sync === "error" && cloud.syncError && <p className="sync-error">{cloud.syncError}</p>}

      <label className="text-field">
        <span>crear o cambiar tu contraseña</span>
        <input
          type="password" autoComplete="new-password" placeholder="mínimo 6 caracteres"
          value={pw} onChange={(e) => { setPw(e.target.value); setMsg(null); }} onKeyDown={(e) => e.key === "Enter" && savePassword()}
        />
      </label>
      <p className={msg?.ok ? "auth-ok" : "auth-error"} role="status">{msg?.text ?? ""}</p>

      <div className="sheet-actions">
        <button className="btn btn--primary" onClick={savePassword} disabled={busy || !pw}>{busy ? "guardando…" : "Guardar contraseña"}</button>
        <button className="btn btn--ghost" onClick={onClose}>Listo</button>
        <button className="link link--danger" onClick={() => { cloud.signOut(); onClose(); }}>Cerrar sesión</button>
      </div>
    </>
  );
}
