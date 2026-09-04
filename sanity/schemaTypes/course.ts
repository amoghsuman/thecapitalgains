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
    defineField({
      name: 'learningPath',
      title: 'Learning Path',
      type: 'string',
      description: 'e.g. Value Investing, Momentum Investing, CFA Preparation. Note: "Exam Preparation" is an umbrella path for CA, CS, CMT, CFP, NISM, CAIA, US CPA, US CMA, ACCA, CIMA, GMAT, and CAT content — CFA and FRM courses should keep using their own dedicated cfa-prep / frm-prep paths, not this one.',
      options: {
        list: [
          { title: 'Stock Market Basics', value: 'stock-market-basics' },
          { title: 'Value Investing', value: 'value-investing' },
          { title: 'Momentum Investing', value: 'momentum-investing' },
          { title: 'Technical Trading', value: 'technical-trading' },
          { title: 'Options & Derivatives', value: 'options-derivatives' },
          { title: 'Mutual Funds & ETFs', value: 'mutual-funds-etfs' },
          { title: 'Investment Banking', value: 'investment-banking' },
          { title: 'Equity Research', value: 'equity-research' },
          { title: 'Private Equity & Venture Capital', value: 'private-equity-vc' },
          { title: 'CFA Preparation', value: 'cfa-prep' },
          { title: 'FRM Preparation', value: 'frm-prep' },
          { title: 'Financial Modelling', value: 'financial-modelling' },
          { title: 'Quantitative Finance', value: 'quant-finance' },
          { title: 'Algorithmic Trading', value: 'algo-trading' },
          { title: 'Python for Finance', value: 'python-finance' },
          { title: 'Corporate Finance', value: 'corporate-finance' },
          { title: 'M&A & Valuation', value: 'ma-valuation' },
          { title: 'Career Fundamentals', value: 'career-fundamentals' },
          { title: 'Exam Preparation', value: 'exam-prep' },
          { title: 'Macro & Markets', value: 'macro-and-markets' },
          { title: 'Alternative Investing', value: 'alternative-investing' },
          { title: 'Tax & Wealth Planning', value: 'tax-wealth-planning' },
          { title: 'Forensic Accounting & Compliance', value: 'forensic-compliance' },
          { title: 'Fintech Careers', value: 'fintech-careers' },
        ],
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
                        defineField({
                          name: 'variant',
                          title: 'Variant',
                          type: 'string',
                          description: 'Missing/unset is treated as "checklist" for backward compatibility with existing content.',
                          options: {
                            list: [
                              { title: 'Checklist', value: 'checklist' },
                              { title: 'Scenario (revealable model answer)', value: 'scenario' },
                              { title: 'Quiz (multiple choice)', value: 'quiz' },
                            ],
                          },
                          initialValue: 'checklist',
                        }),
                        defineField({ name: 'title', title: 'Exercise Title', type: 'string' }),
                        // ── checklist fields ──
                        defineField({
                          name: 'steps',
                          title: 'Steps',
                          type: 'array',
                          of: [defineArrayMember({ type: 'string' })],
                          hidden: ({ parent }) => !!parent?.variant && parent.variant !== 'checklist',
                        }),
                        // ── scenario fields ──
                        defineField({
                          name: 'scenario',
                          title: 'Scenario',
                          type: 'text',
                          description: 'The realistic situation or problem description.',
                          hidden: ({ parent }) => parent?.variant !== 'scenario',
                        }),
                        defineField({
                          name: 'prompt',
                          title: 'Prompt',
                          type: 'text',
                          description: 'What the learner is asked to do, e.g. "What would you do here?"',
                          hidden: ({ parent }) => parent?.variant !== 'scenario',
                        }),
                        defineField({
                          name: 'modelAnswer',
                          title: 'Model Answer',
                          type: 'text',
                          description: 'Hidden behind a "Show model answer" toggle in the reader.',
                          hidden: ({ parent }) => parent?.variant !== 'scenario',
                        }),
                        // ── quiz fields ──
                        defineField({
                          name: 'question',
                          title: 'Question',
                          type: 'text',
                          hidden: ({ parent }) => parent?.variant !== 'quiz',
                        }),
                        defineField({
                          name: 'options',
                          title: 'Options',
                          type: 'array',
                          of: [defineArrayMember({ type: 'string' })],
                          hidden: ({ parent }) => parent?.variant !== 'quiz',
                        }),
                        defineField({
                          name: 'correctIndex',
                          title: 'Correct Option Index',
                          type: 'number',
                          description: '0-based index into "options" of the correct choice.',
                          hidden: ({ parent }) => parent?.variant !== 'quiz',
                        }),
                        defineField({
                          name: 'explanation',
                          title: 'Explanation',
                          type: 'text',
                          description: 'Shown after the learner selects an answer.',
                          hidden: ({ parent }) => parent?.variant !== 'quiz',
                        }),
                      ],
                      preview: {
                        select: { title: 'title', variant: 'variant' },
                        prepare: ({ title, variant }) => ({
                          title: title || 'Exercise',
                          subtitle: variant ? variant : 'checklist',
                        }),
                      },
                    }),
                    defineArrayMember({
                      type: 'object',
                      name: 'table',
                      title: 'Table',
                      fields: [
                        defineField({ name: 'caption', title: 'Caption (optional)', type: 'string', description: 'Shown above the table.' }),
                        defineField({ name: 'headers', title: 'Headers', type: 'array', of: [defineArrayMember({ type: 'string' })] }),
                        defineField({
                          name: 'rows',
                          title: 'Rows',
                          type: 'array',
                          description: 'Each row is a list of cell values, in the same order as Headers.',
                          of: [defineArrayMember({
                            type: 'object',
                            name: 'tableRow',
                            title: 'Row',
                            fields: [
                              defineField({
                                name: 'cells',
                                title: 'Cells',
                                type: 'array',
                                of: [defineArrayMember({ type: 'string' })],
                              }),
                            ],
                            preview: {
                              select: { cells: 'cells' },
                              prepare: ({ cells }) => ({
                                title: Array.isArray(cells) ? cells.join(' · ') : 'Row',
                              }),
                            },
                          })],
                        }),
                      ],
                      preview: {
                        select: { title: 'caption', headers: 'headers' },
                        prepare: ({ title, headers }) => ({
                          title: title || 'Table',
                          subtitle: Array.isArray(headers) ? headers.join(' · ') : undefined,
                        }),
                      },
                    }),
                    defineArrayMember({
                      type: 'object',
                      name: 'statGrid',
                      title: 'Stat Grid',
                      description: 'A row of 2 to 4 stat cards — our substitute for infographics.',
                      fields: [
                        defineField({
                          name: 'stats',
                          title: 'Stats',
                          type: 'array',
                          validation: Rule => Rule.min(2).max(4),
                          of: [defineArrayMember({
                            type: 'object',
                            name: 'stat',
                            title: 'Stat',
                            fields: [
                              defineField({ name: 'label', title: 'Label', type: 'string', description: 'e.g. "Max Loss"' }),
                              defineField({ name: 'value', title: 'Value', type: 'string', description: 'e.g. "₹6,000"' }),
                              defineField({ name: 'context', title: 'Context (optional)', type: 'string' }),
                            ],
                            preview: { select: { title: 'label', subtitle: 'value' } },
                          })],
                        }),
                      ],
                      preview: {
                        select: { stats: 'stats' },
                        prepare: ({ stats }) => ({
                          title: 'Stat Grid',
                          subtitle: Array.isArray(stats) ? `${stats.length} stats` : undefined,
                        }),
                      },
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
