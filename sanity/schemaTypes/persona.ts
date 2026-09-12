import { defineType, defineField } from 'sanity'

// The keys PersonaIcon (components/FindYourPath/PathNavigator.tsx) switches
// on to render a hand-drawn SVG per persona — icons are inline SVG paths in
// code, not a Sanity asset. Adding a persona with a new icon needs a
// matching `case` added there first, then a new entry here. Keep both in
// sync manually.
const ICON_KEYS = [
  { title: 'Fresh graduate / first job', value: 'fresh_grad' },
  { title: 'Active trader (self-taught)', value: 'active_trader' },
  { title: 'Salaried professional', value: 'salaried_pro' },
  { title: 'Finance student / career aspirant', value: 'finance_student' },
  { title: 'Business owner / entrepreneur', value: 'business_owner' },
  { title: 'HNI / sophisticated investor', value: 'hni' },
  { title: 'Near or at retirement', value: 'retiree' },
]

export const personaSchema = defineType({
  name: 'persona',
  title: 'Persona',
  type: 'document',
  description: 'A "who are you" option in the Find Your Path homepage feature.',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: Rule => Rule.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: Rule => Rule.required() }),
    defineField({
      name: 'iconKey',
      title: 'Icon Key',
      type: 'string',
      description: 'Selects which hardcoded SVG PersonaIcon renders for this persona.',
      options: { list: ICON_KEYS, layout: 'radio' },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Lower number = appears first in the "Who are you" column.',
      validation: Rule => Rule.required(),
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'iconKey' },
  },
})
