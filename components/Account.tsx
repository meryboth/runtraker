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

/** Hoja de cuenta: login con link mágico por mail, o cerrar sesión. */
export function AccountSheet({ open, cloud, onClose }: { open: boolean; cloud: Cloud; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function send() {
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setStatus("error");
      setError("ese mail no parece válido");
      return;
    }
    setStatus("sending");
    const { error } = await cloud.signIn(email.trim());
    if (error) {
      setStatus("error");
      setError(error);
    } else {
      setStatus("sent");
    }
  }

  return (
    <>
      <div className={`backdrop${open ? " open" : ""}`} onClick={onClose} />
      <div className={`sheet${open ? " open" : ""}`} role="dialog" aria-modal="true" aria-hidden={!open} aria-labelledby="accountTitle">
        <div className="grip" />
        {cloud.email ? (
          <>
            <p className="note">{SYNC_LABEL[cloud.sync]}</p>
            <h2 className="h1 sheet-title" id="accountTitle">tu cuenta</h2>
            <p className="account-text">
              Tus días se guardan en la nube con <span className="hl hl-g">{cloud.email}</span>. Entrá con el mismo mail
              desde el celu o la compu y vas a ver lo mismo.
            </p>
            {cloud.sync === "error" && (
              <>
                <p className="account-text muted">Hubo un problema con la nube. Lo que anotes queda guardado acá igual.</p>
                {cloud.syncError && <p className="sync-error">{cloud.syncError}</p>}
              </>
            )}
            <div className="sheet-actions">
              <button className="btn" onClick={onClose}>listo</button>
              <button className="link link--danger" onClick={() => { cloud.signOut(); onClose(); }}>cerrar sesión</button>
            </div>
          </>
        ) : (
          <>
            <p className="note">tus km en el celu y en la compu</p>
            <h2 className="h1 sheet-title" id="accountTitle">Iniciar sesión</h2>
            {status === "sent" ? (
              <p className="account-text">
                Listo, te mandamos un link a <span className="hl hl-y">{email}</span>. Abrilo en este mismo navegador y
                quedás adentro. Lo que ya anotaste se sube solo.
              </p>
            ) : (
              <>
                <p className="account-text">Poné tu mail y te mandamos un link para entrar, sin contraseña. Usá el mismo mail en todos tus dispositivos y vas a ver los mismos días.</p>
                <label className="text-field">
                  <span>tu mail</span>
                  <input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="vos@mail.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setStatus("idle"); }}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                  />
                </label>
                <p className="pace-preview">{status === "error" ? error : ""}</p>
              </>
            )}
            <div className="sheet-actions">
              {status === "sent" ? (
                <button className="btn" onClick={onClose}>dale</button>
              ) : (
                <button className="btn btn--primary" onClick={send} disabled={status === "sending"}>
                  {status === "sending" ? "mandando…" : "mandarme el link"}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
