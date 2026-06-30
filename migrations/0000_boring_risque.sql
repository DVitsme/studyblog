CREATE TABLE `domains` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`section_slug` text NOT NULL,
	`exam` text NOT NULL,
	`domain_ref` text NOT NULL,
	`name` text NOT NULL,
	`weight` integer DEFAULT 0 NOT NULL,
	`sort` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`section_slug`) REFERENCES `sections`(`slug`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `domains_domain_ref_unique` ON `domains` (`domain_ref`);--> statement-breakpoint
CREATE INDEX `domains_section_idx` ON `domains` (`section_slug`,`sort`);--> statement-breakpoint
CREATE TABLE `media` (
	`key` text PRIMARY KEY NOT NULL,
	`filename` text NOT NULL,
	`content_type` text NOT NULL,
	`size` integer NOT NULL,
	`width` integer,
	`height` integer,
	`alt` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `post_tags` (
	`post_id` integer NOT NULL,
	`tag_id` integer NOT NULL,
	PRIMARY KEY(`post_id`, `tag_id`),
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `post_tags_tag_idx` ON `post_tags` (`tag_id`);--> statement-breakpoint
CREATE TABLE `posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`excerpt` text,
	`body_md` text NOT NULL,
	`type` text NOT NULL,
	`section_slug` text NOT NULL,
	`domain_id` integer,
	`exam` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`featured` integer DEFAULT false NOT NULL,
	`cover_image_key` text,
	`reading_minutes` integer,
	`repo_url` text,
	`demo_url` text,
	`project_meta` text,
	`seo_title` text,
	`seo_description` text,
	`published_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`section_slug`) REFERENCES `sections`(`slug`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`domain_id`) REFERENCES `domains`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `posts_slug_unique` ON `posts` (`slug`);--> statement-breakpoint
CREATE INDEX `posts_status_pub_idx` ON `posts` (`status`,`published_at`);--> statement-breakpoint
CREATE INDEX `posts_section_idx` ON `posts` (`section_slug`);--> statement-breakpoint
CREATE INDEX `posts_domain_idx` ON `posts` (`domain_id`);--> statement-breakpoint
CREATE INDEX `posts_type_idx` ON `posts` (`type`);--> statement-breakpoint
CREATE TABLE `sections` (
	`slug` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`exam_codes` text,
	`blurb` text,
	`sort` integer DEFAULT 0 NOT NULL,
	`active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`group` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_slug_unique` ON `tags` (`slug`);