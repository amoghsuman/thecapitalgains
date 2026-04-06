'use client'

import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'

import { apiVersion, dataset, projectId } from './sanity/env'
import { schema } from './sanity/schemaTypes'

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  schema,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Courses by Track')
              .child(
                S.list()
                  .title('Tracks')
                  .items([
                    S.listItem()
                      .title('Retail Investor')
                      .child(
                        S.documentList()
                          .title('Retail Investor Courses')
                          .filter('_type == "course" && track == "retail"')
                          .defaultOrdering([{ field: 'orderRank', direction: 'asc' }, { field: 'title', direction: 'asc' }])
                      ),
                    S.listItem()
                      .title('Career Pathways')
                      .child(
                        S.documentList()
                          .title('Career Pathways Courses')
                          .filter('_type == "course" && track == "career"')
                          .defaultOrdering([{ field: 'orderRank', direction: 'asc' }, { field: 'title', direction: 'asc' }])
                      ),
                    S.listItem()
                      .title('Quant & Tech')
                      .child(
                        S.documentList()
                          .title('Quant & Tech Courses')
                          .filter('_type == "course" && track == "quant"')
                          .defaultOrdering([{ field: 'orderRank', direction: 'asc' }, { field: 'title', direction: 'asc' }])
                      ),
                    S.listItem()
                      .title('Corporate Finance')
                      .child(
                        S.documentList()
                          .title('Corporate Finance Courses')
                          .filter('_type == "course" && track == "corporate"')
                          .defaultOrdering([{ field: 'orderRank', direction: 'asc' }, { field: 'title', direction: 'asc' }])
                      ),
                    S.listItem()
                      .title('All Courses')
                      .child(
                        S.documentList()
                          .title('All Courses')
                          .filter('_type == "course"')
                          .defaultOrdering([{ field: 'track', direction: 'asc' }, { field: 'orderRank', direction: 'asc' }, { field: 'title', direction: 'asc' }])
                      ),
                  ])
              ),
          ]),
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
})
