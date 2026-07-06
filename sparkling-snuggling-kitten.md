# 个人博客项目 - 全栈架构方案

## Context

在空目录 `d:\ai agent\新建文件夹` 中从零搭建个人博客项目。这是一个全栈项目，包含前台展示和后台管理，用于个人内容创作和发布。

## 技术选型

| 层面 | 选择 | 理由 |
|------|------|------|
| 前端框架 | Vue 3 + Vite | 用户指定 |
| 样式方案 | Tailwind CSS | 用户指定 |
| 后端框架 | Express.js | 生态最成熟，个人博客够用 |
| 数据库 | MySQL (via mysql2) | 用户指定，成熟稳定，适合博客类应用 |
| ORM | Drizzle ORM | 比 Prisma 更轻量，SQL-like API，MySQL 支持好 |
| Markdown | markdown-it | 轻量快速，插件丰富 |
| 评论 | Giscus | 基于 GitHub Discussions，免费，无需自建 |
| 搜索 | 前端搜索 (Fuse.js) | 个人博客文章量不大，前端模糊搜索足够 |
| 认证 | JWT + 简单密码 | 个人使用，不需要复杂权限系统 |
| 图片上传 | 本地存储 + multer | 简单直接，无需外部图床 |

## 项目目录结构

```
blog/
├── client/                    # Vue 3 前端
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── tsconfig.json
│   ├── package.json
│   └── src/
│       ├── main.ts
│       ├── App.vue
│       ├── router/
│       │   └── index.ts           # 路由配置（前台 + 后台）
│       ├── api/
│       │   └── index.ts           # axios 封装 & API 调用
│       ├── stores/
│       │   └── auth.ts            # Pinia 认证状态（仅登录态需要）
│       ├── composables/
│       │   └── useSearch.ts       # 搜索 composable
│       ├── components/
│       │   ├── layout/
│       │   │   ├── AppHeader.vue
│       │   │   └── AppFooter.vue
│       │   ├── blog/
│       │   │   ├── PostCard.vue
│       │   │   ├── PostList.vue
│       │   │   ├── TagBadge.vue
│       │   │   └── SearchBar.vue
│       │   └── admin/
│       │       ├── AdminSidebar.vue
│       │       ├── PostEditor.vue
│       │       └── ImageUploader.vue
│       ├── pages/
│       │   ├── HomePage.vue         # 文章列表首页
│       │   ├── PostPage.vue         # 文章详情 + Giscus 评论
│       │   ├── TagPage.vue          # 按标签筛选
│       │   ├── SearchPage.vue       # 搜索结果页
│       │   ├── AboutPage.vue        # 关于我
│       │   └── admin/
│       │       ├── LoginPage.vue    # 管理后台登录
│       │       ├── DashboardPage.vue # 后台首页概览
│       │       ├── PostListPage.vue  # 文章管理列表
│       │       ├── PostEditPage.vue  # 新建/编辑文章
│       │       └── SettingsPage.vue  # 站点设置（关于我内容等）
│       └── styles/
│           └── main.css             # Tailwind 入口 + 全局样式
│
├── server/                    # Express 后端
│   ├── tsconfig.json
│   ├── package.json
│   └── src/
│       ├── index.ts              # 入口：Express 启动
│       ├── db/
│       │   ├── index.ts          # 数据库连接
│       │   └── schema.ts         # Drizzle 表定义
│       ├── routes/
│       │   ├── auth.ts           # 登录/登出
│       │   ├── posts.ts          # 文章 CRUD
│       │   ├── tags.ts           # 标签管理
│       │   ├── upload.ts         # 图片上传
│       │   └── settings.ts       # 站点设置
│       ├── middleware/
│       │   ├── auth.ts           # JWT 验证中间件
│       │   └── errorHandler.ts   # 全局错误处理
│       └── utils/
│           └── jwt.ts            # JWT 签发/验证
│
├── uploads/                   # 上传的图片存放目录
├── .env                       # 环境变量（含 MySQL 连接配置）
└── package.json               # 根 package.json (scripts: dev, build)
```

## 数据库表设计

### posts（文章表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK AUTO_INCREMENT | 自增主键 |
| title | VARCHAR(255) | 标题 |
| slug | VARCHAR(255) UNIQUE | URL 友好标识 |
| content | LONGTEXT | Markdown 原始内容 |
| excerpt | TEXT | 摘要（手动或自动截取） |
| cover_image | VARCHAR(500) | 封面图路径 |
| is_published | TINYINT(1) | 是否发布 (0/1) |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

### tags（标签表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK AUTO_INCREMENT | 自增主键 |
| name | VARCHAR(100) UNIQUE | 标签名 |
| slug | VARCHAR(100) UNIQUE | URL 友好标识 |

### post_tags（文章-标签关联表）
| 字段 | 类型 | 说明 |
|------|------|------|
| post_id | INT FK | 文章 ID |
| tag_id | INT FK | 标签 ID |
> 复合主键 (post_id, tag_id)

