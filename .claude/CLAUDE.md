# CLAUDE.md -- 酱菜内推系统 Claude 工作指南

> 本文件是 Claude Code 每次启动时读取的入口文件。所有规范、约束、参考文档从这里索引。
>
> **金标准**：任何时候，一个新人仅凭本文件索引的文档体系，就能在 30 分钟内理解项目全貌并开始开发。

## 项目概况

**项目名称**：酱菜内推系统 (Jiangcai Referral System)
**项目类型**：微信小程序（原生开发，非 uni-app）
**核心功能**：连接校友与学生的垂直招聘平台，核心流程为：校友发布职位 → 教师背书审核 → 学生申请 → 简历快照流转 → 内推权益解锁
**当前状态**：核心功能已实现。前端接入云函数，具备完整登录鉴权、职位发布/审核/申请/处理闭环、通知系统。

## 为什么用原生小程序而不是 uni-app

最初计划使用 uni-app，但最终选择了原生微信小程序 + 云开发方案。原因是：
- 团队对微信原生 API 更熟悉
- 云开发免服务器运维，适合快速验证
- 不需要跨平台，只做微信小程序
- PRD 中关于 uni-app 的描述是早期规划，请忽略

## 技术栈（实际）

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端框架 | 微信小程序原生 | WXML / WXSS / JS，非 Vue，非 TypeScript（页面） |
| 组件框架 | glass-easel | 微信新一代渲染引擎 |
| UI 库 | TDesign Miniprogram v1.9.3 | 13 个全局注册组件 |
| 图表 | ECharts for WeChat v1.0.2 | 已引入但教师统计页暂用表格替代 |
| 后端 | 微信云开发 | 云函数 (Node.js) + 云数据库 (NoSQL) |
| 语言 | 页面用 JS，工具用 TS | 仅 utils/util.ts 使用 TypeScript |
| 云环境 | `cloud1-3g3q2srz04d1d705` | 在 app.js 中初始化 |

## 文档索引

### 业务与产品文档（docs/）

| 文档 | 内容 | 用途 |
|------|------|------|
| [docs/prd.md](../docs/prd.md) | 产品需求文档 | 业务规则、角色权限、流程定义 |
| [docs/database-schema.md](../docs/database-schema.md) | 数据库设计 | 集合定义、字段说明、索引建议 |
| [docs/architecture-issues.md](../docs/architecture-issues.md) | 架构问题与改进建议 | 已知问题清单、优先级排序 |
| [docs/improvement-plan.md](../docs/improvement-plan.md) | 完整改进实施方案 | Bug 清单 + 集合定义 + 云函数规范 + 路线图 |
| [docs/handover-2026-04-13.md](../docs/handover-2026-04-13.md) | 交接报告（上次会话） | 职位详情改版 + 筛选优化 + 申请门槛 |
| [docs/implementation-job-detail-redesign.md](../docs/implementation-job-detail-redesign.md) | 职位详情改版设计文档 | 设计决策 + 实施内容 |

### Claude 工作规范（.claude/rules/）

| 规则文件 | 内容 |
|----------|------|
| [rules/code-style.md](rules/code-style.md) | 代码风格与命名规范 |
| [rules/cloud-functions.md](rules/cloud-functions.md) | 云函数开发规范（含全部 17 个云函数清单） |
| [rules/security.md](rules/security.md) | 安全与权限规则 |
| [rules/testing.md](rules/testing.md) | 测试规范 |
| [rules/process-standard.md](rules/process-standard.md) | **过程文档金标准**（必读） |

## 目录结构速览

```
miniprogram-2/
├── miniprogram/                  # 小程序源码（项目根目录）
│   ├── app.js                    # 入口：云开发初始化 + 静默登录
│   ├── app.json                  # 页面路由 + TabBar + 全局组件
│   ├── app.wxss                  # 全局样式
│   ├── pages/                    # 12 个页面
│   │   ├── job_list/             # 首页-职位列表 (TabBar) ✅ 已接入云函数
│   │   ├── application_progress/ # 申请进度 (TabBar) ✅ 已接入云函数
│   │   ├── user_profile/         # 个人中心 (TabBar) ✅ 已接入云函数
│   │   ├── job_detail/           # 职位详情 ✅ 已接入云函数
│   │   ├── post_job/             # 发布职位 ✅ 已接入云函数
│   │   ├── teacher_stats/        # 教师统计 ⚠️ 全部 mock 数据
│   │   ├── audit_job/            # 教师审核职位 ✅ 已接入云函数
│   │   ├── manage_applications/  # 校友申请管理 ✅ 已接入云函数
│   │   ├── notifications/        # 通知列表 ✅ 已接入云函数
│   │   ├── edit_profile/         # 编辑资料 ✅ 已接入云函数
│   │   ├── about/                # 关于我们（静态页面）
│   │   └── help/                 # 帮助中心（静态页面）
│   ├── utils/
│   │   ├── auth.js               # 统一鉴权模块（login/setUserRole/silentLogin）
│   │   └── util.ts               # 工具函数
│   ├── miniprogram_npm/          # npm 构建产物（勿手动修改）
│   └── assets/                   # 图标、字体、样式
├── cloudfunctions/               # 17 个云函数
│   ├── login/                    # OPENID 鉴权 + 自动注册
│   ├── setUserRole/              # 首次选择角色（不可更改）
│   ├── getJobList/               # 职位列表（分页+搜索+筛选+按角色过滤）
│   ├── getJobDetail/             # 职位详情（敏感字段过滤+申请状态）
│   ├── postJob/                  # 发布职位（角色校验+白名单字段）
│   ├── applyJob/                 # 申请职位（简历快照+职位快照+防重复）
│   ├── getApplications/          # 申请列表（分页+双视角：学生/校友）
│   ├── updateApplicationStatus/  # 更新申请状态（权限+状态流转校验）
│   ├── auditJob/                 # 教师审核职位（approve/reject+通知）
│   ├── getNotifications/         # 获取通知（分页+未读计数）
│   ├── toggleFavorite/           # 收藏/取消收藏（支持 checkOnly 查询）
│   ├── getUserProfile/           # 用户资料+发布职位+申请统计
│   ├── updateProfile/            # 更新用户资料
│   ├── recordUserAction/         # 行为埋点（view/apply/share）
│   ├── getJobAssociation/        # 获取职位关联信息（含角色过滤）
│   ├── createIndexes/            # 创建数据库索引（管理员一次性操作）
│   └── initJobs/                 # 初始化种子数据（管理员：清空+重置）
├── tests/                        # 单元测试
├── prototype/                    # HTML 原型页面（设计参考）
├── docs/                         # 项目文档
├── .claude/                      # Claude Code 配置（本目录）
└── typings/                      # TypeScript 类型定义
```

