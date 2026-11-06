import type { RunDB } from "./types";

/**
 * Combina los días de este dispositivo con los de la nube.
 * - Un día que está solo acá se conserva y se marca para subir.
 * - Un día que está en los dos: gana la nube.
 * Nunca se pierde un día local por iniciar sesión.
 */
export function mergeDays(local: RunDB, remote: RunDB): { merged: RunDB; onlyLocal: RunDB } {
  const onlyLocal: RunDB = {};
  for (const [k, e] of Object.entries(local)) if (!(k in remote)) onlyLocal[k] = e;
  return { merged: { ...local, ...remote }, onlyLocal };
}
