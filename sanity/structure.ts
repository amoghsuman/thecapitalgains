import type { StructureResolver } from 'sanity/structure'
import { LEARNING_PATHS } from './lib/learningPaths'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
//
// Flat top level: every Learning Path, plus "All Courses" and "All Lessons",
// sit directly in the Content sidebar — no intermediate wrapper folder.
// Per-path lists are generated from the shared LEARNING_PATHS list rather
// than hand-duplicated here, so this can't drift out of sync with the
// schema's options list the way the old inline structure (formerly defined
// directly in sanity.config.ts, now replaced by this file) had.
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      ...LEARNING_PATHS.map(path =>
        S.listItem()
          .title(path.title)
          .child(
            S.documentList()
              .title(path.title)
              .filter('_type == "course" && learningPath == $learningPath')
              .params({ learningPath: path.value })
              .defaultOrdering([{ field: 'orderRank', direction: 'asc' }, { field: 'title', direction: 'asc' }])
          )
      ),
      S.divider(),
      S.listItem()
        .title('All Courses')
        .child(
          S.documentList()
            .title('All Courses')
            .filter('_type == "course"')
            .defaultOrdering([{ field: 'learningPath', direction: 'asc' }, { field: 'orderRank', direction: 'asc' }, { field: 'title', direction: 'asc' }])
        ),
      S.listItem()
        .title('All Lessons')
        .schemaType('lesson')
        .child(
          S.documentList()
            .title('All Lessons')
            .filter('_type == "lesson"')
            .defaultOrdering([{ field: 'title', direction: 'asc' }])
        ),
      S.divider(),
      // Find Your Path content — not in the default auto-generated list
      // (this custom structure replaces that entirely), so these three need
      // explicit entries or they'd be uneditable in Studio despite existing
      // in the schema.
      S.listItem()
        .title('Personas')
        .schemaType('persona')
        .child(
          S.documentList()
            .title('Personas')
            .filter('_type == "persona"')
            .defaultOrdering([{ field: 'order', direction: 'asc' }])
        ),
      S.listItem()
        .title('Investing Goals')
        .schemaType('investingGoal')
        .child(
          S.documentList()
            .title('Investing Goals')
            .filter('_type == "investingGoal"')
            .defaultOrdering([{ field: 'title', direction: 'asc' }])
        ),
      S.listItem()
        .title('Learning Paths (Find Your Path)')
        .schemaType('learningPath')
        .child(
          S.documentList()
            .title('Learning Paths (Find Your Path)')
            .filter('_type == "learningPath"')
            .defaultOrdering([{ field: 'order', direction: 'asc' }])
        ),
    ])
