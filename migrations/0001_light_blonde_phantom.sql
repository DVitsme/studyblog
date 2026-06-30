PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_posts` (
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
	FOREIGN KEY (`domain_id`) REFERENCES `domains`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "posts_type_chk" CHECK("__new_posts"."type" in ('concept','cram','lab','troubleshooting','practice-exam','study-guide','journal','project','resources')),
	CONSTRAINT "posts_status_chk" CHECK("__new_posts"."status" in ('draft','published'))
);
--> statement-breakpoint
INSERT INTO `__new_posts`("id", "slug", "title", "excerpt", "body_md", "type", "section_slug", "domain_id", "exam", "status", "featured", "cover_image_key", "reading_minutes", "repo_url", "demo_url", "project_meta", "seo_title", "seo_description", "published_at", "created_at", "updated_at") SELECT "id", "slug", "title", "excerpt", "body_md", "type", "section_slug", "domain_id", "exam", "status", "featured", "cover_image_key", "reading_minutes", "repo_url", "demo_url", "project_meta", "seo_title", "seo_description", "published_at", "created_at", "updated_at" FROM `posts`;--> statement-breakpoint
DROP TABLE `posts`;--> statement-breakpoint
ALTER TABLE `__new_posts` RENAME TO `posts`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `posts_slug_unique` ON `posts` (`slug`);--> statement-breakpoint
CREATE INDEX `posts_status_pub_idx` ON `posts` (`status`,`published_at`);--> statement-breakpoint
CREATE INDEX `posts_section_idx` ON `posts` (`section_slug`);--> statement-breakpoint
CREATE INDEX `posts_domain_idx` ON `posts` (`domain_id`);--> statement-breakpoint
CREATE INDEX `posts_type_idx` ON `posts` (`type`);