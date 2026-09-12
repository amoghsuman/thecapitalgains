import { defineType, defineField, defineArrayMember } from 'sanity'

// Harvey Ball scale — kept in sync manually with course.ts's `depth` field
// options and scripts/create-course-structure.mjs's VALID_DEPTH_PRIORITY_LEVELS.
const PRIORITY_LEVELS = [
  { title: 'Low', value: 'low' },
  { title: 'Medium-Low', value: 'medium-low' },
  { title: 'Medium-High', value: 'medium-high' },
  { title: 'High', value: 'high' },
]

export const learningPathSchema = defineType({
  name: 'learningPath',
  title: 'Learning Path',
  type: 'document',
  description: 'One persona + investing goal combination shown in Find Your Path, with its recommended courses. This is the join between persona and investingGoal — priority and rationale are contextual to this specific combination, not flat properties of the course.',
  fields: [
    defineField({
      name: 'persona',
      title: 'Persona',
      type: 'reference',
      to: [{ type: 'persona' }],
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'investingGoal',
      title: 'Investing Goal',
      type: 'reference',
      to: [{ type: 'investingGoal' }],
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: "Lower number = appears first in this persona's goal list.",
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'pathCourses',
      title: 'Path Courses',
      type: 'array',
      description: 'Recommended courses for this persona+goal combination, in display order. Can be empty (e.g. an HNI goal with no course recommendations, research-only).',
      of: [defineArrayMember({
        type: 'object',
        name: 'pathCourse',
        title: 'Path Course',
        fields: [
          defineField({
            name: 'course',
            title: 'Course',
            type: 'reference',
            to: [{ type: 'course' }],
            validation: Rule => Rule.required(),
          }),
          defineField({
            name: 'priority',
            title: 'Priority',
            type: 'string',
            description: 'Harvey Ball priority for this course on this specific path. The same course can carry a different priority on a different learning path — this is deliberately NOT a flat field on the course itself (see course.depth for the course\'s own, path-independent complexity rating).',
            options: { list: PRIORITY_LEVELS, layout: 'radio' },
            validation: Rule => Rule.required(),
          }),
          defineField({
            name: 'rationale',
            title: 'Rationale',
            type: 'text',
            rows: 2,
            description: 'One short sentence on why this course is recommended for this specific persona+goal combination.',
            validation: Rule => Rule.required(),
          }),
        ],
        preview: {
          select: { title: 'course.title', subtitle: 'priority' },
        },
      })],
    }),
  ],
  preview: {
    select: { personaTitle: 'persona.title', goalTitle: 'investingGoal.title' },
    prepare({ personaTitle, goalTitle }) {
      return { title: `${personaTitle ?? '(no persona)'} → ${goalTitle ?? '(no goal)'}` }
    },
  },
})
