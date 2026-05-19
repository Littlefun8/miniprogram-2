# 酱菜校园招聘内推系统

> 连接校友与学生的垂直校园招聘微信小程序，实现职位全生命周期管理、多角色权限流转与中台数据总览。

## 项目背景

校园招聘信息散落在微信群、朋友圈和各类平台，缺乏统一管理。校友手握内推名额却难以触达学弟学妹，学生面临信息不对称、隐私暴露和反馈低效的痛点。本系统针对这一垂直场景，构建了"校友发布 → 教师审核 → 学生投递 → 简历快照流转 → 内推权益解锁"的完整业务闭环。

## 核心流程

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌──────────────┐    ┌─────────┐
│ 校友发布 │───>│ 教师审核 │───>│ 学生浏览 │───>│ 投递 & 简历  │───>│ 内推解锁 │
│  职位   │    │  背书   │    │  申请   │    │  快照流转    │    │ 敏感数据 │
└─────────┘    └─────────┘    └─────────┘    └──────────────┘    └─────────┘
   postJob       auditJob     applyJob       resumeSnapshot      referralCode
   status:       status:      防重复投递     + jobSnapshot       contactWechat
   pending       published    原子计数自增                       jobLink
```

## 技术架构

| 层级 | 技术选型 | 说明 |
|------|----------|------|
| 前端框架 | 微信小程序原生 (WXML/WXSS/JS) | 非跨平台方案，充分利用微信生态 API |
| 渲染引擎 | glass-easel | 微信新一代渲染引擎 |
| UI 组件库 | TDesign Miniprogram v1.9.3 | 全局注册 13 个组件 |
| 后端 | 微信云开发 (云函数 + 云数据库) | 免服务器运维，云函数 Node.js 运行时 |
| 数据库 | 云数据库 (NoSQL) | 6 个集合，无 SQL 联表，靠内存聚合 |
| 开发工具 | Claude Code / Cursor | AI 辅助编码，云函数与前端联动开发 |

## 技术亮点

### 1. 有限状态机 + 服务端强校验

职位（`pending → published → closed`）和申请（`pending → processing → accepted/rejected`）的状态流转通过云函数侧的 `VALID_STATUS_TRANSITIONS` 字典进行严格的拓扑排序校验，禁止逆向回退和越级跳跃，从服务端杜绝状态篡改。

### 2. 字段级动态访问控制（数据门控）

`getJobDetail` 云函数根据当前用户对该职位的申请状态，在服务端物理删除 `referralCode`、`contactWechat`、`jobLink` 三个敏感字段后再返回给前端，确保即使抓包也无法获取未授权数据。

### 3. 原子自增锁防写冲突

高频投递场景下，`applyJob` 云函数使用 `db.command.inc(1)` 对职位的 `applicationCount` 执行原子自增，规避并发投递造成的数据统计踩踏。

### 4. 状态机驱动的异步通知机制

`auditJob` 和 `updateApplicationStatus` 云函数在执行状态流转时自动向 `notifications` 集合写入结构化通知，实现审批进度的实时触达，无需轮询。

### 5. 多路并行查询 + 内存聚合（NoSQL 跨集合联查）

`getTeacherStats` 云函数通过 `Promise.all` 并行查询 users、jobs、applications、alumni 四张集合，在云函数侧用 JavaScript 进行分组计数、排序、趋势聚合和漏斗计算，实现毫秒级数据看板渲染，无需 SQL `JOIN`。

### 6. 角色权限动态渲染

前端根据本地缓存和云端回传的 `userType` 字段，在个人中心页面通过 `wx:if` 条件渲染实现菜单的动态级联权限控制：学生/校友/教师看到不同功能入口，非授权角色点击时在云函数侧二次拦截。

## 功能模块

### 三角色权限体系

| 功能 | 学生 | 校友 | 教师 |
|------|:----:|:----:|:----:|
| 浏览已发布职位 | ✓ | ✓ | ✓ |
| 搜索、城市/岗位筛选 | ✓ | ✓ | ✓ |
| 申请内推 + 简历快照 | ✓ | | |
| 查看申请进度时间线 | ✓ | | |
| 申请通过后解锁内推信息 | ✓ | | |
| 发布内推职位 | | ✓ | ✓ |
| 审核学生申请（通过/拒绝） | | ✓ | |
| 职位背书审核 | | | ✓ |
| 平台数据看板 | | | ✓ |

### 页面清单（13 页）

| 页面 | 路径 | 类型 | 说明 |
|------|------|------|------|
| 职位列表 | `pages/job_list/` | TabBar | 分页 + 搜索 + 城市/岗位筛选 |
| 申请进度 | `pages/application_progress/` | TabBar | 三 Tab 切换 + 内嵌时间线 |
| 个人中心 | `pages/user_profile/` | TabBar | 角色菜单动态渲染 + 统计 |
| 职位详情 | `pages/job_detail/` | 普通 | 4 种状态门控 + 敏感数据解锁 |
| 发布职位 | `pages/post_job/` | 普通 | 白名单字段 + 角色校验 |
| 教师审核 | `pages/audit_job/` | 普通 | 待审卡片流 + 通过/拒绝 |
| 申请管理 | `pages/manage_applications/` | 普通 | 校友两步审核 + 申请人详情 |
| 教师统计 | `pages/teacher_stats/` | 普通 | 4 模块看板 + 趋势/漏斗/排行 |
| 消息通知 | `pages/notifications/` | 普通 | 分页 + 已读标记 + 类型色块 |
| 身份认证 | `pages/verify/` | 普通 | 入口页面（流程待对接） |
| 编辑资料 | `pages/edit_profile/` | 普通 | 嵌套 profile 编辑 |
| 关于我们 | `pages/about/` | 普通 | 静态页面 |
| 帮助中心 | `pages/help/` | 普通 | 静态页面 |

### 云函数清单（19 个）

| 云函数 | 功能 | 关键设计 |
|--------|------|----------|
| `login` | OPENID 鉴权 + 自动注册 | 无 UI 阻断静默登录 |
| `setUserRole` | 首次选择角色（一次性） | 服务端硬校验防篡改，仅允许 student/alumni |
| `getJobList` | 分页职位列表 | 模糊搜索 + 多条件筛选 + 默认 published |
| `getJobDetail` | 职位详情 | 敏感字段按申请状态物理裁剪 |
| `postJob` | 发布职位 | 白名单字段 + 角色校验 + status:pending |
| `applyJob` | 申请职位 | 防重复 + 简历快照 + 职位快照 + 原子自增 |
| `getApplications` | 申请列表 | 双视角（学生/校友）+ 自动演示数据补齐 |
| `updateApplicationStatus` | 更新申请状态 | 状态机校验 + 时间线追加 + 异步通知 |
| `auditJob` | 教师审核职位 | 通过/拒绝 + 通知推送 + 拒绝需原因 |
| `getNotifications` | 获取通知 | 分页 + 未读计数 |
| `toggleFavorite` | 收藏/取消 | 支持仅查询（checkOnly） |
| `getUserProfile` | 用户资料 + 统计 | 含发布职位数和审核计数 |
| `updateProfile` | 更新用户资料 | 支持嵌套 profile |
| `recordUserAction` | 行为埋点 | view/apply/share |
| `getJobAssociation` | 职位关联信息 | 含角色过滤 |
| `getTeacherStats` | 教师统计聚合 | 并行查询 + 内存聚合 + 漏斗 + 趋势 |
| `initJobs` | 初始化种子数据 | 管理员工具 |
| `createIndexes` | 创建数据库索引 | 管理员工具 |
| `seedDemoData` | 演示数据生成 | 自动补齐展示截图用数据 |

## 项目结构

```
├── miniprogram/                      # 小程序源码
│   ├── app.js                        # 入口：云开发初始化 + 静默登录
│   ├── app.json                      # 页面路由 + TabBar + 全局组件注册
│   ├── pages/                        # 13 个页面（见上方清单）
│   ├── utils/
│   │   ├── auth.js                   # 统一鉴权模块（login/setUserRole/silentLogin）
│   │   └── util.ts                   # 工具函数
│   ├── miniprogram_npm/              # npm 构建产物（TDesign, ECharts）
│   └── assets/                       # 图标资源
├── cloudfunctions/                   # 19 个云函数（见上方清单）
├── tests/                            # 单元测试
│   └── cloudfunctions/
│       └── validation.test.js
├── prototype/                        # HTML 高保真原型（设计参考）
├── docs/                             # 项目文档
├── .claude/                          # Claude Code 工作规范配置
│   ├── CLAUDE.md                     # AI 工作指南入口
│   └── rules/                        # 代码风格 / 云函数规范 / 安全 / 测试
├── typings/                          # TypeScript 类型定义
├── package.json                      # npm 依赖
└── project.config.json               # 微信开发者工具配置
```

## 数据库设计

| 集合 | 说明 | 关键字段 | 种子数据 |
|------|------|----------|----------|
| `users` | 用户信息 | `userType`, `nickName`, `profile.student`, `profile.alumni` | 17 条 |
| `jobs` | 职位 | `title`, `salary`, `publisherId`, `status`, `applicationCount` | 12 条 |
| `applications` | 申请记录 | `jobId`, `userId`, `status`, `timeline[]`, `resumeSnapshot` | 6 条 |
| `notifications` | 通知 | `userId`, `type`, `isRead`, `relatedId` | 6 条 |
| `favorites` | 收藏 | `userId`, `jobId` | 无 |
| `userActions` | 行为日志 | `userId`, `jobId`, `actionType` | 无 |

**状态枚举**：
- jobs: `pending` → `published` → `closed` / `rejected`
- applications: `pending` → `processing` → `accepted` / `rejected`（单向不可逆）

## 开发环境

### 前置要求

- [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
- Node.js 14+
- 微信小程序 AppID（需自行申请）

### 启动步骤

1. 克隆项目并进入目录
2. 用微信开发者工具打开项目根目录
3. 在 `project.config.json` 中填入你自己的 AppID
4. 安装依赖：`npm install`
5. 在开发者工具中：工具 → 构建 npm
6. 选择云开发环境
7. 右键 `cloudfunctions/` 下各函数目录 → 上传并部署
