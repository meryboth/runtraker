import { DAYS, DAYS_SHORT, fromKey, shortDate } from "@/lib/dates";
import { fmtKm, fmtLong, fmtPace, plural } from "@/lib/format";
import { PATHS } from "@/lib/hand";
import type { Stats } from "@/lib/stats";
import { PLACES } from "@/lib/types";
import { Arrow } from "./Hand";

export function Numbers({ s, onDemo }: { s: Stats; onDemo: () => void }) {
  if (!s.runs) {
    return (
      <div className="empty">
        <p className="note">acá van a aparecer tus números <Arrow d={PATHS.arrowDown} /></p>
        <h1 className="h1">todavía no<br />corriste nada</h1>
        <p className="muted">Anotá tu primera corrida desde <b>hoy</b>, o mirá cómo se ve con datos de ejemplo.</p>
        <button className="btn" onClick={onDemo}>probar con datos de ejemplo</button>
      </div>
    );
  }

  const pct = Math.round((s.runs / s.days) * 100);
  const withData = s.weekday.map((w, i) => ({ ...w, i, pct: w.total ? w.ran / w.total : 0 })).filter((w) => w.total > 0);
  const best = withData.reduce((a, b) => (b.pct > a.pct ? b : a), withData[0]);
  const worst = withData.reduce((a, b) => (b.pct < a.pct ? b : a), withData[0]);

  return (
    <div className="num-grid">
      <div className="area-story">
      <p className="note">desde el {shortDate(fromKey(s.first!))} hasta hoy <Arrow d={PATHS.arrowDown} /></p>
      <p className="story">
        Corriste{" "}
        <span className="hl hl-g anno" data-anno={`el ${pct}%`}>{s.runs} de {s.days} días</span>.
        {" "}Sumaste <span className="hl hl-y">{fmtKm(Math.round(s.km * 10) / 10)} km</span> en{" "}
        <span className="hl hl-b">{fmtLong(s.sec)}</span>.
        {s.avgPace && <> Tu ritmo promedio es <span className="hl hl-o">{fmtPace(s.avgPace)} min/km</span>.</>}
        {" "}
        {s.streak
          ? <>Llevás <span className="hl hl-p">{s.streak} {plural(s.streak, "día", "días")} seguidos</span>.</>
          : <>Hoy puede empezar una <span className="wavy">racha nueva</span>.</>}
      </p>
      </div>

      <div className="tiles area-tiles">
        <Tile label="mejor racha" value={`${s.bestStreak}`} unit={plural(s.bestStreak, "día", "días")} sub={s.bestStreak === s.streak && s.streak > 0 ? "¡es esta!" : `ahora: ${s.streak}`} />
        <Tile label="la más larga" value={fmtKm(s.longest!.km)} unit="km" sub={shortDate(fromKey(s.longest!.key))} />
        <Tile label="mejor ritmo" value={s.bestPace ? fmtPace(s.bestPace.pace) : "—"} unit="min/km" sub={s.bestPace ? shortDate(fromKey(s.bestPace.key)) : "cargá tiempos"} />
        <Tile label="promedio" value={fmtKm(Math.round((s.km / s.runs) * 10) / 10)} unit="km" sub="por salida" />
      </div>

      <div className="block area-wd">
        <h2 className="h2">qué días corrés (y cuáles no)</h2>
        <div className="wd-list">
          {s.weekday.map((w, i) => (
            <div className="wd-row" key={i}>
              <span className="wd-name">
                {i === best?.i && best.ran > 0 && <span className="star">★</span>}
                {DAYS_SHORT[i]}
              </span>
              <span className="bar">
                <span className="bar-ran" style={{ width: `${w.total ? (w.ran / w.total) * 100 : 0}%` }} />
                <span className="bar-rest" style={{ width: `${w.total ? (w.rest / w.total) * 100 : 0}%` }} />
              </span>
              <span className="wd-count">{w.ran} sí · {w.total - w.ran} no</span>
            </div>
          ))}
        </div>
        <div className="wd-legend">
          <span><i className="k-ran" />corrí</span>
          <span><i className="k-rest" />no corrí</span>
          <span><i />sin anotar</span>
        </div>
        {best && worst && best.i !== worst.i && (
          <p className="story story--sm">
            Tu día más fiel es el <span className="hl hl-g">{DAYS[best.i]}</span>{" "}
            <span className="muted">({best.ran} de {best.total})</span>. El que más se te escapa es el{" "}
            <span className="hl hl-p">{DAYS[worst.i]}</span> <span className="muted">({worst.ran} de {worst.total})</span>.
          </p>
        )}
      </div>

      <div className="area-places">
        <Places s={s} />
      </div>
    </div>
  );
}

/** Afuera vs. adentro: una barra partida con los emojis como indicador. */
function Places({ s }: { s: Stats }) {
  const { outdoor, indoor, unknown } = s.places;
  const marked = outdoor.runs + indoor.runs;
  const pctOut = marked ? Math.round((outdoor.runs / marked) * 100) : 0;

  return (
    <div className="places">
      <h2 className="h2">dónde corrés</h2>
      {marked === 0 ? (
        <p className="muted places-empty">Cuando cargues una corrida, marcá si fue {PLACES.outdoor.emoji} afuera o {PLACES.indoor.emoji} adentro.</p>
      ) : (
        <>
          <div className="place-bar" aria-label={`${pctOut}% afuera`}>
            {outdoor.runs > 0 && <span className="place-bar-out" style={{ flexGrow: outdoor.runs }}>{PLACES.outdoor.emoji}</span>}
            {indoor.runs > 0 && <span className="place-bar-in" style={{ flexGrow: indoor.runs }}>{PLACES.indoor.emoji}</span>}
          </div>
          <div className="place-legend">
            <span>
              <b>{PLACES.outdoor.emoji} {outdoor.runs}</b> {plural(outdoor.runs, "vez", "veces")} afuera · {fmtKm(Math.round(outdoor.km))} km
            </span>
            <span>
              <b>{PLACES.indoor.emoji} {indoor.runs}</b> adentro · {fmtKm(Math.round(indoor.km))} km
            </span>
          </div>
          {unknown > 0 && <p className="tile-sub places-unknown">{unknown} {plural(unknown, "corrida", "corridas")} sin marcar</p>}
        </>
      )}
    </div>
  );
}

function Tile({ label, value, unit, sub }: { label: string; value: string; unit: string; sub: string }) {
  return (
    <div className="tile">
      <div className="tile-label">{label}</div>
      <div className="tile-value">{value}<small>{unit}</small></div>
      <div className="tile-sub">{sub}</div>
    </div>
  );
}
