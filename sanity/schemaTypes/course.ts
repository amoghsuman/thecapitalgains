import { defineType, defineField, defineArrayMember } from 'sanity'

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
    defineField({ name: 'lessonsCount', title: 'Total Lessons', type: 'number' }),
    defineField({ name: 'duration', title: 'Duration', type: 'string', description: 'e.g. ~4 hrs' }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 4 }),
    defineField({ name: 'topics', title: 'Topic Tags', type: 'array', of: [defineArrayMember({ type: 'string' })] }),
    defineField({ name: 'whatYouLearn', title: 'What You Will Learn', type: 'array', of: [defineArrayMember({ type: 'string' })] }),
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
            of: [defineArrayMember({
              type: 'object',
              name: 'lesson',
              title: 'Lesson',
              fields: [
                defineField({ name: 'title', title: 'Lesson Title', type: 'string' }),
                defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' } }),
                defineField({ name: 'duration', title: 'Duration', type: 'string', description: 'e.g. 8 min read' }),
                defineField({ name: 'isFree', title: 'Free Preview?', type: 'boolean', initialValue: false }),
                defineField({
                  name: 'body',
                  title: 'Lesson Content',
                  type: 'array',
                  of: [
                    defineArrayMember({ type: 'block' }),
                    defineArrayMember({
                      type: 'object',
                      name: 'callout',
                      title: 'Callout Box',
                      fields: [
                        defineField({ name: 'type', title: 'Type', type: 'string', options: { list: [{ title: 'Insight', value: 'insight' }, { title: 'Warning', value: 'warning' }] } }),
                        defineField({ name: 'text', title: 'Text', type: 'text' })
                      ],
                      preview: { select: { title: 'type', subtitle: 'text' } }
                    }),
                    defineArrayMember({
                      type: 'object',
                      name: 'exercise',
                      title: 'Exercise Box',
                      fields: [
                        defineField({ name: 'title', title: 'Exercise Title', type: 'string' }),
                        defineField({ name: 'steps', title: 'Steps', type: 'array', of: [defineArrayMember({ type: 'string' })] })
                      ],
                      preview: { select: { title: 'title' } }
                    }),
                    defineArrayMember({
                      type: 'object',
                      name: 'mathBlock',
                      title: 'Math Equation (KaTeX)',
                      fields: [
                        defineField({ name: 'latex', title: 'LaTeX Expression', type: 'text', description: 'e.g. P = S \\cdot N(d_1) - K e^{-rT} N(d_2)' }),
                        defineField({ name: 'caption', title: 'Caption (optional)', type: 'string' })
                      ],
                      preview: { select: { title: 'latex', subtitle: 'caption' } }
                    }),
                    defineArrayMember({
                      type: 'object',
                      name: 'keyFact',
                      title: 'Key Fact',
                      fields: [
                        defineField({ name: 'label', title: 'Label', type: 'string', description: 'e.g. "Max Loss"' }),
                        defineField({ name: 'value', title: 'Value', type: 'string', description: 'e.g. "₹6,000 (premium paid)"' }),
                        defineField({ name: 'context', title: 'Context (optional)', type: 'string', description: 'Brief explanation shown below the value' })
                      ],
                      preview: { select: { title: 'label', subtitle: 'value' } }
                    })
                  ]
                })
              ],
              preview: { select: { title: 'title', subtitle: 'duration' } }
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
