import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { initDb } from "./db";
import postsRouter from "./routes/posts";
import tagsRouter from "./routes/tags";
import settingsRouter from "./routes/settings";
import authRouter from "./routes/auth";
import uploadRouter from "./routes/upload";
import adminRouter from "./routes/admin";
import { authMiddleware } from "./middleware/auth";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

async function main() {
  // 初始化数据库连接
  await initDb();

  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // 中间件
  app.use(cors());
  app.use(express.json({ limit: "10mb" }));

  // 静态文件 - 上传的图片
  app.use("/uploads", express.static(path.resolve(process.cwd(), "../uploads")));

  // 公开 API 路由
  app.use("/api/posts", postsRouter);
  app.use("/api/tags", tagsRouter);
  app.use("/api/settings", settingsRouter);
  app.use("/api/auth", authRouter);

  // 需要认证的后台 API
  app.use("/api/admin/upload", authMiddleware, uploadRouter);
  app.use("/api/admin", authMiddleware, adminRouter);

  // 错误处理
  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`🚀 服务器启动成功: http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error("服务器启动失败:", err);
  process.exit(1);
});

export default main;
