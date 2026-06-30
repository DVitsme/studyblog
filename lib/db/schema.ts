import { sqliteTable, text, integer, primaryKey, index, check } from "drizzle-orm/sqlite-core";
import { sql, relations } from "drizzle-orm";
// Relative import (not @/) so drizzle-kit's bundler resolves it during `generate`.
import { POST_TYPES, POST_STATUSES } from "../taxonomy";

// See plan/03-data-model.md for the full design rationale.

export const sections = sqliteTable("sections", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull(),
  examCodes: text("exam_codes"),
  blurb: text("blurb"),
  sort: integer("sort").notNull().default(0),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
});

export const domains = sqliteTable(
  "domains",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    sectionSlug: text("section_slug")
      .notNull()
      .references(() => sections.slug),
    exam: text("exam").notNull(),
    domainRef: text("domain_ref").notNull().unique(),
    name: text("name").notNull(),
    weight: integer("weight").notNull().default(0),
    sort: integer("sort").notNull().default(0),
  },
  (t) => [index("domains_section_idx").on(t.sectionSlug, t.sort)],
);

export type ProjectMeta = {
  goal: string;
  stack: string[];
  duration?: string;
  status?: string;
  metrics?: string[];
};

export const posts = sqliteTable(
  "posts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    excerpt: text("excerpt"),
    bodyMd: text("body_md").notNull(),
    type: text("type", { enum: POST_TYPES }).notNull(),
    sectionSlug: text("section_slug")
      .notNull()
      .references(() => sections.slug),
    domainId: integer("domain_id").references(() => domains.id),
    exam: text("exam"),
    status: text("status", { enum: POST_STATUSES }).notNull().default("draft"),
    featured: integer("featured", { mode: "boolean" }).notNull().default(false),
    coverImageKey: text("cover_image_key"),
    readingMinutes: integer("reading_minutes"),
    repoUrl: text("repo_url"),
    demoUrl: text("demo_url"),
    projectMeta: text("project_meta", { mode: "json" }).$type<ProjectMeta | null>(),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    publishedAt: integer("published_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [
    index("posts_status_pub_idx").on(t.status, t.publishedAt),
    index("posts_section_idx").on(t.sectionSlug),
    index("posts_domain_idx").on(t.domainId),
    index("posts_type_idx").on(t.type),
    check(
      "posts_type_chk",
      sql`${t.type} in ('concept','cram','lab','troubleshooting','practice-exam','study-guide','journal','project','resources')`,
    ),
    check("posts_status_chk", sql`${t.status} in ('draft','published')`),
  ],
);

export const tags = sqliteTable("tags", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  group: text("group"),
});

export const postTags = sqliteTable(
  "post_tags",
  {
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.postId, t.tagId] }), index("post_tags_tag_idx").on(t.tagId)],
);

export const media = sqliteTable("media", {
  key: text("key").primaryKey(),
  filename: text("filename").notNull(),
  contentType: text("content_type").notNull(),
  size: integer("size").notNull(),
  width: integer("width"),
  height: integer("height"),
  alt: text("alt"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ---- Relations (for the query builder) ----
export const sectionsRelations = relations(sections, ({ many }) => ({
  domains: many(domains),
  posts: many(posts),
}));
export const domainsRelations = relations(domains, ({ one, many }) => ({
  section: one(sections, { fields: [domains.sectionSlug], references: [sections.slug] }),
  posts: many(posts),
}));
export const postsRelations = relations(posts, ({ one, many }) => ({
  section: one(sections, { fields: [posts.sectionSlug], references: [sections.slug] }),
  domain: one(domains, { fields: [posts.domainId], references: [domains.id] }),
  postTags: many(postTags),
}));
export const tagsRelations = relations(tags, ({ many }) => ({ postTags: many(postTags) }));
export const postTagsRelations = relations(postTags, ({ one }) => ({
  post: one(posts, { fields: [postTags.postId], references: [posts.id] }),
  tag: one(tags, { fields: [postTags.tagId], references: [tags.id] }),
}));

export type Section = typeof sections.$inferSelect;
export type Domain = typeof domains.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type Media = typeof media.$inferSelect;
