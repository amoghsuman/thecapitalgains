import { type SchemaTypeDefinition } from 'sanity'
import { courseSchema } from './course'
import { lessonSchema } from './lesson'
import { personaSchema } from './persona'
import { investingGoalSchema } from './investingGoal'
import { learningPathSchema } from './learningPath'
import { portfolioSchema } from './portfolio'
import { marketDatasetSchema } from './marketDataset'
import { testimonialSchema } from './testimonial'
import { learningPathMetaSchema } from './learningPathMeta'
import { glossaryTermSchema } from './glossaryTerm'
import { marketFactCardSchema } from './marketFactCard'

export const schemaTypes = [
  courseSchema,
  lessonSchema,
  personaSchema,
  investingGoalSchema,
  learningPathSchema,
  portfolioSchema,
  marketDatasetSchema,
  testimonialSchema,
  learningPathMetaSchema,
  glossaryTermSchema,
  marketFactCardSchema,
]

export const schema: { types: SchemaTypeDefinition[] } = {
  types: schemaTypes,
}
