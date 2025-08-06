import { pgTable, text, integer, timestamp, boolean, uuid } from 'drizzle-orm/pg-core'

export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  originalPdf: text('original_pdf'), // Store as base64 encoded text
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const lines = pgTable('lines', {
  id: uuid('id').primaryKey().defaultRandom(),
  documentId: uuid('document_id').notNull().references(() => documents.id, { onDelete: 'cascade' }),
  lineNumber: integer('line_number').notNull(),
  text: text('text').notNull(),
  pageNumber: integer('page_number').notNull(),
  isEdited: boolean('is_edited').notNull().default(false),
  editedText: text('edited_text'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Type exports
export type Document = typeof documents.$inferSelect
export type NewDocument = typeof documents.$inferInsert
export type Line = typeof lines.$inferSelect
export type NewLine = typeof lines.$inferInsert