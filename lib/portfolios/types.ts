// Shapes returned by getPortfolios() / getMarketDatasets() in
// lib/sanity/queries.ts and consumed by components/portfolios/*.
// The data itself lives in Sanity (`portfolio`, `marketDataset` documents).

export type DataStatus = "illustrative" | "backtested" | "live";

export type PortfolioHolding = {
  symbol: string;
  name: string;
  sector: string | null;
  weight: number;
  entryDate: string | null;
  returnYtd: number | null;
};

export type PortfolioMonth = {
  /** YYYY-MM */
  month: string;
  portfolioReturn: number;
  benchmarkReturn: number;
  topHolding: string | null;
  memo: string | null;
};

export type PortfolioMetrics = {
  cagr: number | null;
  sharpe: number | null;
  winRate: number | null;
  bestMonth: number | null;
  worstMonth: number | null;
  avgMonthlyReturn: number | null;
  annualisedVol: number | null;
  benchmarkVol: number | null;
  maxDrawdown: number | null;
};

export type PortfolioAllocation = { label: string; pct: number };

export type Portfolio = {
  _id: string;
  name: string;
  slug: string;
  strategy: string | null;
  inceptionDate: string | null;
  dataStatus: DataStatus;
  benchmark: string | null;
  profile: {
    horizon: string | null;
    riskLabel: string | null;
    rebalanceCadence: string | null;
    allocation: PortfolioAllocation[];
  };
  holdings: PortfolioHolding[];
  monthlyReturns: PortfolioMonth[];
  metrics: PortfolioMetrics;
};

export type DatasetRow = {
  label: string;
  sublabel: string | null;
  values: { key: string; value: number }[];
};

export type MarketDataset = {
  _id: string;
  name: string;
  slug: string;
  dataStatus: DataStatus;
  asOf: string | null;
  source: string | null;
  rows: DatasetRow[];
};

export const DATASET_SLUGS = {
  quilt: "asset-class-quilt",
  dispersion: "cross-asset-dispersion",
} as const;

// Label shown on a panel for a given status; null means no chip.
export function dataStatusLabel(status: DataStatus): string | null {
  if (status === "illustrative") return "Illustrative";
  if (status === "backtested") return "Backtested";
  return null;
}

export function valueOf(row: DatasetRow, key: string): number | null {
  return row.values.find((v) => v.key === key)?.value ?? null;
}
