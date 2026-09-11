import { defineType, defineField, defineArrayMember } from 'sanity'
import { LEARNING_PATHS } from '../lib/learningPaths'

export const courseSchema = defineType({
  name: 'course',
  title: 'Course',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: Rule => Rule.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: Rule => Rule.required() }),
    defineField({ name: 'subtitle', title: 'Subtitle', type: 'string' }),
    defineField({ name: 'tag', title: 'Level Tag', type: 'string', description: 'e.g. Beginner → Intermediate' }),
    defineField({ name: 'badge', title: 'Badge', type: 'string', description: 'e.g. BESTSELLER, NEW' }),
    defineField({ name: 'price', title: 'Price (₹)', type: 'number', description: 'Optional — for one-off workshops only' }),
    defineField({
      name: 'accessLevel',
      title: 'Access Level',
      type: 'string',
      options: {
        list: [
          { title: 'Free — anyone can access', value: 'free' },
          { title: 'Learner — requires subscription', value: 'learner' },
          { title: 'Pro — requires Trader Pro', value: 'pro' },
        ],
      },
      initialValue: 'learner',
    }),
    defineField({
      name: 'learningPath',
      title: 'Learning Path',
      type: 'string',
      description: 'e.g. Value Investing, Momentum Investing, CFA Preparation. Note: "Exam Preparation" is an umbrella path for CA, CS, CMT, CFP, NISM, CAIA, US CPA, US CMA, ACCA, CIMA, GMAT, and CAT content — CFA and FRM courses should keep using their own dedicated cfa-prep / frm-prep paths, not this one.',
      options: {
        list: LEARNING_PATHS.map(p => ({ title: p.title, value: p.value })),
      },
      initialValue: 'stock-market-basics',
    }),
    // @deprecated — use learningPath instead. Kept temporarily; existing documents may still reference this field.
    defineField({
      name: 'track',
      title: 'Track (deprecated — use Learning Path)',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'orderRank',
      title: 'Order within track',
      type: 'number',
      description: 'Lower number = appears first. e.g. 1, 2, 3...',
      initialValue: 99,
    }),
    defineField({ name: 'lessonsCount', title: 'Total Lessons', type: 'number' }),
    defineField({ name: 'duration', title: 'Duration', type: 'string', description: 'e.g. ~4 hrs' }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 4 }),
    defineField({
      name: 'whyPicked',
      title: 'Why Picked (featured card)',
      type: 'text',
      rows: 2,
      description: 'One short plain sentence shown with no label when this course is featured on the homepage hero card, e.g. why it was chosen as a starting point.',
    }),
    defineField({ name: 'topics', title: 'Topic Tags', type: 'array', of: [defineArrayMember({ type: 'string' })] }),
    defineField({ name: 'whatYouLearn', title: 'What You Will Learn', type: 'array', of: [defineArrayMember({ type: 'string' })] }),
    defineField({
      name: 'prerequisiteCourse',
      title: 'Prerequisite Course',
      type: 'reference',
      to: [{ type: 'course' }],
      description: 'Optional. Another course a learner should ideally complete first.',
    }),
    defineField({
      name: 'lastReviewed',
      title: 'Last Reviewed',
      type: 'date',
      description: 'When tax/regulatory/rate-sensitive content in this course was last verified as current. Not shown to learners by default — an editorial/compliance tracking field.',
    }),
    defineField({
      name: 'authorByline',
      title: 'Author Byline',
      type: 'object',
      description: 'Optional. Leave empty for the default anonymous-brand presentation.',
      fields: [
        defineField({ name: 'name', title: 'Name', type: 'string' }),
        defineField({ name: 'credential', title: 'Credential', type: 'string', description: 'e.g. "SEBI Registered Research Analyst"' }),
      ],
    }),
    defineField({
      name: 'chapters',
      title: 'Chapters',
      type: 'array',
      of: [defineArrayMember({
        type: 'object',
        name: 'chapter',
        title: 'Chapter',
        fields: [
          defineField({ name: 'title', title: 'Chapter Title', type: 'string' }),
          defineField({
            name: 'lessons',
            title: 'Lessons',
            type: 'array',
            description: 'References to standalone Lesson documents. Manage lesson content in the "All Lessons" list.',
            of: [defineArrayMember({
              type: 'reference',
              to: [{ type: 'lesson' }],
            })]
          })
        ],
        preview: { select: { title: 'title' } }
      })]
    })
  ],
  preview: {
    select: { title: 'title', subtitle: 'tag' }
  }
})
