# CLAUDE.md

## 项目概述

遇梦博客 —— 基于 Vue 3 + Express + MySQL 的全栈个人博客系统。

## 常用命令

```bash
# 启动开发环境（前端 + 后端并行）
npm run dev

# 仅启动后端 (端口 3000)
cd server && npm run dev

# 仅启动前端 (端口 5173)
cd client && npm run dev

# 数据库相关
cd server && npm run db:seed       # 初始化数据库 + 种子数据
cd server && npx tsx src/db/migrate-chat.ts     # 创建聊天消息表
cd server && npx tsx src/db/migrate-songs.ts    # 创建歌曲表
cd server && npx tsx src/db/migrate-comments.ts # 创建留言表
cd server && npx tsx src/db/migrate-photos.ts   # 创建照片墙表
```

## 技术栈

- **前端**: Vue 3 (Composition API) + Vite + TypeScript + Tailwind CSS + Pinia + Socket.IO Client
- **后端**: Express + TypeScript (tsx) + Drizzle ORM + MySQL + Socket.IO + JWT
- **数据库**: MySQL，数据库名 `blog`

## 项目结构

```
├── client/          # Vue 3 前端
│   └── src/
│       ├── api/         # API 接口定义
│       ├── components/  # 组件 (admin/, blog/, chat/, layout/, music/)
│       ├── composables/ # 组合式函数 (动画、SEO 等)
│       ├── pages/       # 页面组件
│       ├── router/      # 路由配置
│       └── stores/      # Pinia 状态管理
├── server/          # Express 后端
│   └── src/
│       ├── db/          # 数据库 (schema, seed, migrate)
│       ├── middleware/  # 中间件 (auth, errorHandler)
│       ├── routes/      # 路由 (auth, posts, tags, settings, upload, etc.)
│       └── utils/       # 工具 (jwt)
├── uploads/         # 上传文件目录
├── class/           # (gitignored) 用户自定义目录
└── .env             # 环境变量
```

## 环境变量 (.env)

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=123456
DB_NAME=blog
JWT_SECRET=your-secret-key-change-me
PORT=3000
```

## 默认管理员

- 后台地址: http://localhost:5173/admin/login
- 默认账号: admin / admin123

## 教学文件

- 生成的所有教学文件（课程文档、讲义、笔记等）都保存到 `class/` 目录

## 注意事项

- `class/` 目录已加入 .gitignore，不会被 Git 跟踪
- 上传文件在 `uploads/` 目录，该目录也被 gitignore（除了 .gitkeep）
- `.md` 文件默认被 gitignore，但 `CLAUDE.md` 和已跟踪的 `README.md` 除外
