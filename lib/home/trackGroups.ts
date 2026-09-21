import { LEARNING_PATHS } from "@/sanity/lib/learningPaths";

export type LearningPathSlug = (typeof LEARNING_PATHS)[number]["value"];

export type TrackGroup = {
  slug: string;
  title: string;
  paths: LearningPathSlug[];
};

// Groups the learning paths in sanity/lib/learningPaths.ts into the four
// tracks shown on the home page. The Sanity list stays the source of truth
// for path slugs and titles; this file only adds the grouping.
export const TRACK_GROUPS: TrackGroup[] = [
  {
    slug: "retail-investing",
    title: "Retail investing",
    paths: [
      "stock-market-basics",
      "value-investing",
      "momentum-investing",
      "technical-trading",
      "options-derivatives",
      "mutual-funds-etfs",
      "macro-and-markets",
      "tax-wealth-planning",
      "alternative-investing",
    ],
  },
  {
    slug: "finance-careers",
    title: "Finance careers",
    paths: [
      "investment-banking",
      "equity-research",
      "private-equity-vc",
      "cfa-prep",
      "frm-prep",
      "exam-prep",
      "career-fundamentals",
      "fintech-careers",
    ],
  },
  {
    slug: "quant-and-code",
    title: "Quant and code",
    paths: ["quant-finance", "algo-trading", "python-finance"],
  },
  {
    slug: "corporate-finance",
    title: "Corporate finance",
    paths: ["financial-modelling", "corporate-finance", "ma-valuation", "forensic-compliance"],
  },
];

const PATH_TITLES: Record<string, string> = Object.fromEntries(
  LEARNING_PATHS.map((p) => [p.value, p.title])
);

export function learningPathTitle(slug: string): string {
  return PATH_TITLES[slug] ?? slug;
}
