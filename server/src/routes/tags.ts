import { Router, Request, Response } from "express";
import { db } from "../db";
import { tags } from "../db/schema";

const router = Router();

// 获取所有标签
router.get("/", async (_req: Request, res: Response) => {
  try {
    const result = await db.select().from(tags);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "获取标签失败" });
  }
});

export default router;
