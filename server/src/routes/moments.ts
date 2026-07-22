import { Router, Request, Response } from "express";
import { db } from "../db";
import { moments } from "../db/schema";
import { desc, like, sql } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// ===== 公开接口 =====

// 获取说说列表（分页 + 搜索 + 最新排序）
router.get("/", async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string | undefined;

    let query = db.select().from(moments);

    if (search) {
      query = query.where(like(moments.content, `%${search}%`));
    }

    const all = await query.orderBy(desc(moments.createdAt));
    const total = all.length;
    const start = (page - 1) * limit;
    const data = all.slice(start, start + limit);

    res.json({ moments: data, total });
  } catch {
    res.status(500).json({ error: "加载说说失败" });
  }
});

// 获取单条说说
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "无效的ID" });
      return;
    }
    const result = await db.select().from(moments).where(
      sql`${moments.id} = ${id}`
    );
    if (!result.length) {
      res.status(404).json({ error: "说说不存在" });
      return;
    }
    res.json(result[0]);
  } catch {
    res.status(500).json({ error: "加载说说失败" });
  }
});

// ===== 后台接口（需认证） =====

// 创建说说
router.post("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { content, images } = req.body;

    if (!content || !content.trim()) {
      res.status(400).json({ error: "内容不能为空" });
      return;
    }

    const now = new Date();
    const result = await db.insert(moments).values({
      content: content.trim(),
      images: images || [],
      createdAt: now,
    });

    const id = (result as any)[0]?.insertId;
    const created = await db.select().from(moments).where(
      sql`${moments.id} = ${id}`
    );

    res.status(201).json(created[0]);
  } catch {
    res.status(500).json({ error: "发布说说失败" });
  }
});

// 删除说说
router.delete("/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "无效的ID" });
      return;
    }
    await db.delete(moments).where(sql`${moments.id} = ${id}`);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "删除说说失败" });
  }
});

export default router;
