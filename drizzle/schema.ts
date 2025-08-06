import { sqliteTable, AnySQLiteColumn, text, blob, numeric, uniqueIndex, foreignKey, integer } from "drizzle-orm/sqlite-core"
  import { sql } from "drizzle-orm"

export const document = sqliteTable("Document", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	originalPdf: blob(),
	createdAt: numeric().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
	updatedAt: numeric().notNull(),
});

export const line = sqliteTable("Line", {
	id: text().primaryKey().notNull(),
	documentId: text().notNull().references(() => document.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	lineNumber: integer().notNull(),
	text: text().notNull(),
	pageNumber: integer().notNull(),
	isEdited: numeric().notNull(),
	editedText: text(),
},
(table) => [
	uniqueIndex("Line_documentId_lineNumber_key").on(table.documentId, table.lineNumber),
]);

