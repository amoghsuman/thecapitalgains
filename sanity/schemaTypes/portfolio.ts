import { defineType, defineField, defineArrayMember } from 'sanity'

// A model portfolio shown on /portfolios. Every number the page renders comes
// from one of these documents; nothing is hard-coded in the UI.
//
// `dataStatus` drives the labelling: "illustrative" and "backtested" documents
// carry that label on every panel that shows their numbers; only "live" renders
// without a chip.
export const dataStatusOptions = [
  { title: 'Illustrative (constructed example)', value: 'illustrative' },
  { title: 'Backtested', value: 'backtested' },
  { title: 'Live (tracked)', value: 'live' },
]

export const portfolioSchema = defineType({
  name: 'portfolio',
  title: 'Model Portfolio',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'strategy', title: 'Strategy', type: 'text', rows: 3 }),
    defineField({ name: 'inceptionDate', title: 'Inception date', type: 'date' }),
    defineField({
      name: 'dataStatus',
      title: 'Data status',
      type: 'string',
      options: { list: dataStatusOptions, layout: 'radio' },
      initialValue: 'illustrative',
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'benchmark', title: 'Benchmark', type: 'string', description: 'e.g. NIFTY 50' }),
    defineField({ name: 'order', title: 'Display order', type: 'number', initialValue: 99 }),

    // Descriptive profile shown on the portfolio card. Optional; the card
    // simply omits any part that is not filled in.
    defineField({
      name: 'profile',
      title: 'Profile',
      type: 'object',
      fields: [
        defineField({ name: 'horizon', title: 'Horizon', type: 'string', description: 'e.g. 5 yrs+' }),
        defineField({ name: 'riskLabel', title: 'Risk label', type: 'string', description: 'e.g. Moderate' }),
        defineField({ name: 'rebalanceCadence', title: 'Rebalance cadence', type: 'string', description: 'e.g. Quarterly' }),
        defineField({
          name: 'allocation',
          title: 'Target allocation',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'object',
              fields: [
                defineField({ name: 'label', title: 'Label', type: 'string', validation: (Rule) => Rule.required() }),
                defineField({ name: 'pct', title: 'Weight (%)', type: 'number', validation: (Rule) => Rule.required().min(0).max(100) }),
              ],
              preview: { select: { title: 'label', subtitle: 'pct' } },
            }),
          ],
        }),
      ],
    }),

    defineField({
      name: 'holdings',
      title: 'Holdings',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'symbol', title: 'Symbol', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'name', title: 'Name', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'sector', title: 'Sector', type: 'string' }),
            defineField({ name: 'weight', title: 'Weight (%)', type: 'number', validation: (Rule) => Rule.required().min(0).max(100) }),
            defineField({ name: 'entryDate', title: 'Entry date', type: 'date' }),
            defineField({ name: 'returnYtd', title: 'Return YTD (%)', type: 'number' }),
          ],
          preview: { select: { title: 'symbol', subtitle: 'weight' } },
        }),
      ],
    }),

    defineField({
      name: 'monthlyReturns',
      title: 'Monthly returns',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'month',
              title: 'Month (YYYY-MM)',
              type: 'string',
              validation: (Rule) => Rule.required().regex(/^\d{4}-(0[1-9]|1[0-2])$/, { name: 'YYYY-MM' }),
            }),
            defineField({ name: 'portfolioReturn', title: 'Portfolio return (%)', type: 'number', validation: (Rule) => Rule.required() }),
            defineField({ name: 'benchmarkReturn', title: 'Benchmark return (%)', type: 'number', validation: (Rule) => Rule.required() }),
            defineField({ name: 'topHolding', title: 'Top holding', type: 'string' }),
            defineField({ name: 'memo', title: 'Memo', type: 'text', rows: 2 }),
          ],
          preview: { select: { title: 'month', subtitle: 'portfolioReturn' } },
        }),
      ],
    }),

    defineField({
      name: 'metrics',
      title: 'Metrics',
      type: 'object',
      fields: [
        defineField({ name: 'cagr', title: 'CAGR (%)', type: 'number' }),
        defineField({ name: 'sharpe', title: 'Sharpe ratio', type: 'number' }),
        defineField({ name: 'winRate', title: 'Positive-month win rate (%)', type: 'number' }),
        defineField({ name: 'bestMonth', title: 'Best month return (%)', type: 'number' }),
        defineField({ name: 'worstMonth', title: 'Worst month return (%)', type: 'number' }),
        defineField({ name: 'avgMonthlyReturn', title: 'Average monthly return (%)', type: 'number' }),
        defineField({ name: 'annualisedVol', title: 'Annualised volatility (%)', type: 'number' }),
        defineField({ name: 'benchmarkVol', title: 'Benchmark volatility (%)', type: 'number' }),
        defineField({ name: 'maxDrawdown', title: 'Max drawdown (%)', type: 'number' }),
      ],
    }),
  ],
  orderings: [{ title: 'Display order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: {
    select: { title: 'name', subtitle: 'dataStatus' },
  },
})
