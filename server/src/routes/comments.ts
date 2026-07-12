import { Router } from "express";
import { db } from "../db";
import { comments } from "../db/schema";
import { desc, eq, and, isNull } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";

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
router.post("/", async (req, res, next) => {
  try {
    const { nickname, email, content, postId } = req.body;

    if (!nickname?.trim() || !content?.trim()) {
      return res.status(400).json({ error: "昵称和内容不能为空" });
    }

    await db.insert(comments).values({
      nickname: nickname.trim().slice(0, 50),
      email: (email || "").trim().slice(0, 200),
      content: content.trim().slice(0, 2000),
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
