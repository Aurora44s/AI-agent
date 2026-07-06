# 开发日志：MySQL 相关问题及解决方案

## 问题 1：Git Bash 中 mysql 命令不可用

**现象**：在 Git Bash 中执行 `mysql -u root -p` 报错 `mysql: command not found`

**原因**：MySQL Server 安装在 `C:\Program Files\MySQL\MySQL Server 8.0\bin\`，该路径不在 Git Bash 的 `PATH` 环境变量中。且路径含空格，即使拼出完整路径 `"/c/Program Files/..."` 也因空格导致 bash 无法解析。

**解决方案**：不依赖 mysql CLI，改用 Node.js 脚本调用 `mysql2` 驱动来执行 SQL。创建了 `server/src/db/setup.ts`，通过编程方式连接 MySQL 并执行 `CREATE DATABASE`。

```typescript
import mysql from "mysql2/promise";
const conn = await mysql.createConnection({ host, port, user, password });
await conn.query("CREATE DATABASE IF NOT EXISTS blog ...");
```

**教训**：在 Windows + Git Bash 环境下，优先用 Node.js 脚本而非依赖系统 CLI 工具。

---

## 问题 2：Drizzle Kit 读不到环境变量

**现象**：执行 `npx drizzle-kit push` 时报错 `[x] password: ''`

**原因**：`drizzle.config.ts` 中直接读取 `process.env.DB_PASSWORD`，但 drizzle-kit 不会自动加载 `.env` 文件。

**解决方案**：在 `drizzle.config.ts` 顶部显式调用 `dotenv.config()`，并指定 `.env` 的相对路径。

```typescript
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });
```

---

## 问题 3：Drizzle datetime 字段报错 `value.toISOString is not a function`

**现象**：执行种子脚本时，插入 `posts` 表的 `createdAt`/`updatedAt` 字段报错 `TypeError: value.toISOString is not a function`

**原因**：代码中传了 ISO 日期字符串 `"2026-07-06 14:00:00"`（通过 `.toISOString().slice(0, 19).replace("T", " ")` 生成），但 Drizzle ORM 的 MySQL datetime 驱动内部会调用 `.toISOString()` 来把值转为标准格式传给 MySQL。字符串没有 `.toISOString()` 方法，所以报错。

**解决方案**：直接传 `Date` 对象：

```typescript
// ❌ 错误写法
const now = new Date().toISOString().slice(0, 19).replace("T", " ");

// ✅ 正确写法
const now = new Date();
```

**涉及文件**：
- `server/src/db/seed.ts` — 种子脚本
- `server/src/routes/admin.ts` — 创建/更新文章的 datetime 值（2 处，已用 `replace_all: true` 批量修复）

---

## 问题 4：Top-level await 与 CJS 格式冲突

**现象**：启动服务端时报错 `Top-level await is currently not supported with the "cjs" output format`

**原因**：`server/src/db/index.ts` 中使用了顶层 `await mysql.createConnection(...)`。`tsx` 在默认配置下以 CJS 格式输出，CJS 不支持顶层 await。

**解决方案**：将数据库连接逻辑改为延迟初始化模式：

```typescript
// db/index.ts
export let db: MySql2Database<typeof schema>;

