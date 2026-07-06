import { Router, Request, Response } from "express";
import { db } from "../db";
import { posts, tags, postTags, settings } from "../db/schema";
import { eq, and } from "drizzle-orm";

const router = Router();

// 获取全部文章（含草稿）
router.get("/", async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const allPosts = await db.select().from(posts).orderBy(posts.createdAt);
    const total = allPosts.length;
    const pagedPosts = allPosts.slice(offset, offset + limit);

    const postsWithTags = await Promise.all(
      pagedPosts.map(async (post) => {
        const relations = await db.select().from(postTags).where(eq(postTags.postId, post.id));
        const tagList = await Promise.all(
          relations.map(async (pt) => {
            const t = await db.select().from(tags).where(eq(tags.id, pt.tagId));
            return t[0];
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

// 新建文章
router.post("/", async (req: Request, res: Response) => {
  try {
    const { title, slug, content, excerpt, coverImage, isPublished, tagIds } = req.body;

    if (!title || !slug || !content) {
      res.status(400).json({ error: "标题、slug 和内容为必填项" });
      return;
    }

    const now = new Date();

    const result = await db.insert(posts).values({
      title,
      slug,
      content,
      excerpt: excerpt || content.slice(0, 200),
      coverImage: coverImage || null,
      isPublished: isPublished ? 1 : 0,
      createdAt: now,
      updatedAt: now,
    });

    const postId = Number(result[0].insertId);

    // 关联标签
    if (tagIds && Array.isArray(tagIds) && tagIds.length > 0) {
      for (const tagId of tagIds) {
        await db.insert(postTags).values({ postId, tagId });
      }
    }

    const newPost = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
    res.status(201).json(newPost[0]);
  } catch (err: any) {
    console.error(err);
    if (err.code === "ER_DUP_ENTRY") {
      res.status(400).json({ error: "slug 已存在，请更换" });
      return;
    }
    res.status(500).json({ error: "创建文章失败" });
  }
});

// 更新文章
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { title, slug, content, excerpt, coverImage, isPublished, tagIds } = req.body;

    const existing = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
    if (existing.length === 0) {
      res.status(404).json({ error: "文章不存在" });
      return;
    }

    const now = new Date();

    await db
      .update(posts)
      .set({
        ...(title && { title }),
        ...(slug && { slug }),
        ...(content && { content }),
        excerpt: excerpt || (content ? content.slice(0, 200) : existing[0].excerpt),
        coverImage: coverImage !== undefined ? coverImage : existing[0].coverImage,
        isPublished: isPublished !== undefined ? (isPublished ? 1 : 0) : existing[0].isPublished,
        updatedAt: now,
      })
      .where(eq(posts.id, id));

    // 更新标签关联
    if (tagIds !== undefined) {
      await db.delete(postTags).where(eq(postTags.postId, id));
      if (Array.isArray(tagIds) && tagIds.length > 0) {
        for (const tagId of tagIds) {
          await db.insert(postTags).values({ postId: id, tagId });
        }
      }
    }

    const updated = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
    res.json(updated[0]);
  } catch (err: any) {
    console.error(err);
    if (err.code === "ER_DUP_ENTRY") {
      res.status(400).json({ error: "slug 已存在，请更换" });
      return;
    }
    res.status(500).json({ error: "更新文章失败" });
  }
});

// 删除文章
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await db.delete(postTags).where(eq(postTags.postId, id));
    await db.delete(posts).where(eq(posts.id, id));
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "删除文章失败" });
  }
});

// 标签管理：新增标签
router.post("/tags", async (req: Request, res: Response) => {
  try {
    const { name, slug } = req.body;
    if (!name || !slug) {
      res.status(400).json({ error: "标签名和 slug 为必填项" });
      return;
    }
    await db.insert(tags).values({ name, slug });
    res.status(201).json({ success: true });
  } catch (err: any) {
    if (err.code === "ER_DUP_ENTRY") {
      res.status(400).json({ error: "标签已存在" });
      return;
    }
    res.status(500).json({ error: "创建标签失败" });
  }
});

// 标签管理：删除标签
router.delete("/tags/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await db.delete(postTags).where(eq(postTags.tagId, id));
    await db.delete(tags).where(eq(tags.id, id));
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "删除标签失败" });
  }
});

// 更新站点设置
router.put("/settings", async (req: Request, res: Response) => {
  try {
    const { settings: newSettings } = req.body;
    if (!newSettings || typeof newSettings !== "object") {
      res.status(400).json({ error: "设置数据格式错误" });
      return;
    }

    for (const [key, value] of Object.entries(newSettings)) {
      await db
        .insert(settings)
        .values({ key, value: String(value) })
        .onDuplicateKeyUpdate({ set: { value: String(value) } });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "更新设置失败" });
  }
});

export default router;
