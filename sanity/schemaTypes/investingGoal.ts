import { defineType, defineField } from 'sanity'

export const investingGoalSchema = defineType({
  name: 'investingGoal',
  title: 'Investing Goal',
  type: 'document',
  description: 'A "your goal" option in the Find Your Path homepage feature, e.g. "Start investing my salary wisely". Which persona(s) it\'s offered under is decided by learningPath, not stored here.',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: Rule => Rule.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: Rule => Rule.required() }),
  ],
  preview: {
    select: { title: 'title' },
  },
})
