import { Router, Request, Response } from "express";
import { db } from "../db";
import { announcements } from "../db/schema";
import { desc, eq } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// GET /api/announcements — 获取全部公告
router.get("/", async (_req: Request, res: Response) => {
  try {
    const list = await db.select().from(announcements).orderBy(desc(announcements.createdAt));
    res.json(list);
  } catch {
    res.status(500).json({ error: "加载公告失败" });
  }
});

// POST /api/admin/announcements — 添加公告
router.post("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) {
      res.status(400).json({ error: "内容不能为空" });
      return;
    }
    const now = new Date();
    await db.insert(announcements).values({ content: content.trim(), createdAt: now });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "添加公告失败" });
  }
});

// DELETE /api/admin/announcements/:id — 删除公告
router.delete("/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "无效的ID" });
      return;
    }
    await db.delete(announcements).where(eq(announcements.id, id));
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "删除公告失败" });
  }
});

export default router;
