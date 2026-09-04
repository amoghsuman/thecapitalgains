import { defineType, defineField, defineArrayMember } from 'sanity'

// Shared by `body` (top-level lesson content) and `collapsible.content`
// (nested content revealed inside an accordion). Collapsible sections are
// deliberately excluded from this shared list so they can't nest inside
// each other — one level of collapsing is enough for a reading platform,
// and unbounded nesting adds real UI/schema complexity for no clear benefit.
const blockContentTypes = [
  defineArrayMember({
    type: 'block',
    marks: {
      // Overriding `marks` replaces Sanity's default annotation set entirely,
      // so `link` has to be re-declared explicitly here or it would silently
      // stop being available in the editor.
      annotations: [
        defineArrayMember({
          type: 'object',
          name: 'link',
          title: 'Link',
          fields: [defineField({ name: 'href', title: 'URL', type: 'url' })],
        }),
        defineArrayMember({
          type: 'object',
          name: 'glossaryTerm',
          title: 'Glossary Term',
          description: 'Marks the selected text as a glossary term. Rendered with a dotted underline; the definition shows in a tooltip on hover/tap.',
          fields: [defineField({ name: 'definition', title: 'Definition', type: 'text', rows: 2, validation: Rule => Rule.required() })],
        }),
      ],
    },
  }),
  defineArrayMember({
    type: 'object',
    name: 'callout',
    title: 'Callout Box',
    fields: [
      defineField({
        name: 'type',
        title: 'Type',
        type: 'string',
        options: {
          list: [
            { title: 'Insight', value: 'insight' },
            { title: 'Warning', value: 'warning' },
            { title: 'Disclaimer (compliance/scope note)', value: 'disclaimer' },
          ],
        },
      }),
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
            { title: 'Fill in the Blank', value: 'fillInTheBlank' },
            { title: 'Numeric Input', value: 'numericInput' },
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
        description: 'What the learner is asked to do, e.g. "What would you do here?" (scenario) or the question posed before a numeric answer (numericInput).',
        hidden: ({ parent }) => !['scenario', 'numericInput'].includes(parent?.variant),
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
      // ── fillInTheBlank fields ──
      defineField({
        name: 'textWithBlank',
        title: 'Text With Blank',
        type: 'text',
        description: 'Use "___" (three underscores) exactly once to mark where the input goes, e.g. "The premium paid represents the ___ loss for a buyer."',
        hidden: ({ parent }) => parent?.variant !== 'fillInTheBlank',
      }),
      defineField({
        name: 'correctAnswers',
        title: 'Correct Answers',
        type: 'array',
        description: 'Accepted answers (case-insensitive, whitespace-trimmed). List synonyms as separate entries, e.g. ["maximum", "max"].',
        of: [defineArrayMember({ type: 'string' })],
        hidden: ({ parent }) => parent?.variant !== 'fillInTheBlank',
      }),
      // ── numericInput fields ──
      defineField({
        name: 'correctValue',
        title: 'Correct Value',
        type: 'number',
        hidden: ({ parent }) => parent?.variant !== 'numericInput',
      }),
      defineField({
        name: 'tolerance',
        title: 'Tolerance',
        type: 'number',
        description: 'The learner\'s answer is accepted if within this ± range of Correct Value.',
        initialValue: 0,
        hidden: ({ parent }) => parent?.variant !== 'numericInput',
      }),
      defineField({
        name: 'unit',
        title: 'Unit (optional)',
        type: 'string',
        description: 'e.g. "₹" or "%" — shown as a prefix/suffix on the input.',
        hidden: ({ parent }) => parent?.variant !== 'numericInput',
      }),
      // ── shared: quiz, fillInTheBlank, numericInput ──
      defineField({
        name: 'explanation',
        title: 'Explanation',
        type: 'text',
        description: 'Shown after the learner submits an answer.',
        hidden: ({ parent }) => !['quiz', 'fillInTheBlank', 'numericInput'].includes(parent?.variant),
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
  }),
  defineArrayMember({
    type: 'object',
    name: 'chart',
    title: 'Chart',
    description: 'Line, bar, or area chart. Use "Data" alone for a single series. Add "Series" to compare multiple lines/bars sharing the same x-axis categories from Data.',
    fields: [
      defineField({
        name: 'chartType',
        title: 'Chart Type',
        type: 'string',
        options: { list: [{ title: 'Line', value: 'line' }, { title: 'Bar', value: 'bar' }, { title: 'Area', value: 'area' }] },
        initialValue: 'line',
      }),
      defineField({ name: 'title', title: 'Title (optional)', type: 'string' }),
      defineField({ name: 'xAxisLabel', title: 'X-Axis Label (optional)', type: 'string' }),
      defineField({ name: 'yAxisLabel', title: 'Y-Axis Label (optional)', type: 'string' }),
      defineField({
        name: 'data',
        title: 'Data',
        type: 'array',
        description: 'The x-axis categories. For a single-series chart, also supply each point\'s Value here. For multi-series, Value is ignored — use Series below instead.',
        of: [defineArrayMember({
          type: 'object',
          name: 'chartPoint',
          title: 'Point',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string' }),
            defineField({ name: 'value', title: 'Value', type: 'number' }),
          ],
          preview: { select: { title: 'label', subtitle: 'value' } },
        })],
      }),
      defineField({
        name: 'series',
        title: 'Series (optional, for multi-series charts)',
        type: 'array',
        description: 'Each series\' Values array must have the same length and order as Data above (Data supplies the shared x-axis labels).',
        of: [defineArrayMember({
          type: 'object',
          name: 'chartSeries',
          title: 'Series',
          fields: [
            defineField({ name: 'label', title: 'Series Label', type: 'string' }),
            defineField({ name: 'values', title: 'Values', type: 'array', of: [defineArrayMember({ type: 'number' })] }),
          ],
          preview: { select: { title: 'label' } },
        })],
      }),
    ],
    preview: {
      select: { title: 'title', chartType: 'chartType' },
      prepare: ({ title, chartType }) => ({ title: title || 'Chart', subtitle: chartType }),
    },
  }),
  defineArrayMember({
    type: 'object',
    name: 'payoffDiagram',
    title: 'Options/Futures Payoff Diagram',
    description: 'Payoff is calculated automatically from these inputs using standard call/put/futures formulas — you do not need to compute or supply the curve.',
    fields: [
      defineField({
        name: 'instrumentType',
        title: 'Instrument',
        type: 'string',
        options: { list: [{ title: 'Call Option', value: 'call' }, { title: 'Put Option', value: 'put' }, { title: 'Futures', value: 'futures' }] },
        initialValue: 'call',
      }),
      defineField({
        name: 'position',
        title: 'Position',
        type: 'string',
        options: { list: [{ title: 'Long (bought)', value: 'long' }, { title: 'Short (sold/written)', value: 'short' }] },
        initialValue: 'long',
      }),
      defineField({
        name: 'strikePrice',
        title: 'Strike Price',
        type: 'number',
        description: 'For Futures, this is the entry/contracted price.',
        validation: Rule => Rule.required(),
      }),
      defineField({
        name: 'premium',
        title: 'Premium',
        type: 'number',
        description: 'Option premium paid (long) or received (short). Not applicable for Futures.',
        hidden: ({ parent }) => parent?.instrumentType === 'futures',
      }),
      defineField({
        name: 'spotPriceRange',
        title: 'Spot Price Range',
        type: 'object',
        description: 'The x-axis range the diagram is plotted across.',
        fields: [
          defineField({ name: 'min', title: 'Min', type: 'number', validation: Rule => Rule.required() }),
          defineField({ name: 'max', title: 'Max', type: 'number', validation: Rule => Rule.required() }),
        ],
      }),
      defineField({ name: 'caption', title: 'Caption (optional)', type: 'text', rows: 2 }),
    ],
    preview: {
      select: { instrumentType: 'instrumentType', position: 'position', strike: 'strikePrice' },
      prepare: ({ instrumentType, position, strike }) => ({
        title: `${position === 'short' ? 'Short' : 'Long'} ${instrumentType === 'futures' ? 'Futures' : instrumentType === 'put' ? 'Put' : 'Call'}`,
        subtitle: strike !== undefined ? `Strike/Entry: ${strike}` : undefined,
      }),
    },
  }),
  defineArrayMember({
    type: 'object',
    name: 'calculator',
    title: 'Calculator',
    description: 'An embedded interactive calculator. All inputs, defaults, and formulas live in the reader component — this block just selects which calculator to show.',
    fields: [
      defineField({
        name: 'calculatorType',
        title: 'Calculator Type',
        type: 'string',
        options: {
          list: [
            { title: 'SIP Calculator', value: 'sip' },
            { title: 'Capital Gains Tax Calculator', value: 'capitalGainsTax' },
            { title: 'EMI Calculator', value: 'emi' },
          ],
        },
        initialValue: 'sip',
        validation: Rule => Rule.required(),
      }),
    ],
    preview: {
      select: { calculatorType: 'calculatorType' },
      prepare: ({ calculatorType }) => ({ title: 'Calculator', subtitle: calculatorType }),
    },
  }),
  defineArrayMember({
    type: 'object',
    name: 'candlestickChart',
    title: 'Candlestick Chart',
    description: 'OHLC price chart. Standard market convention colors (green close ≥ open, red close < open) are used here regardless of theme, since that convention is essential for readability.',
    fields: [
      defineField({ name: 'title', title: 'Title (optional)', type: 'string' }),
      defineField({
        name: 'data',
        title: 'Candles',
        type: 'array',
        of: [defineArrayMember({
          type: 'object',
          name: 'candle',
          title: 'Candle',
          fields: [
            defineField({ name: 'date', title: 'Date', type: 'string', description: 'e.g. "2024-01-15" — shown as-is on the x-axis.' }),
            defineField({ name: 'open', title: 'Open', type: 'number' }),
            defineField({ name: 'high', title: 'High', type: 'number' }),
            defineField({ name: 'low', title: 'Low', type: 'number' }),
            defineField({ name: 'close', title: 'Close', type: 'number' }),
          ],
          preview: {
            select: { date: 'date', open: 'open', close: 'close' },
            prepare: ({ date, open, close }) => ({ title: date, subtitle: `O:${open} C:${close}` }),
          },
        })],
      }),
    ],
    preview: {
      select: { title: 'title', data: 'data' },
      prepare: ({ title, data }) => ({ title: title || 'Candlestick Chart', subtitle: Array.isArray(data) ? `${data.length} candles` : undefined }),
    },
  }),
  defineArrayMember({
    type: 'object',
    name: 'donutChart',
    title: 'Donut / Allocation Chart',
    fields: [
      defineField({ name: 'title', title: 'Title (optional)', type: 'string' }),
      defineField({
        name: 'data',
        title: 'Data',
        type: 'array',
        of: [defineArrayMember({
          type: 'object',
          name: 'donutSlice',
          title: 'Slice',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string' }),
            defineField({ name: 'value', title: 'Value', type: 'number' }),
          ],
          preview: { select: { title: 'label', subtitle: 'value' } },
        })],
      }),
    ],
    preview: {
      select: { title: 'title' },
      prepare: ({ title }) => ({ title: title || 'Donut Chart' }),
    },
  }),
  defineArrayMember({
    type: 'object',
    name: 'codeBlock',
    title: 'Code Block',
    fields: [
      defineField({
        name: 'language',
        title: 'Language',
        type: 'string',
        options: { list: [{ title: 'Python', value: 'python' }, { title: 'SQL', value: 'sql' }] },
        initialValue: 'python',
      }),
      defineField({ name: 'code', title: 'Code', type: 'text', rows: 10 }),
      defineField({ name: 'caption', title: 'Caption (optional)', type: 'string' }),
    ],
    preview: {
      select: { language: 'language', caption: 'caption' },
      prepare: ({ language, caption }) => ({ title: caption || 'Code Block', subtitle: language }),
    },
  }),
  defineArrayMember({
    type: 'object',
    name: 'timeline',
    title: 'Timeline',
    description: 'A vertical timeline — good for historical sequencing or case-study walkthroughs.',
    fields: [
      defineField({ name: 'title', title: 'Title (optional)', type: 'string' }),
      defineField({
        name: 'events',
        title: 'Events',
        type: 'array',
        of: [defineArrayMember({
          type: 'object',
          name: 'timelineEvent',
          title: 'Event',
          fields: [
            defineField({ name: 'date', title: 'Date', type: 'string', description: 'e.g. "2008" or "March 2008"' }),
            defineField({ name: 'title', title: 'Event Title', type: 'string' }),
            defineField({ name: 'description', title: 'Description', type: 'text' }),
          ],
          preview: { select: { title: 'title', subtitle: 'date' } },
        })],
      }),
    ],
    preview: {
      select: { title: 'title' },
      prepare: ({ title }) => ({ title: title || 'Timeline' }),
    },
  }),
  defineArrayMember({
    type: 'object',
    name: 'annotatedImage',
    title: 'Annotated Image',
    description: 'For chart patterns and other visuals that need a real screenshot/photo rather than a data-driven chart.',
    fields: [
      defineField({ name: 'image', title: 'Image', type: 'image', options: { hotspot: true }, validation: Rule => Rule.required() }),
      defineField({ name: 'caption', title: 'Caption (optional)', type: 'string' }),
      defineField({
        name: 'annotations',
        title: 'Annotations',
        type: 'array',
        description: 'Overlay labels positioned by percentage over the image (0,0 = top-left corner; 100,100 = bottom-right corner).',
        of: [defineArrayMember({
          type: 'object',
          name: 'imageAnnotation',
          title: 'Annotation',
          fields: [
            defineField({ name: 'x', title: 'X Position (%)', type: 'number', validation: Rule => Rule.min(0).max(100) }),
            defineField({ name: 'y', title: 'Y Position (%)', type: 'number', validation: Rule => Rule.min(0).max(100) }),
            defineField({ name: 'label', title: 'Label', type: 'string' }),
          ],
          preview: { select: { title: 'label' } },
        })],
      }),
    ],
    preview: {
      select: { caption: 'caption', media: 'image' },
      prepare: ({ caption, media }) => ({ title: caption || 'Annotated Image', media }),
    },
  }),
  defineArrayMember({
    type: 'object',
    name: 'comparison',
    title: 'Comparison',
    description: 'Generic two-column comparison — pros/cons, old vs new, etc.',
    fields: [
      defineField({ name: 'title', title: 'Title (optional)', type: 'string' }),
      defineField({
        name: 'columns',
        title: 'Columns',
        type: 'array',
        validation: Rule => Rule.length(2),
        of: [defineArrayMember({
          type: 'object',
          name: 'comparisonColumn',
          title: 'Column',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string' }),
            defineField({ name: 'points', title: 'Points', type: 'array', of: [defineArrayMember({ type: 'string' })] }),
          ],
          preview: { select: { title: 'label' } },
        })],
      }),
    ],
    preview: {
      select: { title: 'title' },
      prepare: ({ title }) => ({ title: title || 'Comparison' }),
    },
  }),
  defineArrayMember({
    type: 'object',
    name: 'flashcardSet',
    title: 'Flashcard Set',
    description: 'Term/definition pairs, click or tap to flip. High-value for exam-prep content where rapid term recall matters.',
    fields: [
      defineField({ name: 'title', title: 'Title (optional)', type: 'string' }),
      defineField({
        name: 'cards',
        title: 'Cards',
        type: 'array',
        of: [defineArrayMember({
          type: 'object',
          name: 'flashcard',
          title: 'Card',
          fields: [
            defineField({ name: 'term', title: 'Term', type: 'string' }),
            defineField({ name: 'definition', title: 'Definition', type: 'text' }),
          ],
          preview: { select: { title: 'term' } },
        })],
      }),
    ],
    preview: {
      select: { title: 'title', cards: 'cards' },
      prepare: ({ title, cards }) => ({ title: title || 'Flashcard Set', subtitle: Array.isArray(cards) ? `${cards.length} cards` : undefined }),
    },
  }),
  defineArrayMember({
    type: 'object',
    name: 'toolLink',
    title: 'External Tool Link',
    fields: [
      defineField({ name: 'label', title: 'Label', type: 'string' }),
      defineField({ name: 'url', title: 'URL', type: 'url' }),
      defineField({ name: 'description', title: 'Description (optional)', type: 'text', rows: 2 }),
    ],
    preview: { select: { title: 'label', subtitle: 'url' } },
  }),
  defineArrayMember({
    type: 'object',
    name: 'bigIdea',
    title: 'Big Idea',
    description: 'One large stylized takeaway statement — reserve this for the single most important idea in a lesson.',
    fields: [
      defineField({ name: 'text', title: 'Text', type: 'text', rows: 3, validation: Rule => Rule.required() }),
    ],
    preview: {
      select: { title: 'text' },
      prepare: ({ title }) => ({ title: title || 'Big Idea' }),
    },
  }),
  defineArrayMember({
    type: 'object',
    name: 'keyTakeaways',
    title: 'Key Takeaways',
    description: 'Closing bullet summary — typically placed near the end of a lesson.',
    fields: [
      defineField({ name: 'points', title: 'Points', type: 'array', of: [defineArrayMember({ type: 'string' })] }),
    ],
    preview: {
      select: { points: 'points' },
      prepare: ({ points }) => ({ title: 'Key Takeaways', subtitle: Array.isArray(points) ? `${points.length} points` : undefined }),
    },
  }),
]

export const lessonSchema = defineType({
  name: 'lesson',
  title: 'Lesson',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Lesson Title', type: 'string', validation: Rule => Rule.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: Rule => Rule.required() }),
    defineField({ name: 'duration', title: 'Duration', type: 'string', description: 'e.g. 8 min' }),
    defineField({ name: 'isFree', title: 'Free Preview?', type: 'boolean', initialValue: false }),
    defineField({
      name: 'body',
      title: 'Lesson Content',
      type: 'array',
      of: [
        ...blockContentTypes,
        defineArrayMember({
          type: 'object',
          name: 'collapsible',
          title: 'Collapsible Section',
          description: 'Renders as an accordion, collapsed by default. Can contain any block type except another collapsible section.',
          fields: [
            defineField({ name: 'title', title: 'Title', type: 'string', description: 'e.g. "Show me the math"', validation: Rule => Rule.required() }),
            defineField({ name: 'content', title: 'Content', type: 'array', of: blockContentTypes }),
          ],
          preview: {
            select: { title: 'title' },
            prepare: ({ title }) => ({ title: title || 'Collapsible Section' }),
          },
        }),
      ]
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'duration' },
  },
})
