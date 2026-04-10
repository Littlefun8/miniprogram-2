# 代码风格与命名规范

## 语言

- 页面文件使用 JavaScript（.js），不使用 TypeScript
- 工具函数使用 TypeScript（.ts）
- 云函数使用 JavaScript（Node.js 运行时）

## 命名规范

### 文件命名

- 页面文件：`snake_case`（如 `job_list.js`、`application_progress.js`）
- 云函数目录：`camelCase`（如 `getJobDetail`、`applyJob`）
- 工具文件：`camelCase`（如 `util.ts`）

### 变量与字段命名

- 使用 `camelCase`：`publisherId`、`companyId`、`createTime`
- 不使用 `snake_case`：避免 `publisher_id`、`created_at`
- 布尔值以 `is` 开头：`isLoggedIn`、`isVerified`
- 私有变量以下划线开头：`_openid`

### 集合命名

- 使用简单名词：`users`、`companies`、`jobs`、`applications`
- 不使用前缀（旧 PRD 中的 `sys_users` 已废弃）

### 状态字段

- 使用小写字符串：`'pending'`、`'accepted'`、`'rejected'`
- 不使用数字枚举（旧 PRD 中的 0/1/2/3 状态码已废弃）

## 代码组织

### 页面文件结构顺序

```javascript
// 1. 页面数据定义
data: { ... }

// 2. 生命周期函数
onLoad(options) { ... }
onShow() { ... }
onReady() { ... }

// 3. 事件处理函数（按功能分组）
handleSearch() { ... }
handleFilter() { ... }

// 4. 数据加载函数
loadData() { ... }

// 5. 工具函数
formatDate(date) { ... }
```

### 样式规范

- 全局样式在 `app.wxss` 中定义
- 页面样式使用 scoped（小程序默认隔离）
- 使用 TDesign 组件变量保持主题一致性
- 颜色值：主色 `#0079FE`，灰色文字 `#999999`，背景 `#f7f7f7`

## 禁止事项

- 不要在页面 JS 中引入 npm 包（小程序不支持）
- 不要使用 `var`，统一使用 `const` / `let`
- 不要在 `data` 中存储大量数据，超过 256KB 会影响性能
- 不要使用 `wx.cloud.database()` 在前端直接操作数据库（除非有 Security Rules 保护）