### settings（站点设置表）
| 字段 | 类型 | 说明 |
|------|------|------|
| key | VARCHAR(100) PK | 设置键 |
| value | TEXT | 设置值（JSON 字符串） |

用于存储：站点名称、关于我内容（Markdown）、社交链接等。

## MySQL 环境要求

需提前安装 MySQL 并创建数据库：

```sql
CREATE DATABASE blog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

`.env` 配置：

```env
# MySQL 连接
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=blog

# JWT 密钥
JWT_SECRET=your-secret-key

# 服务端口
PORT=3000
```

> 如果没有安装 MySQL，推荐用 Docker 快速启动：
> `docker run -d -p 3306:3306 -e MYSQL_ROOT_PASSWORD=your_password -e MYSQL_DATABASE=blog --name blog-mysql mysql:8`

## 路由设计

### 前台路由（`/`）
| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | HomePage | 最新文章列表，分页 |
| `/post/:slug` | PostPage | 文章详情 + Giscus |
| `/tag/:slug` | TagPage | 按标签筛选文章 |
| `/search?q=` | SearchPage | 搜索结果 |
| `/about` | AboutPage | 关于我 |

### 后台路由（`/admin`）
| 路径 | 页面 | 说明 |
|------|------|------|
| `/admin/login` | LoginPage | 登录页 |
| `/admin` | DashboardPage | 后台首页（需登录） |
| `/admin/posts` | PostListPage | 文章列表管理 |
| `/admin/posts/new` | PostEditPage | 新建文章 |
| `/admin/posts/:id/edit` | PostEditPage | 编辑文章 |
| `/admin/settings` | SettingsPage | 站点设置 |

### API 路由（`/api`）
| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/posts` | 公开文章列表（分页+标签筛选） | 否 |
| GET | `/api/posts/:slug` | 单篇文章详情 | 否 |
| GET | `/api/tags` | 所有标签列表 | 否 |
| GET | `/api/settings` | 站点公开设置 | 否 |
| POST | `/api/auth/login` | 登录 | 否 |
| GET | `/api/admin/posts` | 全部文章（含草稿） | 是 |
| POST | `/api/admin/posts` | 新建文章 | 是 |
| PUT | `/api/admin/posts/:id` | 更新文章 | 是 |
| DELETE | `/api/admin/posts/:id` | 删除文章 | 是 |
| POST | `/api/admin/upload` | 上传图片 | 是 |
| PUT | `/api/admin/settings` | 更新站点设置 | 是 |

## 关键设计决策

### 状态管理
默认不需要 Pinia，组合式 API 足够。只有**登录态**用一个 Pinia store（`stores/auth.ts`），因为跨多个组件和路由守卫都需要。

### 管理后台
与前台**同一 Vue 应用**，通过路由 `/admin` 区分。登录后在导航栏有入口。这样避免维护两个独立项目。

### 搜索
前端搜索（Fuse.js），因为个人博客文章量在几百篇以内。从 API 获取全量已发布文章的标题+摘要+标签，前端做模糊匹配。

### Markdown 渲染
后端存原始 Markdown，前端用 `markdown-it` 渲染为 HTML。支持代码高亮（highlight.js）。

### 图片上传
管理后台编辑器支持拖拽/粘贴图片，通过 `/api/admin/upload` 上传到服务器 `uploads/` 目录，返回 URL 插入 Markdown。

### Giscus 评论
在 PostPage 中嵌入 Giscus 组件，配置 `data-term` 为文章 slug，每个文章独立讨论。

## 实施分阶段计划

### 阶段 1：项目脚手架
- 创建目录结构
- 初始化 client（Vite + Vue 3 + TS + Tailwind）
- 初始化 server（Express + TS + Drizzle）
- 根 package.json 添加并行启动脚本
- 配置 .gitignore

### 阶段 2：数据库 + 后端 API
- Drizzle schema 定义 & 数据库初始化
- Auth 路由（登录 JWT）
- Posts CRUD 路由
- Tags 路由
- Settings 路由
- Upload 路由
- 认证中间件
- 初始数据种子脚本

### 阶段 3：前端基础
- 路由配置
- Layout 组件（Header/Footer）
- Tailwind 主题配置
- API 请求封装
- 前台页面（Home、Post、Tag、About）

### 阶段 4：管理后台
- 登录页
- 文章管理（列表、新建、编辑）
- Markdown 编辑器集成
- 图片上传
- 站点设置页

### 阶段 5：增强功能
- Fuse.js 搜索
- Giscus 评论集成
- SEO meta 标签
- 响应式适配
- 加载状态 & 错误处理

## 验证方案

1. `npm run dev` 启动前后端
2. 访问前台首页 → 看到文章列表
3. 点击文章 → 看到渲染后的 Markdown 内容 + Giscus 评论区
4. 点击标签 → 筛选文章
5. 使用搜索框 → 模糊搜索文章
6. 访问 `/admin/login` → 登录后台
7. 后台新建/编辑文章 → 前台实时看到
8. 上传图片 → 插入编辑器
