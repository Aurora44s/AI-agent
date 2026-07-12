# 遇梦博客

基于 Vue 3 + Express + MySQL 构建的全栈个人博客系统，支持文章管理、实时聊天、音乐播放、留言板等功能。

## 技术栈

### 前端

| 技术 | 版本 | 用途 |
|------|------|------|
| [Vue 3](https://vuejs.org/) | ^3.4 | 前端框架（Composition API + `<script setup>`） |
| [Vue Router](https://router.vuejs.org/) | ^4.4 | 路由管理 |
| [Pinia](https://pinia.vuejs.org/) | ^2.1 | 状态管理 |
| [Vite](https://vitejs.dev/) | ^5.3 | 构建工具 |
| [TypeScript](https://www.typescriptlang.org/) | ^5.5 | 类型检查 |
| [Tailwind CSS](https://tailwindcss.com/) | ^3.4 | 原子化 CSS 框架 |
| [Axios](https://axios-http.com/) | ^1.7 | HTTP 请求 |
| [markdown-it](https://markdown-it.github.io/) | ^14.1 | Markdown 渲染 |
| [highlight.js](https://highlightjs.org/) | ^11.10 | 代码语法高亮 |
| [Socket.IO Client](https://socket.io/) | ^4.8 | WebSocket 实时通信 |
| [@heroicons/vue](https://heroicons.com/) | ^2.2 | SVG 图标库 |

### 后端

| 技术 | 版本 | 用途 |
|------|------|------|
| [Express](https://expressjs.com/) | ^4.19 | HTTP 服务器框架 |
| [TypeScript](https://www.typescriptlang.org/) | ^5.5 | 类型检查 |
| [tsx](https://tsx.is/) | ^4.16 | TypeScript 运行时 |
| [Drizzle ORM](https://orm.drizzle.team/) | ^0.33 | 数据库 ORM |
| [MySQL](https://www.mysql.com/) | — | 关系型数据库 |
| [Socket.IO](https://socket.io/) | ^4.8 | WebSocket 服务端 |
| [JWT](https://jwt.io/) | ^9.0 | 身份认证 |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | ^2.4 | 密码加密 |
| [Multer](https://github.com/expressjs/multer) | ^1.4 | 文件上传 |

---

## 项目结构

```
my-bolg/
├── client/                     # 前端项目 (Vue 3 + Vite)
│   ├── src/
│   │   ├── api/index.ts        # API 接口定义
│   │   ├── components/
│   │   │   ├── admin/          # 管理后台组件
│   │   │   ├── blog/           # 博客组件（轮播图、文章卡片、留言板等）
│   │   │   ├── chat/           # 聊天室组件
│   │   │   ├── layout/         # 布局组件（Header、Footer）
│   │   │   └── music/          # 音乐播放器组件
│   │   ├── composables/        # 组合式函数
│   │   │   ├── useSEO.ts           # SEO 标题管理
│   │   │   ├── useClickParticles.ts # 点击粒子动画
│   │   │   ├── useFallingParticles.ts # 下落粒子动画
│   │   │   └── useScrollReveal.ts   # 滚动显示动画
│   │   ├── pages/              # 页面组件
│   │   │   └── admin/          # 管理后台页面
│   │   ├── router/index.ts     # 路由配置
│   │   ├── stores/auth.ts      # 认证状态（Pinia）
│   │   ├── styles/main.css     # 全局样式
│   │   └── App.vue             # 根组件
│   ├── public/                 # 静态资源
│   ├── tailwind.config.js      # Tailwind 配置
│   └── package.json
├── server/                     # 后端项目 (Express)
│   ├── src/
│   │   ├── db/
│   │   │   ├── schema.ts       # 数据库表定义（Drizzle ORM）
│   │   │   ├── index.ts        # 数据库连接
│   │   │   ├── seed.ts         # 种子数据
│   │   │   └── migrate-*.ts    # 数据库迁移脚本
│   │   ├── middleware/
│   │   │   ├── auth.ts         # JWT 认证中间件
│   │   │   └── errorHandler.ts # 错误处理中间件
│   │   ├── routes/
│   │   │   ├── admin.ts        # 后台管理 API
│   │   │   ├── auth.ts         # 登录认证
│   │   │   ├── posts.ts        # 文章公开 API
│   │   │   ├── tags.ts         # 标签 API
│   │   │   ├── settings.ts     # 站点设置 API
│   │   │   ├── songs.ts        # 歌曲管理 API
│   │   │   ├── comments.ts     # 留言板 API
│   │   │   └── upload.ts       # 文件上传
│   │   ├── utils/jwt.ts        # JWT 令牌工具
│   │   ├── socket.ts           # Socket.IO 实时通信
│   │   └── index.ts            # 服务入口
│   └── package.json
├── uploads/                    # 上传文件目录
│   └── music/                  # 音乐文件
├── docs/                       # 项目文档
│   └── bug-summary.md          # Bug 总结文档
└── .env                        # 环境变量
```

---

## 数据库设计

### ER 图

```
┌──────────────────────┐       ┌──────────────────────┐
│        posts         │       │        tags          │
├──────────────────────┤       ├──────────────────────┤
│ id           INT  PK │       │ id           INT  PK │
│ title   VARCHAR(255) │       │ name   VARCHAR(100)  │
│ slug    VARCHAR(255) │       │ slug   VARCHAR(100)  │
│ content        TEXT  │       └──────────┬───────────┘
│ excerpt  VARCHAR(500)│                  │
│ cover_image VARCHAR  │       ┌──────────┴───────────┐
│ is_published TINYINT │       │      post_tags       │
│ created_at  DATETIME │       ├──────────────────────┤
│ updated_at  DATETIME │       │ post_id  INT  PK FK  │
└──────────────────────┘       │ tag_id   INT  PK FK  │
                               └──────────────────────┘

┌──────────────────────┐       ┌──────────────────────┐
│      settings        │       │      messages        │
├──────────────────────┤       ├──────────────────────┤
│ key   VARCHAR(100) PK│       │ id           INT  PK │
│ value         TEXT   │       │ nickname VARCHAR(50) │
└──────────────────────┘       │ content       TEXT   │
                               │ created_at DATETIME  │
                               └──────────────────────┘

┌──────────────────────┐       ┌──────────────────────┐
│      comments        │       │        songs         │
├──────────────────────┤       ├──────────────────────┤
│ id           INT  PK │       │ id           INT  PK │
│ nickname VARCHAR(50) │       │ title  VARCHAR(255)  │
│ email    VARCHAR(200)│       │ artist VARCHAR(255)  │
│ content        TEXT  │       │ file_path VARCHAR    │
│ created_at  DATETIME │       │ cover_path VARCHAR   │
└──────────────────────┘       │ lrc_content    TEXT  │
                               │ created_at DATETIME  │
                               └──────────────────────┘
```

### 表结构详解

#### `posts` — 文章表
| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 文章 ID |
| title | VARCHAR(255) | NOT NULL | 文章标题 |
| slug | VARCHAR(255) | NOT NULL, UNIQUE | URL 友好标识 |
| content | TEXT | NOT NULL | Markdown 正文 |
| excerpt | VARCHAR(500) | — | 文章摘要 |
| cover_image | VARCHAR(500) | — | 封面图 URL |
| is_published | TINYINT | DEFAULT 0 | 发布状态（0=草稿, 1=已发布） |
| created_at | DATETIME | NOT NULL | 创建时间 |
| updated_at | DATETIME | NOT NULL | 更新时间 |

#### `tags` — 标签表
| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 标签 ID |
| name | VARCHAR(100) | NOT NULL, UNIQUE | 标签名称 |
| slug | VARCHAR(100) | NOT NULL, UNIQUE | URL 友好标识 |

#### `post_tags` — 文章-标签关联表
| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| post_id | INT | PK, FK → posts.id | 文章 ID |
| tag_id | INT | PK, FK → tags.id | 标签 ID |

> 联合主键 `(post_id, tag_id)`，外键级联删除。

#### `settings` — 站点设置表（Key-Value）
| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| key | VARCHAR(100) | PK | 设置键名 |
| value | TEXT | NOT NULL | 设置值 |

> 常用键：`site_name`、`site_description`、`about_me`、`github`、`giscus_repo` 等。

#### `messages` — 聊天消息表
| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 消息 ID |
| nickname | VARCHAR(50) | NOT NULL | 用户昵称 |
| content | TEXT | NOT NULL | 消息内容 |
| created_at | DATETIME | NOT NULL | 发送时间 |

#### `comments` — 留言板表
| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 留言 ID |
| nickname | VARCHAR(50) | NOT NULL | 用户昵称 |
| email | VARCHAR(200) | DEFAULT '' | 邮箱（选填） |
| content | TEXT | NOT NULL | 留言内容 |
| created_at | DATETIME | NOT NULL | 留言时间 |

#### `songs` — 歌曲表
| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 歌曲 ID |
| title | VARCHAR(255) | NOT NULL | 歌曲标题 |
| artist | VARCHAR(255) | DEFAULT '' | 艺术家 |
| file_path | VARCHAR(500) | NOT NULL | 音频文件路径 |
| cover_path | VARCHAR(500) | DEFAULT '' | 封面图路径 |
| lrc_content | TEXT | — | LRC 歌词内容 |
| created_at | DATETIME | NOT NULL | 上传时间 |

---

## API 路由

### 公开 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/posts` | 获取文章列表（支持 `?page=&limit=&tag=&search=`） |
| GET | `/api/posts/:slug` | 获取单篇文章 |
| GET | `/api/tags` | 获取标签列表 |
| GET | `/api/settings` | 获取站点设置（Key-Value 对象） |
| GET | `/api/songs` | 获取歌曲列表 |
| GET | `/api/comments` | 获取全部留言 |
| POST | `/api/comments` | 提交留言 |
| POST | `/api/auth/login` | 管理员登录 |
| GET | `/api/posts/:slug/comments` | 获取文章评论（Giscus 扩展） |

### 后台 API（需 JWT 认证）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin` | 获取所有文章 |
| POST | `/api/admin` | 创建文章 |
| PUT | `/api/admin/:id` | 更新文章 |
| DELETE | `/api/admin/:id` | 删除文章 |
| PUT | `/api/admin/settings` | 更新站点设置 |
| POST | `/api/admin/tags` | 创建标签 |
| DELETE | `/api/admin/tags/:id` | 删除标签 |
| POST | `/api/admin/upload` | 上传图片 |
| POST | `/api/admin/songs/upload` | 上传歌曲 |
| DELETE | `/api/admin/songs/:id` | 删除歌曲 |

---

## 快速开始

### 环境要求
- Node.js >= 18
- MySQL >= 5.7/8.0

### 1. 克隆 & 安装依赖

```bash
# 后端
cd server && npm install

# 前端
cd client && npm install
```

### 2. 配置环境变量

在项目根目录创建 `.env`：

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=blog
JWT_SECRET=your_secret_key
```

### 3. 初始化数据库

```bash
cd server
npm run db:seed          # 创建数据库 + 表 + 种子数据
npx tsx src/db/migrate-chat.ts     # 创建聊天消息表
npx tsx src/db/migrate-songs.ts    # 创建歌曲表
npx tsx src/db/migrate-comments.ts # 创建留言表
```

### 4. 启动开发服务器

```bash
# 后端 (端口 3000)
cd server && npm run dev

# 前端 (端口 5173)
cd client && npm run dev
```

### 5. 访问

- 前台：http://localhost:5173
- 后台管理：http://localhost:5173/admin/login
- 默认账号：`admin` / `admin123`

---

## 功能特性

- 📝 博客文章 CRUD + Markdown 渲染 + 代码高亮
- 🏷️ 标签分类 + 文章搜索
- 💬 基于 Socket.IO 的实时聊天室
- 🎵 悬浮音乐播放器（LRC 歌词 + 封面 + 可视化）
- 📋 全局留言板
- 🎠 首页全屏轮播图
- ✨ 粒子动画（点击扩散 + 下落飘落）
- 📱 响应式设计 + 移动端抽屉菜单
- 🔐 JWT 认证 + 管理后台
- 🎨 Tailwind CSS 自定义主题 + 毛玻璃效果
- 🖼️ 图片/音乐上传
- 💬 Giscus 文章评论集成

---

## 自定义

### 轮播图

编辑 `client/src/components/blog/Carousel.vue` 中的 `slides` 数组，可配置图片、标题、副标题：

```ts
const slides: Slide[] = [
  {
    title: "欢迎来到遇梦",
    subtitle: "分享技术与生活的点滴",
    gradient: "from-primary-500 via-purple-500 to-pink-500",
    emoji: "🚀",
    image: "https://example.com/banner.jpg",  // 可选
  },
];
```

### 站点信息

通过后台管理页面或直接修改数据库 `settings` 表：
- `site_name` — 网站名称
- `site_description` — 网站描述
- `about_me` — 关于页面内容
- `github` — GitHub 链接
- `giscus_repo` / `giscus_repo_id` / `giscus_category` / `giscus_category_id` — Giscus 评论配置

---

## License

MIT
