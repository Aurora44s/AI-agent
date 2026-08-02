import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";
import dotenv from "dotenv";
import path from "path";
import type { MySql2Database } from "drizzle-orm/mysql2";

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

// eslint-disable-next-line import/no-mutable-exports
export let db: MySql2Database<typeof schema>;

export async function initDb() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "blog",
    // 连接池 + 保活配置
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    idleTimeout: 60000,
    connectTimeout: 10000,
  });

  db = drizzle(pool, { schema, mode: "default" });
  console.log("✅ 数据库连接池初始化成功");
}
