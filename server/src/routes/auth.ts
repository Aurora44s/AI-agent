import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { signToken } from "../utils/jwt";
import { checkRateLimit, getClientIP } from "../utils/rateLimiter";

const router = Router();

// 默认管理员账号（首次使用可修改）
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

router.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: "请输入用户名和密码" });
    return;
  }

  // 速率限制：登录接口更严格
  const ip = getClientIP(req);
  const limit = checkRateLimit(`login:${ip}`);
  if (!limit.allowed) {
    console.warn(`[安全] 登录暴力破解嫌疑 | IP=${ip} | 用户名=${username}`);
    res.status(429).json({ error: "登录尝试次数过多，请稍后再试" });
    return;
  }

  if (username !== ADMIN_USERNAME) {
    res.status(401).json({ error: "用户名或密码错误" });
    return;
  }

  // 简化处理：直接比对明文（生产环境应该存 bcrypt hash）
  const isMatch = password === ADMIN_PASSWORD;

  if (!isMatch) {
    res.status(401).json({ error: "用户名或密码错误" });
    return;
  }

  const token = signToken({ username });
  res.json({ token, username });
});

export default router;
