export type View = "hoy" | "numeros" | "historial";

const TABS: { id: View; label: string; icon: React.ReactNode }[] = [
  {
    id: "hoy",
    label: "hoy",
    icon: (
      <>
        <path d="M4.5 21.5c3-.6 6.2-.4 9.4.2 2.4.5 4.6.3 7-.6 1.6-.6 2.6-1.8 2.4-3.1-.2-1.1-1.4-1.6-3-1.8l-4.1-.5-2.6-5.4c-.5-1-1.6-1.3-2.4-.6L9 11.6 6.6 9.4" />
        <path d="M13.2 12.4l-2.6 2.4M15.1 15.6l-2.2 1.6" />
      </>
    ),
  },
  {
    id: "numeros",
    label: "números",
    icon: (
      <>
        <path d="M5 23.2c6-.3 12-.1 18.4.2" />
        <path d="M7.4 22.6l.2-7.4h3.4l-.1 7.2M12.6 22.5l.1-12.3h3.5l-.2 12.2M17.9 22.6l.2-16.8 3.3.1-.1 16.6" />
      </>
    ),
  },
  {
    id: "historial",
    label: "historial",
    icon: (
      <>
        <path d="M9.5 8.2c4.4-.3 9-.2 13.6.1M9.6 14.1c4.2-.2 8.6 0 13.2.1M9.4 20c4.4-.2 8.8-.1 13.4.2" />
        <path d="M4.6 8.1l.6.1M4.7 14l.6.1M4.6 19.9l.6.1" />
      </>
    ),
  },
];

export function Tabs({ view, onChange }: { view: View; onChange: (v: View) => void }) {
  return (
    <nav className="tabs" aria-label="secciones">
      {TABS.map((t) => (
        <button
          key={t.id}
          className={`tab${view === t.id ? " is-active" : ""}`}
          aria-current={view === t.id ? "page" : undefined}
          onClick={() => onChange(t.id)}
        >
          <svg viewBox="0 0 28 28" aria-hidden="true">{t.icon}</svg>
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
