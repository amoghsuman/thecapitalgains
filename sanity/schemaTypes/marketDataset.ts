import { defineType, defineField, defineArrayMember } from 'sanity'
import { dataStatusOptions } from './portfolio'

// A small labelled table of numbers (asset-class quilt, dispersion matrix).
// rows[].values[] is a key/value list so one schema serves both a
// year-by-year table (keys "2021", "2022", …) and a metrics table
// (keys "cagr", "volatility", …).
export const marketDatasetSchema = defineType({
  name: 'marketDataset',
  title: 'Market Dataset',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'dataStatus',
      title: 'Data status',
      type: 'string',
      options: { list: dataStatusOptions, layout: 'radio' },
      initialValue: 'illustrative',
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'asOf', title: 'As of', type: 'date' }),
    defineField({ name: 'source', title: 'Source', type: 'string' }),
    defineField({
      name: 'rows',
      title: 'Rows',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'sublabel', title: 'Sub-label', type: 'string', description: 'Category, ticker, etc.' }),
            defineField({
              name: 'values',
              title: 'Values',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  fields: [
                    defineField({ name: 'key', title: 'Key', type: 'string', validation: (Rule) => Rule.required() }),
                    defineField({ name: 'value', title: 'Value', type: 'number', validation: (Rule) => Rule.required() }),
                  ],
                  preview: { select: { title: 'key', subtitle: 'value' } },
                }),
              ],
            }),
          ],
          preview: { select: { title: 'label', subtitle: 'sublabel' } },
        }),
      ],
    }),
  ],
  preview: { select: { title: 'name', subtitle: 'dataStatus' } },
})
