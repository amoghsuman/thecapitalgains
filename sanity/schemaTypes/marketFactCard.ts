import { defineType, defineField } from 'sanity'

// A sourced fact card for the home page's Market Desk strip. Every published
// card must cite a source and an as-of date; once `asOf` is older than
// `staleAfterDays` the site stops showing it (CLAUDE.md, "Data freshness").
// Facts computed live from lib/home/marketFacts.ts (rule of 72, hurdle rate)
// are not documents here; the strip merges them in.
export const marketFactCardSchema = defineType({
  name: 'marketFactCard',
  title: 'Market fact card',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'categoryLabel',
      title: 'Category label',
      type: 'string',
      description: 'Short badge text, e.g. "SEBI derivatives stats".',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'headlineValue',
      title: 'Headline value',
      type: 'string',
      description: 'The figure shown beside the badge, e.g. "₹1.8 lakh crore lost". Optional.',
    }),
    defineField({ name: 'body', title: 'Body', type: 'text', rows: 4, validation: (Rule) => Rule.required() }),
    defineField({
      name: 'source',
      title: 'Source',
      type: 'string',
      description: 'Publisher and document, e.g. "SEBI, Analysis of Profits and Losses in the Equity Derivatives Segment, Sept 2024".',
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'sourceUrl', title: 'Source URL', type: 'url' }),
    defineField({
      name: 'asOf',
      title: 'As of',
      type: 'date',
      description: 'Date the figure was published or last verified.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'staleAfterDays',
      title: 'Stale after (days)',
      type: 'number',
      description: 'The card is hidden once asOf is older than this.',
      initialValue: 365,
      validation: (Rule) => Rule.required().min(1).integer(),
    }),
    defineField({ name: 'referenceCourse', title: 'Reference course', type: 'reference', to: [{ type: 'course' }] }),
    defineField({ name: 'order', title: 'Order', type: 'number', description: 'Rotation order (lower first).', initialValue: 99 }),
    defineField({
      name: 'editorialNote',
      title: 'Editorial note',
      type: 'text',
      rows: 2,
      description: 'Internal. Why a card is still a draft, what to verify before publishing. Never rendered.',
    }),
  ],
  orderings: [{ title: 'Order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: {
    select: { title: 'title', subtitle: 'categoryLabel', asOf: 'asOf' },
    prepare({ title, subtitle, asOf }) {
      return { title, subtitle: `${subtitle ?? ''}${asOf ? ` · as of ${asOf}` : ''}` }
    },
  },
})
