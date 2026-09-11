// Returns the first `maxSentences` complete sentences of `text`, never
// cutting mid-sentence. Course descriptions in Sanity are already full
// paragraphs (not pre-truncated), so this is about picking a card-sized
// excerpt from real content, not clamping/ellipsis-ing it.
//
// Splits (not matches) on a terminator immediately followed by whitespace —
// `.split` keeps every character of the source, so a stray mid-word period
// (e.g. "screener.in" — a site name with no space after its dot) is simply
// never a split point, instead of being misread as a sentence boundary and
// silently dropping everything before it (the failure mode a match-based
// regex has here: it finds the next *valid* boundary and discards whatever
// came before it, since match() only returns matched substrings).
export function firstSentences(text: string, maxSentences = 2): string {
  const sentences = text.trim().split(/(?<=[.!?])\s+/);
  return sentences.slice(0, maxSentences).join(" ").trim();
}
