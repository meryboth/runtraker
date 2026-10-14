import { fmtKm, plural } from "@/lib/format";
import type { Stats } from "@/lib/stats";

export function Minis({ s }: { s: Stats }) {
  const diff = s.weekKm - s.lastWeekKm;
  return (
    <div className="minis">
      <div className="tile">
        <div className="tile-label">racha</div>
        <div className="tile-value">{s.streak}<small>{plural(s.streak, "día", "días")}</small></div>
        <div className="tile-sub">{s.streak ? "seguí así" : "arrancá hoy"}</div>
      </div>
      <div className="tile">
        <div className="tile-label">semana</div>
        <div className="tile-value">{fmtKm(Math.round(s.weekKm * 10) / 10)}<small>km</small></div>
        <div className="tile-sub">
          {s.lastWeekKm === 0 ? `${s.weekRuns} ${plural(s.weekRuns, "salida", "salidas")}` : `${diff >= 0 ? "+" : ""}${fmtKm(Math.round(diff))} km vs. ant.`}
        </div>
      </div>
      <div className="tile">
        <div className="tile-label">este mes</div>
        <div className="tile-value">{s.monthRuns}<small>{plural(s.monthRuns, "vez", "veces")}</small></div>
        <div className="tile-sub">corriste</div>
      </div>
    </div>
  );
}
