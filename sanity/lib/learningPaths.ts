// Single source of truth for the `course.learningPath` field's options list,
// shared between the schema (sanity/schemaTypes/course.ts) and the desk
// structure (sanity/structure.ts). Previously these were hand-maintained
// separately in two places — schemaTypes/course.ts and a second inline copy
// in sanity.config.ts's desk structure — and had already drifted out of
// sync (the structure's copy was missing 13 of the 24 paths below). Import
// this instead of re-listing values by hand.
//
// create-course-structure.mjs keeps its own duplicate of this same list —
// it's a standalone Node script outside the Studio's TypeScript build, so
// it can't import this module directly. Keep both in sync manually if this
// list changes.
export const LEARNING_PATHS = [
  { value: 'stock-market-basics', title: 'Stock Market Basics' },
  { value: 'value-investing', title: 'Value Investing' },
  { value: 'momentum-investing', title: 'Momentum Investing' },
  { value: 'technical-trading', title: 'Technical Trading' },
  { value: 'options-derivatives', title: 'Options & Derivatives' },
  { value: 'mutual-funds-etfs', title: 'Mutual Funds & ETFs' },
  { value: 'investment-banking', title: 'Investment Banking' },
  { value: 'equity-research', title: 'Equity Research' },
  { value: 'private-equity-vc', title: 'Private Equity & Venture Capital' },
  { value: 'cfa-prep', title: 'CFA Preparation' },
  { value: 'frm-prep', title: 'FRM Preparation' },
  { value: 'financial-modelling', title: 'Financial Modelling' },
  { value: 'quant-finance', title: 'Quantitative Finance' },
  { value: 'algo-trading', title: 'Algorithmic Trading' },
  { value: 'python-finance', title: 'Python for Finance' },
  { value: 'corporate-finance', title: 'Corporate Finance' },
  { value: 'ma-valuation', title: 'M&A & Valuation' },
  { value: 'career-fundamentals', title: 'Career Fundamentals' },
  { value: 'exam-prep', title: 'Exam Preparation' },
  { value: 'macro-and-markets', title: 'Macro & Markets' },
  { value: 'alternative-investing', title: 'Alternative Investing' },
  { value: 'tax-wealth-planning', title: 'Tax & Wealth Planning' },
  { value: 'forensic-compliance', title: 'Forensic Accounting & Compliance' },
  { value: 'fintech-careers', title: 'Fintech Careers' },
] as const
