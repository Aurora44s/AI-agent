import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { signToken } from "../utils/jwt";

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

  if (username !== ADMIN_USERNAME) {
    res.status(401).json({ error: "用户名或密码错误" });
    return;
  }

  // 如果用 bcrypt hash 存储密码，这里改为比对 hash
  const isPasswordValid =
    password === ADMIN_PASSWORD ||
    (await bcrypt.compare(password, await bcrypt.hash(ADMIN_PASSWORD, 10)).catch(() => false));

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