## 数据库集合

| 集合 | 说明 | 状态 | 种子数据 |
|------|------|------|----------|
| `users` | 用户信息 | 已使用 | initJobs 插入 17 个种子用户 |
| `jobs` | 职位信息 | 已使用 | initJobs 插入 12 个种子职位 |
| `applications` | 申请记录 | 已使用 | initJobs 插入 6 条种子申请 |
| `notifications` | 通知 | 已使用 | initJobs 插入 6 条种子通知 |
| `favorites` | 收藏 | 已使用 | 无种子数据 |
| `userActions` | 行为日志 | 已使用 | 无种子数据 |

## 功能实现状态总览

### 已完成功能

| 功能 | 云函数 | 前端页面 | 说明 |
|------|--------|----------|------|
| 用户登录/注册 | `login` | `app.js` → `auth.silentLogin()` | OPENID 鉴权 + 自动注册 |
| 角色选择 | `setUserRole` | `user_profile` | 一次性选择，不可更改 |
| 职位列表 | `getJobList` | `job_list` | 分页+搜索+城市筛选+岗位筛选 |
| 职位详情 | `getJobDetail` | `job_detail` | 敏感字段过滤+申请状态+收藏 |
| 发布职位 | `postJob` | `post_job` | 角色校验+白名单字段 |
| 申请职位 | `applyJob` | `job_detail` | 简历快照+职位快照+防重复 |
| 申请进度 | `getApplications` | `application_progress` | 双视角（学生/校友） |
| 申请处理 | `updateApplicationStatus` | `manage_applications` | 状态机校验 |
| 教师审核 | `auditJob` | `audit_job` | approve/reject + 通知 |
| 通知列表 | `getNotifications` | `notifications` | 分页+未读计数 |
| 收藏功能 | `toggleFavorite` | `job_detail` | 收藏/取消/checkOnly |
| 个人资料 | `getUserProfile` | `user_profile` | 含发布职位和申请统计 |
| 编辑资料 | `updateProfile` | `edit_profile` | 支持嵌套 profile |
| 内推通道 | `getJobDetail` | `job_detail` | 4 种状态驱动 |
| 申请门槛 | `applyJob` + 前端 | `job_detail` + `post_job` | 硬门槛+软提醒 |
| 帮助/关于 | 无 | `help` + `about` | 静态页面 |

### 未完成功能

| 功能 | 优先级 | 说明 |
|------|--------|------|
| **教师统计页（teacher_stats）** | P1 | 全部使用硬编码 mock 数据，未接入云函数 |
| **职位卡片生成** | P2 | 分享功能当前为文字复制降级方案，需 Canvas 绘制图片 |
| **数据库索引** | P2 | `createIndexes` 云函数已编写，需在云开发控制台手动执行或调试面板调用 |
| **ECharts 图表** | P2 | ECharts 已引入但 teacher_stats 暂用 CSS 表格展示 |
| **身份认证流程** | P3 | 当前 userType 由用户自选，无真实身份验证（`/pages/verify/index` 页面不存在） |
| **收藏列表页** | P3 | user_profile 中点击"我的收藏"弹窗提示"功能开发中" |
| **通知已读标记** | P3 | notifications 页面直接使用 `wx.cloud.database()` 更新，未走云函数 |

## Claude 不负责什么

- 不自动修改 `project.config.json`、`project.private.config.json` 等 IDE 配置
- 不处理 `miniprogram_npm/` 下的构建产物（由 `npm run build` 生成）
- 不修改 `node_modules/` 下的任何文件
- 不擅自删除 `prototype/` 目录下的原型文件（设计参考）
- 不引入 PRD 中提到的已废弃技术栈（Java/Spring Boot/MySQL/uni-app）

## 关键约束

1. **集合命名**：使用 `users`、`jobs`、`applications`（不是 PRD 旧版的 `sys_users`、`job_applications`）
2. **字段命名**：使用 camelCase（如 `publisherId`），不用 snake_case（如 `publisher_id`）
3. **鉴权**：所有页面通过 `utils/auth.js` 统一管理登录状态，使用 `login` + `setUserRole` 云函数
4. **云函数使用 `wx-server-sdk ~2.6.3`**，不要引入其他数据库驱动
5. **云函数均有 OPENID 验证和参数校验**，新增函数需遵循相同模式
6. **响应格式**：成功返回 `{ code: 200, data, message }`，错误使用 400/401/403/404/409/500
7. **状态枚举**：jobs 使用 `pending/published/closed/rejected`，applications 使用 `pending/processing/accepted/rejected`
8. **敏感字段**：`referralCode`、`contactWechat`、`jobLink` 仅在申请状态为 `accepted` 时返回
