import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

async function createCommentsTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "blog",
  });

  console.log("✅ 数据库连接成功");

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS comments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nickname VARCHAR(50) NOT NULL,
      email VARCHAR(200) NOT NULL DEFAULT '',
      content TEXT NOT NULL,
      created_at DATETIME NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  console.log("✅ comments 表创建成功");
  await connection.end();
}

createCommentsTable().catch((err) => {
  console.error("创建表失败:", err.message);
  process.exit(1);
});
