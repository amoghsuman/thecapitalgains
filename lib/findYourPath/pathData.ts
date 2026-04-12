// ─────────────────────────────────────────────
// HOW TO UPDATE THIS FILE
//
// To add a new persona:
//   → Add a new object to the personas array
//   → Give it a unique key, label, and goals array
//
// To add a new goal to an existing persona:
//   → Find the persona by key, add to its goals array
//
// To add or change a course in a goal:
//   → Find the goal, edit its courses array
//   → slug must match the Sanity course slug exactly
//
// To change a suggested plan:
//   → Edit suggestedLearn, suggestedResearch, or suggestedSession strings
//
// Never edit PathNavigator.tsx for content changes — only edit this file.
// ─────────────────────────────────────────────

export type Course = {
  title: string
  slug: string
  reason: string
}

export type Goal = {
  label: string
  courses: Course[]
  suggestedLearn: string | null
  suggestedResearch: string
  suggestedSession: string | null
}

export type Persona = {
  key: string
  label: string
  goals: Goal[]
}

export const personas: Persona[] = [
  {
    key: 'fresh_grad',
    label: 'Fresh graduate / first job',
    goals: [
      {
        label: 'Start investing my salary wisely',
        courses: [
          { title: 'Stock Market from Zero', slug: 'stock-market-from-zero', reason: 'Mechanics before everything else — eliminates the most costly beginner mistakes' },
          { title: 'Mutual Funds & ETFs', slug: 'mutual-funds-etfs-complete-guide', reason: 'The right vehicle for your income stage and risk profile' },
          { title: 'How to Read Financial Statements', slug: 'how-to-read-financial-statements', reason: 'Evaluate what you are buying before you buy it' },
        ],
        suggestedLearn: 'Learner ₹999/mo',
        suggestedResearch: 'Newsletter ₹499/mo',
        suggestedSession: 'Doubt Session',
      },
      {
        label: 'Avoid common first-timer mistakes',
        courses: [
          { title: 'Stock Market from Zero', slug: 'stock-market-from-zero', reason: 'Covers all the mechanics most beginners get wrong' },
          { title: 'Mutual Funds & ETFs', slug: 'mutual-funds-etfs-complete-guide', reason: 'SIP discipline and fund selection — the two things that matter most early on' },
        ],
        suggestedLearn: 'Learner ₹999/mo',
        suggestedResearch: 'Newsletter ₹499/mo',
        suggestedSession: 'Doubt Session',
      },
    ],
  },
  {
    key: 'active_trader',
    label: 'Active trader (self-taught)',
    goals: [
      {
        label: 'Stop losing on trades I should be winning',
        courses: [
          { title: 'Options Trading from Zero', slug: 'options-trading-from-zero', reason: 'Greeks, pricing, and setups most self-taught traders never learn correctly' },
          { title: 'Futures & Derivatives Explained', slug: 'futures-derivatives-explained', reason: 'Position sizing and hedging — what separates consistent traders' },
          { title: 'Technical Analysis', slug: 'technical-analysis-charts-patterns-indicators', reason: 'Structure your chart reading with a repeatable framework' },
        ],
        suggestedLearn: 'Pro ₹2,499/mo',
        suggestedResearch: 'Essential ₹4,999/mo',
        suggestedSession: 'Doubt Session + Portfolio Review',
      },
      {
        label: 'Get serious about options trading',
        courses: [
          { title: 'Options Trading from Zero', slug: 'options-trading-from-zero', reason: 'Full playbook — Greeks, IV, strategies, and when each works' },
          { title: 'Futures & Derivatives Explained', slug: 'futures-derivatives-explained', reason: 'Understand the underlying mechanics your options are priced against' },
          { title: 'How to Read Financial Statements', slug: 'how-to-read-financial-statements', reason: 'Avoid trading into earnings traps and corporate events blindly' },
        ],
        suggestedLearn: 'Pro ₹2,499/mo',
        suggestedResearch: 'Essential ₹4,999/mo',
        suggestedSession: 'Portfolio Review',
      },
    ],
  },
  {
    key: 'salaried_pro',
    label: 'Salaried professional',
    goals: [
      {
        label: 'Make my savings work harder than an FD',
        courses: [
          { title: 'Mutual Funds & ETFs', slug: 'mutual-funds-etfs-complete-guide', reason: 'The right equity exposure for a busy professional' },
          { title: 'How to Read Financial Statements', slug: 'how-to-read-financial-statements', reason: 'Evaluate whether what you own is actually good' },
          { title: 'Stock Market from Zero', slug: 'stock-market-from-zero', reason: 'Fill in the mechanics gaps — know what you are invested in' },
        ],
        suggestedLearn: 'Learner ₹999/mo',
        suggestedResearch: 'Essential ₹4,999/mo',
        suggestedSession: 'Portfolio Review',
      },
      {
        label: 'Build a long-term equity portfolio',
        courses: [
          { title: 'How to Read Financial Statements', slug: 'how-to-read-financial-statements', reason: 'Stock selection starts here — everything else is secondary' },
          { title: 'Stock Market from Zero', slug: 'stock-market-from-zero', reason: 'Market mechanics and how to execute correctly' },
          { title: 'Mutual Funds & ETFs', slug: 'mutual-funds-etfs-complete-guide', reason: 'For the portion you want managed passively' },
        ],
        suggestedLearn: 'Learner ₹999/mo',
        suggestedResearch: 'Essential ₹4,999/mo',
        suggestedSession: 'Portfolio Review',
      },
    ],
  },
  {
    key: 'finance_student',
    label: 'Finance student / career aspirant',
    goals: [
      {
        label: 'Prepare for finance interviews and jobs',
        courses: [
          { title: 'How to Read Financial Statements', slug: 'how-to-read-financial-statements', reason: 'The single most tested skill in equity research and IB interviews' },
          { title: 'Futures & Derivatives Explained', slug: 'futures-derivatives-explained', reason: 'Derivatives knowledge separates candidates at every level' },
          { title: 'Options Trading from Zero', slug: 'options-trading-from-zero', reason: 'Practical working knowledge — not just formula memorisation' },
        ],
        suggestedLearn: 'Learner ₹999/mo',
        suggestedResearch: 'Newsletter ₹499/mo',
        suggestedSession: 'Doubt Session',
      },
      {
        label: 'Understand real markets beyond textbooks',
        courses: [
          { title: 'Stock Market from Zero', slug: 'stock-market-from-zero', reason: 'How Indian markets actually work — NSE, BSE, settlement, participants' },
          { title: 'How to Read Financial Statements', slug: 'how-to-read-financial-statements', reason: 'Applied analysis, not academic ratios' },
          { title: 'Technical Analysis', slug: 'technical-analysis-charts-patterns-indicators', reason: 'Market intuition and price structure — what no textbook covers' },
        ],
        suggestedLearn: 'Learner ₹999/mo',
        suggestedResearch: 'Newsletter ₹499/mo',
        suggestedSession: 'Doubt Session',
      },
    ],
  },
  {
    key: 'business_owner',
    label: 'Business owner / entrepreneur',
    goals: [
      {
        label: 'Deploy business profits into markets',
        courses: [
          { title: 'Stock Market from Zero', slug: 'stock-market-from-zero', reason: 'Business instincts transfer — but market mechanics must come first' },
          { title: 'How to Read Financial Statements', slug: 'how-to-read-financial-statements', reason: 'You already think like an analyst — now apply it to listed companies' },
          { title: 'Mutual Funds & ETFs', slug: 'mutual-funds-etfs-complete-guide', reason: 'For the portion you cannot actively manage' },
        ],
        suggestedLearn: 'Learner ₹999/mo',
        suggestedResearch: 'Essential ₹4,999/mo',
        suggestedSession: 'Portfolio Review',
      },
      {
        label: 'Understand equity like I understand my business',
        courses: [
          { title: 'How to Read Financial Statements', slug: 'how-to-read-financial-statements', reason: 'Your strongest entry point — you already think in P&L and cash flow' },
          { title: 'Stock Market from Zero', slug: 'stock-market-from-zero', reason: 'Market mechanics and participant behaviour' },
          { title: 'Options Trading from Zero', slug: 'options-trading-from-zero', reason: 'Hedging your equity book when needed' },
        ],
        suggestedLearn: 'Pro ₹2,499/mo',
        suggestedResearch: 'Essential ₹4,999/mo',
        suggestedSession: 'Portfolio Review',
      },
    ],
  },
  {
    key: 'hni',
    label: 'HNI / sophisticated investor',
    goals: [
      {
        label: 'Get unconflicted, independent research',
        courses: [],
        suggestedLearn: null,
        suggestedResearch: 'Premium ₹12,499/mo',
        suggestedSession: 'Portfolio Review',
      },
      {
        label: 'Get a sharp second opinion on my portfolio',
        courses: [],
        suggestedLearn: null,
        suggestedResearch: 'Essential ₹4,999/mo',
        suggestedSession: 'Portfolio Review',
      },
    ],
  },
  {
    key: 'retiree',
    label: 'Near or at retirement',
    goals: [
      {
        label: 'Protect my capital — no speculation',
        courses: [
          { title: 'Mutual Funds & ETFs', slug: 'mutual-funds-etfs-complete-guide', reason: 'Conservative equity exposure — balanced funds, dividend stocks, what to avoid' },
          { title: 'Stock Market from Zero', slug: 'stock-market-from-zero', reason: 'Fill in the mechanics most near-retirees have always wondered about' },
        ],
        suggestedLearn: 'Learner ₹999/mo',
        suggestedResearch: 'Essential ₹4,999/mo',
        suggestedSession: 'Portfolio Review',
      },
      {
        label: 'Generate steady income from my corpus',
        courses: [
          { title: 'Mutual Funds & ETFs', slug: 'mutual-funds-etfs-complete-guide', reason: 'Dividend yield strategies, debt allocation, and rebalancing logic' },
          { title: 'How to Read Financial Statements', slug: 'how-to-read-financial-statements', reason: 'Evaluate the dividend-paying companies in your portfolio' },
        ],
        suggestedLearn: 'Learner ₹999/mo',
        suggestedResearch: 'Essential ₹4,999/mo',
        suggestedSession: 'Portfolio Review',
      },
    ],
  },
]
