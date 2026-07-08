import { mysqlTable, int, varchar, text, tinyint, datetime, primaryKey } from "drizzle-orm/mysql-core";

// 文章表
export const posts = mysqlTable("posts", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content").notNull(),
  excerpt: varchar("excerpt", { length: 500 }),
  coverImage: varchar("cover_image", { length: 500 }),
  isPublished: tinyint("is_published").default(0),
  createdAt: datetime("created_at").notNull(),
  updatedAt: datetime("updated_at").notNull(),
});

// 标签表
export const tags = mysqlTable("tags", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
});

// 文章-标签关联表
export const postTags = mysqlTable(
  "post_tags",
  {
    postId: int("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
    tagId: int("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.postId, table.tagId] }),
  })
);

// 站点设置表
export const settings = mysqlTable("settings", {
  key: varchar("key", { length: 100 }).primaryKey(),
  value: text("value").notNull(),
});

// 聊天消息表
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  nickname: varchar("nickname", { length: 50 }).notNull(),
  content: text("content").notNull(),
  createdAt: datetime("created_at").notNull(),
});

// 歌曲表
export const songs = mysqlTable("songs", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  artist: varchar("artist", { length: 255 }).default(""),
  filePath: varchar("file_path", { length: 500 }).notNull(),
  coverPath: varchar("cover_path", { length: 500 }).default(""),
  lrcContent: text("lrc_content"),
  createdAt: datetime("created_at").notNull(),
});
