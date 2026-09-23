// SEBI's published findings on individual traders in the equity F&O segment.
//
// TODO (before launch): verify every value below against the study PDF on
// sebi.gov.in and update `asOf` to the date it was checked. Nothing on the
// home page may cite an F&O loss figure that is not defined in this file.
// All figures are approximate and rounded, as the callout's source line says.

const SOURCE = "SEBI, Analysis of Profits and Losses in the Equity Derivatives Segment, Sept 2024";
const AS_OF = "2024-09-23";
// The study is a fixed publication; re-check for a newer SEBI release every two years.
export const SEBI_FO_STALE_AFTER_DAYS = 730;

export type SebiStat = {
  id: string;
  /** The figure on its own, e.g. "93%" or "₹1.8 lakh crore". */
  value: string;
  /** Reads on from the figure, e.g. "of individual F&O traders lost money, FY22 to FY24". */
  label: string;
  source: string;
  asOf: string;
  staleAfterDays: number;
};

export const SEBI_FO_STATS: SebiStat[] = [
  {
    id: "share-lost-fy22-24",
    value: "93%",
    label: "of individual F&O traders lost money, FY22 to FY24",
    source: SOURCE,
    asOf: AS_OF, // TODO: verify against the PDF
    staleAfterDays: SEBI_FO_STALE_AFTER_DAYS,
  },
  {
    id: "aggregate-loss-fy22-24",
    value: "₹1.8 lakh crore",
    label: "aggregate losses over those three years",
    source: SOURCE,
    asOf: AS_OF, // TODO: verify against the PDF
    staleAfterDays: SEBI_FO_STALE_AFTER_DAYS,
  },
  {
    id: "average-loss-fy22-24",
    value: "₹2 lakh",
    label: "average loss per trader over the period",
    source: SOURCE,
    asOf: AS_OF, // TODO: verify against the PDF
    staleAfterDays: SEBI_FO_STALE_AFTER_DAYS,
  },
  {
    id: "share-lost-fy24",
    value: "91%",
    label: "lost money in FY24 alone",
    source: SOURCE,
    asOf: AS_OF, // TODO: verify against the PDF
    staleAfterDays: SEBI_FO_STALE_AFTER_DAYS,
  },
  {
    id: "average-loss-fy24",
    value: "₹1.2 lakh",
    label: "average loss per loss-making trader, FY24",
    source: SOURCE,
    asOf: AS_OF, // TODO: verify against the PDF
    staleAfterDays: SEBI_FO_STALE_AFTER_DAYS,
  },
];

export const SEBI_FO_SOURCE = SOURCE;
