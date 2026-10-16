CREATE TABLE `analytics_events` (
	`id` text PRIMARY KEY NOT NULL,
	`visitor_id` text NOT NULL,
	`session_id` text NOT NULL,
	`page_id` text NOT NULL,
	`name` text NOT NULL,
	`path` text NOT NULL,
	`label` text DEFAULT '' NOT NULL,
	`source` text DEFAULT 'Directo' NOT NULL,
	`campaign` text DEFAULT '' NOT NULL,
	`device` text NOT NULL,
	`browser` text NOT NULL,
	`country` text DEFAULT 'Desconocido' NOT NULL,
	`value` real DEFAULT 0 NOT NULL,
	`active_seconds` integer DEFAULT 0 NOT NULL,
	`scroll_depth` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `analytics_created_idx` ON `analytics_events` (`created_at`);--> statement-breakpoint
CREATE INDEX `analytics_session_idx` ON `analytics_events` (`session_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `analytics_name_idx` ON `analytics_events` (`name`,`created_at`);