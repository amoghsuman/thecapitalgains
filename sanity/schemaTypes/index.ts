import { type SchemaTypeDefinition } from 'sanity'
import { courseSchema } from './course'

export const schemaTypes = [courseSchema]

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [courseSchema],
}
