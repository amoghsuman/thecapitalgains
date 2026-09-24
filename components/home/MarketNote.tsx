"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useMarketSnapshot } from "@/lib/market/useMarketSnapshot";
import { buildMarketNote } from "@/lib/market/marketNote";

interface MarketNoteProps {
  /** slug → title for the courses the tips can link to (from getAllCourses()). */
  courseTitles: Record<string, string>;
}

// Rendered inside the sentiment card under the gauge. Everything comes from
// lib/market/marketNote.ts and the live snapshot; before hydration or when
// the feed is down there is nothing to say, so nothing is rendered.
export default function MarketNote({ courseTitles }: MarketNoteProps) {
  const market = useMarketSnapshot();
  const note = useMemo(
    () => (market.status === "ready" ? buildMarketNote(market.data, courseTitles) : null),
    [market, courseTitles]
  );
  if (!note) return null;

  return (
    <div className="mt-4 pt-4 border-t border-hairline space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <div className="font-mono text-[10px] text-gold tracking-widest uppercase font-bold">Market note</div>
        {note.asOf && <div className="font-mono text-[10px] text-ink-dim whitespace-nowrap">{note.asOf}</div>}
      </div>

      <p className="text-sm text-ink leading-relaxed">{note.sentence}</p>

      <div className="p-2.5 rounded-xl bg-forest/5 border border-forest/15 text-[11px] text-[#2c3731] leading-relaxed">
        <span className="font-bold text-forest uppercase font-mono mr-1">Tip:</span>
        {note.tip.text}
      </div>

      <Link
        href={note.cta.href}
        className="inline-flex items-center text-xs font-bold text-forest hover:text-forest-dark hover:underline underline-offset-2"
      >
        {note.cta.label}
      </Link>

      <p className="text-[10px] font-mono text-ink-dim leading-relaxed">
        Observations from delayed market data. Educational, not advice.
      </p>
    </div>
  );
}
