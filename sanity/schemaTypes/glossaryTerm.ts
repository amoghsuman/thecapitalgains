import { defineType, defineField } from 'sanity'

export const GLOSSARY_CATEGORIES = [
  { title: 'Fundamentals', value: 'fundamentals' },
  { title: 'Derivatives', value: 'derivatives' },
  { title: 'Valuation', value: 'valuation' },
  { title: 'Wealth', value: 'wealth' },
] as const

// One glossary entry for the home page's "Glossary of the Week". The term shown
// rotates deterministically by ISO week within each category (see
// components/home/GlossaryOfTheWeek.tsx), so every published term gets a turn.
export const glossaryTermSchema = defineType({
  name: 'glossaryTerm',
  title: 'Glossary term',
  type: 'document',
  fields: [
    defineField({ name: 'term', title: 'Term', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: { list: [...GLOSSARY_CATEGORIES], layout: 'radio' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'shortDefinition',
      title: 'Short definition',
      type: 'text',
      rows: 2,
      description: 'One-sentence mental model shown in the hover tooltip. Optional.',
    }),
    defineField({
      name: 'definition',
      title: 'Definition',
      type: 'text',
      rows: 4,
      description: 'The precise definition shown in the card body.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'formula', title: 'Formula', type: 'string', description: 'Plain text, e.g. "ROCE = EBIT ÷ Capital Employed". Optional.' }),
    defineField({
      name: 'retailTrap',
      title: 'Retail trap',
      type: 'text',
      rows: 3,
      description: 'The common mistake around this term. Optional.',
    }),
    defineField({
      name: 'taughtInCourse',
      title: 'Taught in course',
      type: 'reference',
      to: [{ type: 'course' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'order', title: 'Order', type: 'number', description: 'Rotation order within the category (lower first).', initialValue: 99 }),
  ],
  orderings: [{ title: 'Category, order', name: 'categoryOrder', by: [{ field: 'category', direction: 'asc' }, { field: 'order', direction: 'asc' }] }],
  preview: {
    select: { title: 'term', category: 'category', order: 'order' },
    prepare({ title, category, order }) {
      return { title, subtitle: `${category ?? '—'} · ${order ?? '—'}` }
    },
  },
})
