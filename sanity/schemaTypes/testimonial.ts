import { defineType, defineField } from 'sanity'

// A student testimonial. Only documents with consentReceived == true are ever
// fetched by the site (see getTestimonials in lib/sanity/queries.ts).
export const testimonialSchema = defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'role', title: 'Role', type: 'string' }),
    defineField({ name: 'city', title: 'City', type: 'string' }),
    defineField({ name: 'quote', title: 'Quote', type: 'text', rows: 4, validation: (Rule) => Rule.required() }),
    defineField({ name: 'course', title: 'Course', type: 'reference', to: [{ type: 'course' }] }),
    defineField({
      name: 'rating',
      title: 'Rating (1-5)',
      type: 'number',
      validation: (Rule) => Rule.required().min(1).max(5).integer(),
    }),
    defineField({
      name: 'consentReceived',
      title: 'Consent received',
      type: 'boolean',
      description: 'The person has agreed in writing to be quoted by name. Unchecked testimonials are never published.',
      initialValue: false,
    }),
    defineField({ name: 'consentDate', title: 'Consent date', type: 'date' }),
    defineField({ name: 'photo', title: 'Photo', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'publishedAt', title: 'Published at', type: 'datetime' }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'role', media: 'photo' },
  },
})
