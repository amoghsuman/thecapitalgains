"use client";

import { useState } from "react";

type Flashcard = { term?: string; definition?: string };

export type FlashcardSetValue = { title?: string; cards?: Flashcard[] };

function Flashcard({ card }: { card: Flashcard }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <button
      onClick={() => setFlipped((f) => !f)}
      className="text-left border border-hairline border-l-4 border-l-gold rounded-xl bg-panel p-5 min-h-[120px] flex flex-col justify-center hover:border-gold transition-colors"
      style={{ perspective: "800px" }}
    >
      {flipped ? (
        <>
          <div className="font-mono text-[9px] text-ink-dim tracking-widest uppercase mb-2">Definition</div>
          <div className="text-[14px] text-ink-dim leading-relaxed">{card.definition}</div>
        </>
      ) : (
        <>
          <div className="font-mono text-[9px] text-ink-dim tracking-widest uppercase mb-2">Term</div>
          <div className="text-[18px] font-bold text-ink">{card.term}</div>
        </>
      )}
      <div className="font-mono text-[10px] text-ink-dim/60 mt-3">Tap to flip</div>
    </button>
  );
}

export default function FlashcardSetBlock({ value }: { value: FlashcardSetValue }) {
  const cards = value.cards ?? [];

  return (
    <div className="mt-8">
      {value.title && <p className="font-mono text-[11px] text-ink-dim uppercase tracking-wide mb-3">{value.title}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {cards.map((card, i) => (
          <Flashcard key={i} card={card} />
        ))}
      </div>
    </div>
  );
}
