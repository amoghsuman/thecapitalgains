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
              .title('Courses by Learning Path')
              .child(
                S.list()
                  .title('Learning Paths')
                  .items([
                    S.listItem()
                      .title('Stock Market Basics')
                      .child(
                        S.documentList()
                          .title('Stock Market Basics')
                          .filter('_type == "course" && learningPath == "stock-market-basics"')
                          .defaultOrdering([{ field: 'orderRank', direction: 'asc' }, { field: 'title', direction: 'asc' }])
                      ),
                    S.listItem()
                      .title('Value Investing')
                      .child(
                        S.documentList()
                          .title('Value Investing')
                          .filter('_type == "course" && learningPath == "value-investing"')
                          .defaultOrdering([{ field: 'orderRank', direction: 'asc' }, { field: 'title', direction: 'asc' }])
                      ),
                    S.listItem()
                      .title('Momentum Investing')
                      .child(
                        S.documentList()
                          .title('Momentum Investing')
                          .filter('_type == "course" && learningPath == "momentum-investing"')
                          .defaultOrdering([{ field: 'orderRank', direction: 'asc' }, { field: 'title', direction: 'asc' }])
                      ),
                    S.listItem()
                      .title('Technical Trading')
                      .child(
                        S.documentList()
                          .title('Technical Trading')
                          .filter('_type == "course" && learningPath == "technical-trading"')
                          .defaultOrdering([{ field: 'orderRank', direction: 'asc' }, { field: 'title', direction: 'asc' }])
                      ),
                    S.listItem()
                      .title('Options & Derivatives')
                      .child(
                        S.documentList()
                          .title('Options & Derivatives')
                          .filter('_type == "course" && learningPath == "options-derivatives"')
                          .defaultOrdering([{ field: 'orderRank', direction: 'asc' }, { field: 'title', direction: 'asc' }])
                      ),
                    S.listItem()
                      .title('Mutual Funds & ETFs')
                      .child(
                        S.documentList()
                          .title('Mutual Funds & ETFs')
                          .filter('_type == "course" && learningPath == "mutual-funds-etfs"')
                          .defaultOrdering([{ field: 'orderRank', direction: 'asc' }, { field: 'title', direction: 'asc' }])
                      ),
                    S.listItem()
                      .title('Investment Banking')
                      .child(
                        S.documentList()
                          .title('Investment Banking')
                          .filter('_type == "course" && learningPath == "investment-banking"')
                          .defaultOrdering([{ field: 'orderRank', direction: 'asc' }, { field: 'title', direction: 'asc' }])
                      ),
                    S.listItem()
                      .title('CFA Preparation')
                      .child(
                        S.documentList()
                          .title('CFA Preparation')
                          .filter('_type == "course" && learningPath == "cfa-prep"')
                          .defaultOrdering([{ field: 'orderRank', direction: 'asc' }, { field: 'title', direction: 'asc' }])
                      ),
                    S.listItem()
                      .title('FRM Preparation')
                      .child(
                        S.documentList()
                          .title('FRM Preparation')
                          .filter('_type == "course" && learningPath == "frm-prep"')
                          .defaultOrdering([{ field: 'orderRank', direction: 'asc' }, { field: 'title', direction: 'asc' }])
                      ),
                    S.listItem()
                      .title('Financial Modelling')
                      .child(
                        S.documentList()
                          .title('Financial Modelling')
                          .filter('_type == "course" && learningPath == "financial-modelling"')
                          .defaultOrdering([{ field: 'orderRank', direction: 'asc' }, { field: 'title', direction: 'asc' }])
                      ),
                    S.listItem()
                      .title('Quant Finance')
                      .child(
                        S.documentList()
                          .title('Quant Finance')
                          .filter('_type == "course" && learningPath == "quant-finance"')
                          .defaultOrdering([{ field: 'orderRank', direction: 'asc' }, { field: 'title', direction: 'asc' }])
                      ),
                    S.listItem()
                      .title('All Courses')
                      .child(
                        S.documentList()
                          .title('All Courses')
                          .filter('_type == "course"')
                          .defaultOrdering([{ field: 'learningPath', direction: 'asc' }, { field: 'orderRank', direction: 'asc' }, { field: 'title', direction: 'asc' }])
                      ),
                  ])
              ),
          ]),
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
})
