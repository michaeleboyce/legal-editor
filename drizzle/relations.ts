import { relations } from "drizzle-orm/relations";
import { document, line } from "./schema";

export const lineRelations = relations(line, ({one}) => ({
	document: one(document, {
		fields: [line.documentId],
		references: [document.id]
	}),
}));

export const documentRelations = relations(document, ({many}) => ({
	lines: many(line),
}));