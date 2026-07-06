import { Router, Request, Response } from "express";
import { db } from "../db";
import { settings } from "../db/schema";
import { eq } from "drizzle-orm";

const router = Router();

// 公开：获取站点设置
router.get("/", async (_req: Request, res: Response) => {
  try {
    const result = await db.select().from(settings);
    const settingsMap: Record<string, string> = {};
    result.forEach((s) => {
      settingsMap[s.key] = s.value;
    });
    res.json(settingsMap);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "获取设置失败" });
  }
});

export default router;
