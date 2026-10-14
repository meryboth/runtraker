import { DAYS, DAYS_LETTER, addDays, dow, keyOf } from "@/lib/dates";
import { fmtKm } from "@/lib/format";
import { PATHS } from "@/lib/hand";
import { placeEmoji, type RunDB } from "@/lib/types";

type Props = { db: RunDB; today: Date; onOpen: (key: string) => void };

export function WeekStrip({ db, today, onOpen }: Props) {
  const monday = addDays(today, -dow(today));
  const tk = keyOf(today);

  return (
    <div className="week">
      {DAYS_LETTER.map((letter, i) => {
        const d = addDays(monday, i);
        const k = keyOf(d);
        const e = db[k];
        const future = d > today;
        const state = future ? "future" : e?.ran ? "ran" : e ? "rest" : "empty";
        return (
          <button
            key={k}
            className={`wd ${state}${k === tk ? " is-today" : ""}`}
            disabled={future}
            onClick={() => onOpen(k)}
            aria-label={`${DAYS[i]}${e ? (e.ran ? `, ${fmtKm(e.km)} km` : ", descanso") : ""}`}
          >
            <span className="wd-letter">{letter}</span>
            <svg viewBox="0 0 40 40" aria-hidden="true">
              <path className="blob" d={PATHS.blob} />
              <path className="ring" d={PATHS.ring} style={{ transform: `rotate(${i * 53}deg)`, transformOrigin: "20px 20px" }} />
              {state === "ran" && <path className="mark" d={PATHS.check} />}
              {state === "rest" && <path className="mark" d={PATHS.cross} />}
            </svg>
            <span className="wd-km">{e?.ran ? <>{fmtKm(e.km)} {placeEmoji(e)}</> : ""}</span>
          </button>
        );
      })}
    </div>
  );
}
