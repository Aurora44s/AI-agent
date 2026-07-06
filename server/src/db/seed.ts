import dotenv from "dotenv";
import path from "path";
import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { posts, tags, postTags, settings } from "./schema";

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "blog",
  });

  const db = drizzle(connection);

  console.log("🌱 开始填充初始数据...");

  // 清空现有数据（开发环境用）
  await db.delete(postTags);
  await db.delete(posts);
  await db.delete(tags);
  await db.delete(settings);

  // 创建示例标签
  await db.insert(tags).values([
    { name: "JavaScript", slug: "javascript" },
    { name: "Vue", slug: "vue" },
    { name: "Node.js", slug: "nodejs" },
  ]);
  console.log("✅ 标签创建完成");

  // 创建示例文章
  const now = new Date();

  await db.insert(posts).values([
    {
      title: "我的第一篇博客",
      slug: "hello-world",
      content: `# 欢迎来到我的博客\n\n这是我的第一篇博客文章。\n\n## 关于这个博客\n\n这个博客使用 **Vue 3** + **Express** + **MySQL** 构建。\n\n\`\`\`javascript\nconsole.log("Hello, Blog!");\n\`\`\`\n\n感谢你的访问！`,
      excerpt: "欢迎来到我的博客，这是我的第一篇博客文章。",
      isPublished: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      title: "Vue 3 学习笔记",
      slug: "vue3-notes",
      content: `# Vue 3 学习笔记\n\n## 组合式 API\n\nVue 3 的组合式 API 提供了更好的代码组织方式。\n\n\`\`\`javascript\nimport { ref, computed } from 'vue';\n\nconst count = ref(0);\nconst doubled = computed(() => count.value * 2);\n\`\`\`\n\n## 响应式原理\n\nVue 3 使用 Proxy 实现响应式，相比 Vue 2 的 Object.defineProperty 有更好的性能。`,
      excerpt: "Vue 3 组合式 API 和响应式原理的学习笔记。",
      isPublished: 1,
      createdAt: now,
      updatedAt: now,
    },
  ]);
  console.log("✅ 文章创建完成");

  // 关联标签
  const postList = await db.select().from(posts);
  const tagList = await db.select().from(tags);

  await db.insert(postTags).values([
    { postId: postList[0].id, tagId: tagList[0].id }, // hello-world → JavaScript
    { postId: postList[1].id, tagId: tagList[1].id }, // vue3-notes → Vue
    { postId: postList[1].id, tagId: tagList[0].id }, // vue3-notes → JavaScript
  ]);
  console.log("✅ 标签关联完成");

  // 创建站点设置
  await db.insert(settings).values([
    { key: "site_name", value: "我的博客" },
    { key: "site_description", value: "一个分享技术和生活的个人博客" },
    { key: "about_me", value: "# 关于我\n\n你好！我是一名热爱编程的开发者，喜欢探索新技术。\n\n## 技术栈\n\n- 前端：Vue、React\n- 后端：Node.js、Express\n- 数据库：MySQL" },
    { key: "github", value: "https://github.com" },
  ]);
  console.log("✅ 站点设置完成");

  await connection.end();
  console.log("🎉 种子数据填充完成！");
}

seed().catch((err) => {
  console.error("❌ 种子数据填充失败:", err);
  process.exit(1);
});
