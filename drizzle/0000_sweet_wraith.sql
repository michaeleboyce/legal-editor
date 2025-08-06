-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `Document` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`originalPdf` blob,
	`createdAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` numeric NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Line` (
	`id` text PRIMARY KEY NOT NULL,
	`documentId` text NOT NULL,
	`lineNumber` integer NOT NULL,
	`text` text NOT NULL,
	`pageNumber` integer NOT NULL,
	`isEdited` numeric DEFAULT false NOT NULL,
	`editedText` text,
	FOREIGN KEY (`documentId`) REFERENCES `Document`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Line_documentId_lineNumber_key` ON `Line` (`documentId`,`lineNumber`);
*/