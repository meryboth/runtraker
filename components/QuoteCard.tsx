"use client";

import { useState } from "react";
import { QUOTES, randomQuoteIndex } from "@/lib/hand";

/** Una frase de un libro de running al azar; tocándola cambia. */
export function QuoteCard() {
  const [i, setI] = useState(() => randomQuoteIndex());
  const q = QUOTES[i];

  return (
    <figure className="quote">
      <button className="quote-btn" onClick={() => setI((cur) => randomQuoteIndex(cur))} title="otra frase">
        <blockquote>“{q.text}”</blockquote>
        <figcaption>
          — {q.author}, <cite>{q.book}</cite>
        </figcaption>
      </button>
    </figure>
  );
}
