import { defineType, defineField } from 'sanity'
import { LEARNING_PATHS } from '../lib/learningPaths'

// Catalogue-level settings for one course learning path (the `course.learningPath`
// values in sanity/lib/learningPaths.ts). This is NOT the `learningPath`
// document type, which is the Find Your Path persona→goal join; those values
// live only as a string options list, so anything the home page needs to know
// about a path (is it featured, in what order) lives here, one document per
// path, _id `learningPathMeta-<path>`. Created by scripts/flag-featured-paths.mjs.
export const learningPathMetaSchema = defineType({
  name: 'learningPathMeta',
  title: 'Learning Path (catalogue settings)',
  type: 'document',
  fields: [
    defineField({
      name: 'path',
      title: 'Learning path',
      type: 'string',
      options: { list: LEARNING_PATHS.map((p) => ({ title: p.title, value: p.value })) },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'featuredOnHome',
      title: 'Featured on home page',
      type: 'boolean',
      description: 'Show this path in the Curated Learning Tracks section (only if it has at least one course).',
      initialValue: false,
    }),
    defineField({
      name: 'homeOrder',
      title: 'Home order',
      type: 'number',
      description: 'Lower number = appears first among featured paths.',
      initialValue: 99,
    }),
    defineField({
      name: 'blurb',
      title: 'Blurb',
      type: 'text',
      rows: 2,
      description: 'One sentence shown on the home page card. Optional.',
    }),
  ],
  orderings: [{ title: 'Home order', name: 'homeOrderAsc', by: [{ field: 'homeOrder', direction: 'asc' }] }],
  preview: {
    select: { title: 'path', featured: 'featuredOnHome', order: 'homeOrder' },
    prepare({ title, featured, order }) {
      const t = LEARNING_PATHS.find((p) => p.value === title)?.title ?? title
      return { title: t, subtitle: featured ? `Featured · order ${order}` : 'Not featured' }
    },
  },
})
