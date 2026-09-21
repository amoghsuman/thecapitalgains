// SEBI's published findings on individual traders in the equity F&O segment.
//
// TODO (before launch): verify every value below against the study PDF on
// sebi.gov.in and update `asOf` to the date it was checked. Nothing on the
// home page may cite an F&O loss figure that is not defined in this file.

const SOURCE = "SEBI, Analysis of Profits and Losses in the Equity Derivatives Segment, Sept 2024";
const AS_OF = "2024-09-23";

export type SebiStat = {
  id: string;
  value: string;
  label: string;
  source: string;
  asOf: string;
};

export const SEBI_FO_STATS: SebiStat[] = [
  {
    id: "share-lost-fy22-24",
    value: "about 93%",
    label: "of individual F&O traders lost money over FY22 to FY24",
    source: SOURCE,
    asOf: AS_OF, // TODO: verify against the PDF
  },
  {
    id: "aggregate-loss-fy22-24",
    value: "about ₹1.8 lakh crore",
    label: "in aggregate losses over those three years",
    source: SOURCE,
    asOf: AS_OF, // TODO: verify against the PDF
  },
  {
    id: "average-loss-fy22-24",
    value: "about ₹2 lakh",
    label: "average loss per trader over the period",
    source: SOURCE,
    asOf: AS_OF, // TODO: verify against the PDF
  },
  {
    id: "share-lost-fy24",
    value: "about 91%",
    label: "lost money in FY24 alone",
    source: SOURCE,
    asOf: AS_OF, // TODO: verify against the PDF
  },
  {
    id: "average-loss-fy24",
    value: "about ₹1.2 lakh",
    label: "average loss per loss-making trader in FY24",
    source: SOURCE,
    asOf: AS_OF, // TODO: verify against the PDF
  },
];

export const SEBI_FO_SOURCE = SOURCE;
