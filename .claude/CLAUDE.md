# CLAUDE.md -- 酱菜内推系统 Claude 工作指南

> 本文件是 Claude Code 每次启动时读取的入口文件。所有规范、约束、参考文档从这里索引。

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

## 文档索引

### 业务与产品文档（docs/）

| 文档 | 内容 | 用途 |
|------|------|------|
| [docs/prd.md](../docs/prd.md) | 产品需求文档 | 业务规则、角色权限、流程定义 |
| [docs/database-schema.md](../docs/database-schema.md) | 数据库设计 | 集合定义、字段说明、索引建议 |
| [docs/architecture-issues.md](../docs/architecture-issues.md) | 架构问题与改进建议 | 已知问题清单、优先级排序 |
| [docs/improvement-plan.md](../docs/improvement-plan.md) | 完整改进实施方案 | 28 Bug + 7 集合 + 14 云函数 + 5 阶段路线图 |

### Claude 工作规范（.claude/rules/）

| 规则文件 | 内容 |
|----------|------|
| [rules/code-style.md](rules/code-style.md) | 代码风格与命名规范 |
| [rules/cloud-functions.md](rules/cloud-functions.md) | 云函数开发规范 |
| [rules/security.md](rules/security.md) | 安全与权限规则 |
| [rules/testing.md](rules/testing.md) | 测试规范 |

## 目录结构速览

```
miniprogram-2/
├── miniprogram/                  # 小程序源码（项目根目录）
│   ├── app.js / app.json / app.wxss
│   ├── pages/                    # 12 个页面
│   │   ├── job_list/             # 首页-职位列表 (TabBar)
│   │   ├── application_progress/ # 申请进度 (TabBar)
│   │   ├── user_profile/         # 个人中心 (TabBar)
│   │   ├── job_detail/           # 职位详情
│   │   ├── post_job/             # 发布职位
│   │   ├── teacher_stats/        # 教师统计
│   │   ├── audit_job/            # 教师审核职位
│   │   ├── manage_applications/  # 校友申请管理
│   │   ├── notifications/        # 通知列表
│   │   ├── edit_profile/         # 编辑资料
│   │   ├── about/                # 关于我们
│   │   └── help/                 # 帮助中心
│   ├── utils/
│   │   ├── auth.js               # 统一鉴权模块
│   │   └── util.ts               # 工具函数
│   ├── miniprogram_npm/          # npm 构建产物
│   └── assets/                   # 图标、字体、样式
├── cloudfunctions/               # 14 个云函数
│   ├── login/                    # OPENID 鉴权 + 自动注册
│   ├── setUserRole/              # 首次选择角色（不可更改）
│   ├── getJobList/               # 职位列表（分页+搜索+筛选）
│   ├── getJobDetail/             # 职位详情（敏感字段过滤）
│   ├── postJob/                  # 发布职位（角色校验）
│   ├── applyJob/                 # 申请职位（简历快照+职位快照）
│   ├── getApplications/          # 申请列表（分页）
│   ├── updateApplicationStatus/  # 更新申请状态（权限+状态流转校验）
│   ├── auditJob/                 # 教师审核职位
│   ├── getNotifications/         # 获取通知
│   ├── toggleFavorite/           # 收藏/取消收藏
│   ├── getUserProfile/           # 用户资料+统计
│   ├── updateProfile/            # 更新用户资料
│   ├── recordUserAction/         # 行为埋点
│   └── initJobs/                 # 初始化种子数据（管理员）
├── prototype/                    # HTML 原型页面
├── docs/                         # 项目文档
├── .claude/                      # Claude Code 配置（本目录）
└── typings/                      # TypeScript 类型定义
```

## 数据库集合

| 集合 | 说明 | 状态 |
|------|------|------|
| `users` | 用户信息 | 已使用 |
| `jobs` | 职位信息 | 已使用 |
| `applications` | 申请记录 | 已使用 |
| `userActions` | 行为日志 | 已使用 |
| `notifications` | 通知 | 代码已创建，需建集合 |
| `favorites` | 收藏 | 代码已创建，需建集合 |

## Claude 不负责什么

- 不自动修改 `project.config.json`、`project.private.config.json` 等 IDE 配置
- 不处理 `miniprogram_npm/` 下的构建产物（由 `npm run build` 生成）
- 不修改 `node_modules/` 下的任何文件
- 不擅自删除 `prototype/` 目录下的原型文件（设计参考）
- 不引入 PRD 中提到的已废弃技术栈（Java/Spring Boot/MySQL/uni-app）

## 关键约束

1. **集合命名**：使用 `users`、`companies`、`jobs`、`applications`（不是 PRD 旧版的 `sys_users`、`job_applications`）
2. **字段命名**：使用 camelCase（如 `publisherId`），不用 snake_case（如 `publisher_id`）
3. **鉴权**：所有页面通过 `utils/auth.js` 统一管理登录状态，不再使用 simulateLogin
4. **云函数使用 `wx-server-sdk`**，不要引入其他数据库驱动
5. **云函数均有 OPENID 验证和参数校验**，新增函数需遵循相同模式
