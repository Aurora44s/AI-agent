import { Router } from "express";
import { db } from "../db";
import { comments } from "../db/schema";
import { desc, eq } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// GET /api/comments — 获取全部留言（按时间倒序）
router.get("/", async (_req, res, next) => {
  try {
    const list = await db.select().from(comments).orderBy(desc(comments.createdAt));
    res.json(list);
  } catch (err) {
    next(err);
  }
});

// POST /api/comments — 提交留言
router.post("/", async (req, res, next) => {
  try {
    const { nickname, email, content } = req.body;

    if (!nickname?.trim() || !content?.trim()) {
      return res.status(400).json({ error: "昵称和内容不能为空" });
    }

    await db.insert(comments).values({
      nickname: nickname.trim().slice(0, 50),
      email: (email || "").trim().slice(0, 200),
      content: content.trim().slice(0, 2000),
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
