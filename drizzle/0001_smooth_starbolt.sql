ALTER TABLE `projects` ADD `slug` text;--> statement-breakpoint
ALTER TABLE `projects` ADD `duration` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` ADD `context` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` ADD `challenge` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` ADD `approach` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` ADD `metrics` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` ADD `results` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` ADD `closing` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` ADD `case_study` integer DEFAULT false NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `projects_slug_unique` ON `projects` (`slug`);