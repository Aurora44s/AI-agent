import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { db } from "../db";
import { photos } from "../db/schema";
import { authMiddleware } from "../middleware/auth";
import { desc, eq } from "drizzle-orm";

const router = Router();

// 上传存储配置
const photoDir = path.resolve(process.cwd(), "../uploads/photos");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    if (!fs.existsSync(photoDir)) fs.mkdirSync(photoDir, { recursive: true });
    cb(null, photoDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
    cb(null, allowed.includes(path.extname(file.originalname).toLowerCase()));
  },
});

// GET /api/photos — 获取全部照片（按时间倒序）
router.get("/", async (_req, res, next) => {
  try {
    const list = await db.select().from(photos).orderBy(desc(photos.createdAt));
    res.json(list);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/photos/upload — 上传照片（需认证）
router.post("/upload", authMiddleware, upload.single("photo"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "请选择照片" });
    }

    const title = req.body.title || "";
    const album = req.body.album || "默认相册";

    await db.insert(photos).values({
      title,
      url: `/uploads/photos/${req.file.filename}`,
      album,
      createdAt: new Date(),
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/photos/:id — 删除照片（需认证）
router.delete("/:id", authMiddleware, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const [photo] = await db.select().from(photos).where(eq(photos.id, id));

    if (photo) {
      const filePath = path.resolve(process.cwd(), "..", photo.url.slice(1));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await db.delete(photos).where(eq(photos.id, id));
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
