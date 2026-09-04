import { type SchemaTypeDefinition } from 'sanity'
import { courseSchema } from './course'
import { lessonSchema } from './lesson'

export const schemaTypes = [courseSchema, lessonSchema]

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [courseSchema, lessonSchema],
}
