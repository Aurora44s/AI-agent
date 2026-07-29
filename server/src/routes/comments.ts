import { Router, Request, Response, NextFunction } from "express";
import { db } from "../db";
import { comments } from "../db/schema";
import { desc, eq, and, isNull } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";
import { filterContent, FILTER_ERROR_MSG } from "../utils/sensitiveFilter";
import { checkRateLimit, getClientIP } from "../utils/rateLimiter";

const router = Router();

// GET /api/comments — 获取留言
// ?postId=N → 文章评论 / 无参数 → 留言板评论 / ?all=1 → 全部（后台用）
router.get("/", async (req, res, next) => {
  try {
    let list;
    if (req.query.all) {
      list = await db.select().from(comments).orderBy(desc(comments.createdAt));
    } else if (req.query.postId) {
      list = await db.select().from(comments).where(eq(comments.postId, Number(req.query.postId))).orderBy(desc(comments.createdAt));
    } else {
      list = await db.select().from(comments).where(isNull(comments.postId)).orderBy(desc(comments.createdAt));
    }
    res.json(list);
  } catch (err) {
    next(err);
  }
});

// POST /api/comments — 提交留言（可选 postId 关联文章）
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nickname, email, content, postId } = req.body;

    if (!nickname?.trim() || !content?.trim()) {
      res.status(400).json({ error: "昵称和内容不能为空" });
      return;
    }

    // 速率限制
    const ip = getClientIP(req);
    const limit = checkRateLimit(ip);
    if (!limit.allowed) {
      res.status(429).json({ error: `操作太频繁，请${limit.retryAfter}秒后再试` });
      return;
    }

    // 敏感词过滤
    const trimContent = content.trim();
    const filter = filterContent(trimContent, { ip, nickname: nickname.trim() });
    if (!filter.ok) {
      res.status(400).json({ error: FILTER_ERROR_MSG });
      return;
    }

    await db.insert(comments).values({
      nickname: nickname.trim().slice(0, 50),
      email: (email || "").trim().slice(0, 200),
      content: trimContent.slice(0, 2000),
      postId: postId ? Number(postId) : null,
      createdAt: new Date(),
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/comments/:id — 删除留言（需认证）
router.delete("/:id", authMiddleware, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await db.delete(comments).where(eq(comments.id, id));
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
