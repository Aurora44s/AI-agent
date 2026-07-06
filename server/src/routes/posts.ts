import { Router, Request, Response } from "express";
import { db } from "../db";
import { posts, tags, postTags } from "../db/schema";
import { eq, desc, and, like, or } from "drizzle-orm";

const router = Router();

// 公开 API：获取已发布文章列表
router.get("/", async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const tagSlug = req.query.tag as string | undefined;
    const search = req.query.search as string | undefined;
    const offset = (page - 1) * limit;

    const conditions = [eq(posts.isPublished, 1)];

    let postIds: number[] | undefined;
    if (tagSlug) {
      const tagResult = await db.select().from(tags).where(eq(tags.slug, tagSlug)).limit(1);
      if (tagResult.length === 0) {
        res.json({ posts: [], total: 0 });
        return;
      }
      const tagId = tagResult[0].id;
      const relations = await db.select().from(postTags).where(eq(postTags.tagId, tagId));
      postIds = relations.map((r) => r.postId);
      if (postIds.length === 0) {
        res.json({ posts: [], total: 0 });
        return;
      }
    }

    const allPosts = await db.select().from(posts).where(and(...conditions));

    let filteredPosts = allPosts;
    if (postIds) {
      filteredPosts = allPosts.filter((p) => postIds!.includes(p.id));
    }
    if (search) {
      const keyword = `%${search}%`;
      filteredPosts = filteredPosts.filter(
        (p) =>
          p.title.includes(search) ||
          (p.excerpt && p.excerpt.includes(search))
      );
    }

    const total = filteredPosts.length;
    const pagedPosts = filteredPosts.slice(offset, offset + limit);

    // 获取每篇文章的标签
    const postsWithTags = await Promise.all(
      pagedPosts.map(async (post) => {
        const postTagRelations = await db
          .select()
          .from(postTags)
          .where(eq(postTags.postId, post.id));
        const tagList = await Promise.all(
          postTagRelations.map(async (pt) => {
            const result = await db.select().from(tags).where(eq(tags.id, pt.tagId));
            return result[0];
          })
        );
        return { ...post, tags: tagList.filter(Boolean) };
      })
    );

    res.json({ posts: postsWithTags, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "获取文章列表失败" });
  }
});

// 公开 API：获取单篇文章
router.get("/:slug", async (req: Request, res: Response) => {
  try {
    const result = await db.select().from(posts).where(eq(posts.slug, req.params.slug)).limit(1);
    if (result.length === 0) {
      res.status(404).json({ error: "文章不存在" });
      return;
    }

    const post = result[0];

    // 获取标签
    const ptRelations = await db.select().from(postTags).where(eq(postTags.postId, post.id));
    const tagList = await Promise.all(
      ptRelations.map(async (pt) => {
        const t = await db.select().from(tags).where(eq(tags.id, pt.tagId));
        return t[0];
      })
    );

    res.json({ ...post, tags: tagList.filter(Boolean) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "获取文章失败" });
  }
});

export default router;