export async function initDb() {
  const connection = await mysql.createConnection({...});
  db = drizzle(connection, { schema, mode: "default" });
}
```

在服务入口 `server/src/index.ts` 中先调用 `await initDb()` 再使用路由：

```typescript
async function main() {
  await initDb();  // 先连数据库
  // ... 再挂载路由、监听端口
}
main();
```

---

## 总结

| 序号 | 问题 | 根因 | 解决方式 |
|------|------|------|----------|
| 1 | mysql 命令不可用 | Git Bash PATH 不含 MySQL bin | Node.js 脚本代替 CLI |
| 2 | drizzle-kit 连不上 DB | 未加载 .env | dotenv.config() 显式加载 |
| 3 | datetime 插入报错 | 传了字符串而非 Date 对象 | 改用 `new Date()` |
| 4 | 顶层 await 报错 | CJS 不支持顶层 await | 改为 async init 函数 |

---

# AI 编码通病总结

以下是在本次项目开发中暴露出的 AI 编码助手典型问题，按严重程度排序。

## 通病 1：一次性写完所有代码，零逐步验证（Big Bang Syndrome）

**表现**：在项目初期一口气创建了 40+ 个源文件（路由、组件、页面、配置……），写完所有代码之后才开始运行测试。结果后端连续暴露出 4 个 bug：datetime 类型错误、top-level await 不兼容、drizzle-kit 读不到 .env、mysql CLI 不可用。

**为什么会这样**：AI 倾向于"先交付完整方案"，把所有文件都生成好再回头看。人类开发者则通常是写一个模块 → 跑起来 → 修 bug → 再写下一个。逐步验证能在第一时间发现并修复问题，而不是积压到最后一锅端。

**正确做法**：
- 先搭最小骨架（Express 能启动、Vite 能渲染）
- 每加一个路由就 curl 测试一次
- 数据库 schema 建完立刻跑 seed 验证
- 前端每加一个页面就在浏览器看效果

---

## 通病 2：对不熟悉的 API 凭"猜测"写代码，不查文档

**表现**：

| 猜测 | 实际 | 后果 |
|------|------|------|
| Drizzle datetime 传 ISO 字符串就行 | Drizzle MySQL 驱动内部会调用 `.toISOString()`，字符串没有这个方法 | 运行时 crash |
| tsx 默认支持 top-level await | tsx 默认 CJS 输出，CJS 不支持 | 启动失败 |
| drizzle-kit 会自动加载 .env | 它不会，必须显式 `dotenv.config()` | 连接被拒 |
| `process.env` 在 drizzle.config.ts 中可直接用 | 需要先加载 dotenv | password 为空 |

**为什么会这样**：AI 的训练数据中包含大量"看起来像正确代码"的片段，但缺乏对库内部实现细节的精确记忆。面对不确定的 API 行为时，AI 倾向于生成"看起来合理"的代码而非停下来确认。

**正确做法**：遇到不熟悉的 API 行为（如 datetime 应该传什么格式、CLI 工具是否加载 .env）时，应该用 WebSearch 查文档或 Grep 项目依赖的源码，而不是靠经验猜测。

---

## 通病 3：环境假设错误（Linux 思维）

**表现**：
- 在 Windows + Git Bash 中直接用 `mysql` 命令 → 不可用
- 拼出完整路径 `"C:/Program Files/MySQL/..."` 带空格 → bash 解析失败
- 用 `lsof` 杀进程 → Windows 没有这个命令
- 假设 `D:\nodejs\node_cache\` 有写权限 → EPERM

**为什么会这样**：AI 的训练数据以 Linux/macOS 为主，对 Windows 环境的特殊性（路径空格、权限模型、命令差异）不够敏感。

**正确做法**：在 Windows 环境下优先用跨平台方案（Node.js 脚本代替 shell 命令），并对每一条涉及系统命令的操作先确认兼容性。

---

## 通病 4：后台 Agent 静默失败，无法自我感知

**表现**：启动了 Plan 设计 agent 后，我两次告诉用户"agent 还在运行中"。实际上 agent 输出文件为 0 字节——它从未真正启动。直到用户催促，我用 `TaskOutput` 查不到、`SendMessage` 报了 "stopped by user"，才发现它早已终止。

**为什么会这样**：
- 启动 agent 后我只检查了工具返回的 output_file 路径存在，就认为它在运行
- 没有主动监控 agent 的实际输出
- 用户问"还在运行吗"时，我基于"启动成功"的假象回答"正在后台运行"

**正确做法**：
- 启动 agent 后应该在几秒内验证它是否真的开始产出（检查输出文件大小 > 0）
- 如果 agent 长时间无响应，主动终止并重试，而不是被动等待
- 告诉用户"不确定 agent 是否在运行，我来检查一下"而不是直接说"还在运行"

---

## 通病 5：修复 Bug 靠试错而非定位根因

**表现**：修复 `drizzle.config.ts` 的 .env 加载问题时：
- 第一次尝试：`__dirname`（CJS 写法，不适用）
- 第二次尝试：`import.meta.url` + `fileURLToPath`（ESM 写法，drizzle-kit 不支持）
- 第三次才用 `process.cwd()`（成功）

3 次尝试才找到正确方案。如果我一开始就读 drizzle-kit 文档确认它执行配置文件的运行环境，一次就能写对。

**为什么会这样**：AI 接到错误信息后会快速生成一个修复方案，如果用户拒绝或修复失败，就再换一个。这本质上是"穷举试错"而非"分析根因"。人类优秀开发者会先花时间理解错误发生的原因，再一次性给出正确修复。

**正确做法**：遇到错误时先问"为什么会发生这个错误"，而不是"怎么修才能消除这个错误"。对于陌生工具的行为，优先查文档/源码确认，而不是用不同写法轮番试探。

---

## 通病 6：过度工程化，缺少"够用就好"的判断

**表现**：这是一个个人博客，但我设计了完整的全栈架构——前后端分离、JWT 认证、OR-M、种子数据、后台管理面板、分页、搜索、Giscus……用户其实只需要一个能写文章、能展示的博客。

**为什么会这样**：AI 接到"搭建个人博客"的需求后，会按照"最佳实践"和"生产级标准"去设计，忽略了"个人博客"这个场景下很多复杂设计是多余的。没有主动问用户："你真的需要后台管理面板吗？用 Markdown 文件 + Git 提交是不是更简单？"

**正确做法**：在给出方案之前，应该先确认用户的真实需求边界，而不是默认按最大化方案实施。对于个人小项目，"能用 > 完善"。

---

## 总结

这些通病背后有一个共同的根因：**AI 编码助手倾向于"快速交付大量代码"，而优秀人类开发者倾向于"小步验证、逐层构建"**。AI 的优势是速度快、知识面广，但劣势是不善于自我纠错、不善于判断"够不够"、对环境差异不够敏感。

在后续开发中，如果遵循以下原则可以有效减少这些问题：

1. **增量构建**：每写完一个模块就运行验证，不攒到最后
2. **查文档优先于猜代码**：不确定 API 行为时先查再写
3. **考虑运行环境**：Windows/Linux/macOS 的差异是常见的坑
4. **监控后台任务**：启动 agent 后检查它是否真的在工作
5. **定位根因再修**：不理解错误原因就不动手修
6. **问用户边界**：做多大、做多复杂，比怎么做更重要
