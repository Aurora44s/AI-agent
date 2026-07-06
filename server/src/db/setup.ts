import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

async function setup() {
  // 先连接到 MySQL（不指定数据库），创建 blog 数据库
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
  });

  await conn.query("CREATE DATABASE IF NOT EXISTS blog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
  console.log("✅ 数据库 blog 已创建");
  await conn.end();
}

setup()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ 数据库创建失败:", err.message);
    process.exit(1);
  });
