import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "blog",
  });

  console.log("✅ 数据库连接成功");

  await conn.execute(
    "INSERT INTO settings (`key`, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)",
    ["site_name", "Suyuxi"]
  );
  await conn.execute(
    "INSERT INTO settings (`key`, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)",
    ["site_description", "千里之行，始于足下"]
  );

  const [rows] = await conn.execute(
    "SELECT * FROM settings WHERE `key` IN (?, ?)",
    ["site_name", "site_description"]
  ) as any;
  console.log(JSON.stringify(rows, null, 2));

  await conn.end();
  console.log("✅ 更新完成");
}

main().catch((err) => {
  console.error("失败:", err.message);
  process.exit(1);
});
