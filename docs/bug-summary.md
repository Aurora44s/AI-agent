# Bug 总结文档

> 项目：遇梦博客（Vue 3 + Express + MySQL + Tailwind CSS）
> 记录时间：2026-07-10

---

## 1. 后台站点设置保存失败（500 Internal Server Error）

### 现象
访问后台管理页面，点击保存站点设置时返回 500 错误。

### 根因（双重问题）

**问题 A — Express 路由匹配顺序错误**

`PUT /settings` 路由定义在 `PUT /:id` 之后，Express 按注册顺序匹配路由，`/settings` 被 `/:id` 劫持（`settings` 被当作文章 ID），进入了文章更新逻辑，返回"更新文章失败"。

```ts
// ❌ 错误顺序
router.put("/:id", ...)       // 先注册
router.put("/settings", ...)  // settings 被 :id 匹配

// ✅ 正确顺序
router.put("/settings", ...)  // 固定路径必须在前
router.put("/:id", ...)       // 动态参数在后
```

**问题 B — MySQL 保留字 `key` 与 Drizzle ORM 冲突**

`settings` 表的主键列名是 `key`（MySQL 保留字），Drizzle ORM 的 `onDuplicateKeyUpdate` 生成的 SQL 未正确转义，导致 SQL 语法错误。

```ts
// ❌ Drizzle ORM 对保留字 key 处理有问题
await db.insert(settings).values({ key, value })
  .onDuplicateKeyUpdate({ set: { value } });

// ✅ 使用原生 SQL 手动转义
await db.execute(sql`
  INSERT INTO settings (\`key\`, value) VALUES (${k}, ${v})
  ON DUPLICATE KEY UPDATE value = VALUES(value)
`);
```

### 教训
1. Express 路由中**固定路径必须写在动态参数路径前面**
2. 数据库列名避免使用保留字；如果无法避免，使用原生 SQL 并手动转义
3. ORM 不是银弹，特殊场景需要回退到原生 SQL

---

## 2. 移动端菜单动画不生效

### 现象
菜单面板打开后，菜单项没有依次弹出动画效果。

### 根因
菜单面板通过 `<Teleport to="body">` 渲染到 `<body>` 下，但 `@keyframes menuItemIn` 定义在 Vue 组件的 `<style scoped>` 中。Vue 的 scoped CSS 会为选择器添加 `data-v-xxx` 属性，而 Teleport 到 body 的元素没有该属性，导致关键帧动画不生效。

### 修复
将 `@keyframes` 和 transition 样式移到**非 scoped** 的 `<style>` 块中。

```html
<!-- Teleported 元素需要的样式不能 scoped -->
<style>
@keyframes menuItemIn { ... }
.menu-slide-enter-active { ... }
</style>

<style scoped>
/* 组件内部样式保持 scoped */
</style>
```

### 教训
`<Teleport>` 的目标元素不在组件 DOM 树内，scoped CSS 对其无效。Teleported 内容需要的样式必须写在全局（非 scoped）样式块中。

---

## 3. 移动端菜单被裁切（遮罩和抽屉高度异常）

### 现象
移动端菜单的遮罩层和抽屉面板高度被限制在 56px（header 高度），Logo 以外的菜单项全部不可见。

### 根因
Header 使用了 `backdrop-blur-md`（CSS `backdrop-filter: blur()`），`backdrop-filter` 会**创建新的包含块（containing block）**，导致内部的 `position: fixed` 元素相对于 header 定位而非视口。菜单面板的 `fixed inset-0` 和 `h-screen` 都被限制在 header 的 56px 高度内。

### 修复
使用 `<Teleport to="body">` 将菜单面板移到 `<body>` 下，脱离 header 的包含块。

### 教训
`backdrop-filter`、`transform`、`filter`、`perspective` 等 CSS 属性会创建包含块，影响内部 `fixed` 元素的定位基准。遇到 fixed 元素表现异常时，检查祖先元素是否用了这些属性，必要时使用 Teleport。

---

## 4. 移动端文章内容消失

### 现象
移动端滚动后，文章列表内容几乎不可见。

### 根因
滚动动画进度使用 `window.innerHeight` 作为基准计算透明度。但移动端轮播图高度只有 `80vh`（后改 `90vh`），远小于 `window.innerHeight`。用户滚完轮播图后，进度只有 0.8~0.9，文章 `opacity` 只有 0.8~0.9，在当前半透明背景下难以辨认。

### 修复
改用轮播图实际高度 `carouselWrapper.value?.offsetHeight` 替代 `window.innerHeight`。

```ts
// ❌ 固定使用视口高度
const h = window.innerHeight;

// ✅ 使用元素实际高度
const h = carouselWrapper.value?.offsetHeight || window.innerHeight;
```

### 教训
涉及元素实际尺寸的计算，要使用元素的 `offsetHeight`/`getBoundingClientRect()`，而不是假设它等于某个固定值（如视口高度）。

---

## 5. `h-full` 在特定容器中失效

### 现象
菜单抽屉面板设置 `h-full` 但高度异常。

### 根因
`h-full`（`height: 100%`）依赖父元素的显式高度。当抽屉位于 header 内部且 header 未设置明确高度时，百分比高度无法正确计算。

### 修复
使用 `h-screen`（`100vh`）替代 `h-full`，直接引用视口高度。

### 教训
`height: 100%` 需要祖先链上有明确高度值。对于需要覆盖整个视口的 fixed 元素，`h-screen`（100vh）比 `h-full` 更可靠。

---

## 6. 意外删除 `loadPosts` 函数

### 现象
首页报错 `ReferenceError: loadPosts is not defined`。

### 根因
编辑脚本时整体替换 `script setup` 内容，新代码中漏掉了 `loadPosts` 函数定义。

### 教训
替换大段代码时，先确认新代码包含旧代码中的所有关键函数。使用 Git 进行版本控制，方便回滚。

---

## 总结

| # | 问题类型 | 关键词 |
|---|----------|--------|
| 1 | 后端路由 | Express 路由顺序、MySQL 保留字、Drizzle ORM |
| 2 | CSS 作用域 | scoped CSS、Teleport、keyframes |
| 3 | CSS 布局 | backdrop-filter、containing block、fixed 定位 |
| 4 | JS 计算 | offsetHeight、滚动动画、响应式 |
| 5 | CSS 单位 | h-full vs h-screen、百分比高度 |
| 6 | 代码编辑 | 脚本替换遗漏 |

> 💡 核心原则：**理解底层机制，不要盲目信任框架/工具的默认行为。遇到问题先定位到根本原因，再选择最合适的修复方案。**
