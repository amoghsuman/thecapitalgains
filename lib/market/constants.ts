// Slow-moving reference data that is not worth fetching live. Each block
// carries its own source and as-of date; the UI prints both.
//
// Each block carries a staleAfterDays budget; app/api/cron/reference checks it.

export type NiftyConstituent = {
  symbol: string;
  name: string;
  sector: string;
  /** Index weight, % */
  weight: number;
};

// STALE FALLBACK ONLY. The live list and weights come from
// lib/market/providers.ts (getNifty50Constituents + getConstituentWeights:
// NSE constituent CSV, free-float market cap from Yahoo). This copy is used
// only when the NSE list cannot be fetched, and /api/market flags it as such.
// Seeded from the weights that were hard-coded in NiftyConstituentTreemap; it
// is a 36-name subset and its weights predate the 2026 factsheets.
export const niftyWeights: {
  asOf: string;
  source: string;
  staleAfterDays: number;
  constituents: NiftyConstituent[];
} = {
  asOf: "2026-06-30",
  source: "NSE Indices Nifty 50 Factsheet",
  staleAfterDays: 400,
  constituents: [
    // Financial Services
    { symbol: "HDFCBANK", name: "HDFC Bank Ltd", sector: "Financial Services", weight: 13.5 },
    { symbol: "ICICIBANK", name: "ICICI Bank Ltd", sector: "Financial Services", weight: 7.9 },
    { symbol: "SBIN", name: "State Bank of India", sector: "Financial Services", weight: 3.4 },
    { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank", sector: "Financial Services", weight: 2.9 },
    { symbol: "AXISBANK", name: "Axis Bank Ltd", sector: "Financial Services", weight: 3.2 },
    { symbol: "BAJFINANCE", name: "Bajaj Finance Ltd", sector: "Financial Services", weight: 2.5 },
    // Energy & Oil
    { symbol: "RELIANCE", name: "Reliance Industries", sector: "Energy & Oil", weight: 9.8 },
    { symbol: "ONGC", name: "Oil & Natural Gas Corp", sector: "Energy & Oil", weight: 1.6 },
    { symbol: "POWERGRID", name: "Power Grid Corp", sector: "Energy & Oil", weight: 1.4 },
    { symbol: "NTPC", name: "NTPC Limited", sector: "Energy & Oil", weight: 1.9 },
    // Information Technology
    { symbol: "TCS", name: "Tata Consultancy Services", sector: "Technology", weight: 4.8 },
    { symbol: "INFY", name: "Infosys Limited", sector: "Technology", weight: 5.6 },
    { symbol: "HCLTECH", name: "HCL Technologies", sector: "Technology", weight: 1.7 },
    { symbol: "WIPRO", name: "Wipro Limited", sector: "Technology", weight: 0.9 },
    { symbol: "TECHM", name: "Tech Mahindra", sector: "Technology", weight: 1.1 },
    // Automobiles
    // Tata Motors demerged on 2025-10-01: the listed company was renamed Tata
    // Motors Passenger Vehicles (TMPV) and stays in the Nifty 50; the
    // commercial-vehicle arm (Tata Motors Ltd, TMCV) was excluded on listing
    // (NSE ind_nifty50list.csv, checked 2026-09-24). Weight carried over from the
    // pre-demerger TATAMOTORS entry, pending the next factsheet refresh.
    { symbol: "TMPV", name: "Tata Motors Passenger Vehicles", sector: "Automobile", weight: 2.2 },
    { symbol: "M&M", name: "Mahindra & Mahindra", sector: "Automobile", weight: 2.4 },
    { symbol: "MARUTI", name: "Maruti Suzuki India", sector: "Automobile", weight: 1.8 },
    { symbol: "BAJAJ-AUTO", name: "Bajaj Auto Ltd", sector: "Automobile", weight: 1.2 },
    // Consumer Goods & FMCG
    { symbol: "ITC", name: "ITC Limited", sector: "FMCG", weight: 3.8 },
    { symbol: "HINDUNILVR", name: "Hindustan Unilever", sector: "FMCG", weight: 2.6 },
    { symbol: "NESTLEIND", name: "Nestle India", sector: "FMCG", weight: 1.1 },
    { symbol: "TATACONSUM", name: "Tata Consumer Products", sector: "FMCG", weight: 0.9 },
    // Metals & Mining
    { symbol: "TATASTEEL", name: "Tata Steel Ltd", sector: "Metals", weight: 1.3 },
    { symbol: "JSWSTEEL", name: "JSW Steel Ltd", sector: "Metals", weight: 1.0 },
    { symbol: "HINDALCO", name: "Hindalco Industries", sector: "Metals", weight: 1.1 },
    // Healthcare & Pharma
    { symbol: "SUNPHARMA", name: "Sun Pharma Industries", sector: "Healthcare", weight: 1.8 },
    { symbol: "DRREDDY", name: "Dr Reddy's Labs", sector: "Healthcare", weight: 0.9 },
    { symbol: "CIPLA", name: "Cipla Limited", sector: "Healthcare", weight: 0.8 },
    // Infrastructure, Telecom & others
    { symbol: "LT", name: "Larsen & Toubro Ltd", sector: "Infra & Industrials", weight: 3.9 },
    { symbol: "BHARTIARTL", name: "Bharti Airtel Ltd", sector: "Telecom", weight: 4.2 },
    { symbol: "ADANIENT", name: "Adani Enterprises", sector: "Diversified", weight: 1.2 },
    { symbol: "ADANIPORTS", name: "Adani Ports & SEZ", sector: "Infra & Industrials", weight: 1.4 },
    { symbol: "ULTRACEMCO", name: "UltraTech Cement", sector: "Materials", weight: 1.2 },
    { symbol: "TITAN", name: "Titan Company Ltd", sector: "Consumer", weight: 1.5 },
  ],
};

// Short labels for treemap tiles too narrow for the full NSE symbol. The full
// symbol and company name still appear in the tile title and tooltip.
export const symbolAliases: Record<string, string> = {
  HINDUNILVR: "HUL",
  TATACONSUM: "TATACONS",
  "BAJAJ-AUTO": "BAJAJAUTO",
  ADANIENT: "ADANI",
  ADANIPORTS: "ADANIPORT",
  ULTRACEMCO: "ULTRACEM",
  HINDALCO: "HINDAL",
  BHARTIARTL: "BHARTI",
  BAJFINANCE: "BAJFIN",
  KOTAKBANK: "KOTAK",
  ICICIBANK: "ICICI",
  HDFCBANK: "HDFCBK",
  AXISBANK: "AXIS",
  POWERGRID: "PGRID",
  NESTLEIND: "NESTLE",
  TATASTEEL: "TATASTL",
  JSWSTEEL: "JSWSTL",
  SUNPHARMA: "SUNPHRM",
  HCLTECH: "HCL",
  RELIANCE: "RIL",
};

// Hand-curated fallback; the market_reference table (key "repo_rate") wins
// when it holds a fresher row. Next MPC: 5 to 7 Oct 2026, hence the 75-day budget.
export const repoRate: { value: number; asOf: string; source: string; sourceUrl: string; staleAfterDays: number } = {
  value: 5.25,
  asOf: "2026-08-05",
  source: "RBI Monetary Policy Statement, 5 Aug 2026",
  sourceUrl: "https://www.rbi.org.in",
  staleAfterDays: 75,
};

/** "TBD" as-of dates render as "as-of date pending". */
export function asOfLabel(asOf: string): string {
  return asOf === "TBD" ? "as-of date pending" : `as of ${asOf}`;
}
