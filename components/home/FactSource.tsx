import { provenance, type MarketFact } from "@/lib/home/marketFacts";

// "as of <date> · Source: <name>", rendered beside every sourced fact.
export default function FactSource({ fact, className = "" }: { fact: MarketFact; className?: string }) {
  return <span className={`font-mono text-[10px] text-ink-muted ${className}`}>{provenance(fact)}</span>;
}
