CREATE TABLE `rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`window_start` integer NOT NULL,
	`count` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `rate_limits_window_idx` ON `rate_limits` (`window_start`);--> statement-breakpoint
ALTER TABLE `audit_log` ADD `event` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `audit_log` ADD `ip_hash` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `audit_log` ADD `user_agent` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `audit_log` ADD `diff` text DEFAULT '' NOT NULL;--> statement-breakpoint
CREATE INDEX `audit_created_idx` ON `audit_log` (`created_at`);--> statement-breakpoint
CREATE INDEX `audit_action_idx` ON `audit_log` (`action`,`created_at`);--> statement-breakpoint
ALTER TABLE `users` ADD `session_epoch` integer DEFAULT 0 NOT NULL;