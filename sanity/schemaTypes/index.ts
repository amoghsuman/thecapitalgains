import { type SchemaTypeDefinition } from 'sanity'
import { courseSchema } from './course'
import { lessonSchema } from './lesson'
import { personaSchema } from './persona'
import { investingGoalSchema } from './investingGoal'
import { learningPathSchema } from './learningPath'

export const schemaTypes = [courseSchema, lessonSchema, personaSchema, investingGoalSchema, learningPathSchema]

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [courseSchema, lessonSchema, personaSchema, investingGoalSchema, learningPathSchema],
}
