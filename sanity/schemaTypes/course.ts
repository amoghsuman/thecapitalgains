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
