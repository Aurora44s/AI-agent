import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { db } from "../db";
import { songs } from "../db/schema";
import { authMiddleware } from "../middleware/auth";
import { desc, eq } from "drizzle-orm";

const router = Router();

// 上传存储配置
const musicDir = path.resolve(process.cwd(), "../uploads/music");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    if (!fs.existsSync(musicDir)) fs.mkdirSync(musicDir, { recursive: true });
    cb(null, musicDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (_req, file, cb) => {
    const allowed = [".mp3", ".wav", ".ogg", ".flac", ".m4a", ".jpg", ".jpeg", ".png", ".webp"];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  },
});

// ===== 公开 API =====

// 获取所有歌曲
router.get("/", async (_req, res, next) => {
  try {
    const list = await db.select().from(songs).orderBy(desc(songs.createdAt));
    res.json(list);
  } catch (err) {
    next(err);
  }
});

// ===== 后台 API =====

// 上传歌曲
router.post(
  "/upload",
  authMiddleware,
  upload.fields([
    { name: "music", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  async (req, res, next) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const musicFile = files?.music?.[0];
      if (!musicFile) {
        return res.status(400).json({ error: "请上传音乐文件" });
      }

      const title = req.body.title || path.basename(musicFile.originalname, path.extname(musicFile.originalname));
      const artist = req.body.artist || "未知歌手";
      const lrcContent = req.body.lrc_content || "";
      const coverFile = files?.cover?.[0];

      const result = await db.insert(songs).values({
        title,
        artist,
        filePath: `/uploads/music/${musicFile.filename}`,
        coverPath: coverFile ? `/uploads/music/${coverFile.filename}` : "",
        lrcContent,
        createdAt: new Date(),
      });

      res.json({ id: (result as any).insertId, title, artist });
    } catch (err) {
      next(err);
    }
  }
);

// 删除歌曲
router.delete("/:id", authMiddleware, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const [song] = await db.select().from(songs).where(eq(songs.id, id));

    if (song) {
      // 删除文件
      const filePath = path.resolve(process.cwd(), "..", song.filePath.slice(1));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      if (song.coverPath) {
        const coverPath = path.resolve(process.cwd(), "..", song.coverPath.slice(1));
        if (fs.existsSync(coverPath)) fs.unlinkSync(coverPath);
      }
    }

    await db.delete(songs).where(eq(songs.id, id));
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
