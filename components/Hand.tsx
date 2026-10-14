/** Filtros SVG que "tiemblan" los bordes, como trazados con lapicera. */
export function RoughFilters() {
  return (
    <svg className="defs" aria-hidden="true" focusable="false">
      <filter id="rough" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={2} seed={7} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={3.2} xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <filter id="rough-soft" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves={2} seed={3} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={1.6} xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
}

export function Arrow({ d }: { d: string }) {
  return (
    <svg className="arrow" viewBox="0 0 30 20" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}
