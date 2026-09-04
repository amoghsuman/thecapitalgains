import type {StructureResolver} from 'sanity/structure'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.documentTypeListItem('course').title('Courses'),
      S.listItem()
        .title('All Lessons')
        .schemaType('lesson')
        .child(
          S.documentTypeList('lesson')
            .title('All Lessons')
            .defaultOrdering([{ field: 'title', direction: 'asc' }])
        ),
    ])
