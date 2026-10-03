CREATE TABLE `rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	`window_start` integer NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `projects` ADD `visual_style` text DEFAULT 'process' NOT NULL;--> statement-breakpoint
ALTER TABLE `settings` ADD `content_verified` integer DEFAULT false NOT NULL;