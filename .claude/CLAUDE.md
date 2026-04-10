# CLAUDE.md -- 酱菜内推系统 Claude 工作指南

> 本文件是 Claude Code 每次启动时读取的入口文件。所有规范、约束、参考文档从这里索引。

## 项目概况

**项目名称**：酱菜内推系统 (Jiangcai Referral System)
**项目类型**：微信小程序（原生开发，非 uni-app）
**核心功能**：连接校友与学生的垂直招聘平台，核心流程为：校友发布职位 → 教师背书审核 → 学生申请 → 简历快照流转 → 内推权益解锁
**当前状态**：原型开发阶段。前端页面使用 mock 数据，云函数已编写但未接入前端。

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
│   ├── pages/                    # 6 个页面
│   │   ├── job_list/             # 首页-职位列表 (TabBar)
│   │   ├── application_progress/ # 申请进度 (TabBar)
│   │   ├── user_profile/         # 个人中心 (TabBar)
│   │   ├── job_detail/           # 职位详情
│   │   ├── post_job/             # 发布职位
│   │   └── teacher_stats/        # 教师统计
│   ├── utils/util.ts             # 工具函数
│   ├── miniprogram_npm/          # npm 构建产物
│   └── assets/                   # 图标、字体、样式
├── cloudfunctions/               # 云函数
│   ├── login/                    # 用户登录/注册
│   ├── getJobList/               # 职位列表（分页+搜索）
│   ├── getJobDetail/             # 职位详情
│   ├── applyJob/                 # 申请职位
│   ├── initData/                 # 初始化种子数据
│   └── quickstartFunctions/      # [待删除] 模板残留
├── prototype/                    # HTML 原型页面
├── docs/                         # 项目文档
├── .claude/                      # Claude Code 配置（本目录）
└── typings/                      # TypeScript 类型定义
```

## Claude 不负责什么

- 不自动修改 `project.config.json`、`project.private.config.json` 等 IDE 配置
- 不处理 `miniprogram_npm/` 下的构建产物（由 `npm run build` 生成）
- 不修改 `node_modules/` 下的任何文件
- 不擅自删除 `prototype/` 目录下的原型文件（设计参考）
- 不引入 PRD 中提到的已废弃技术栈（Java/Spring Boot/MySQL/uni-app）

## 关键约束

1. **集合命名**：使用 `users`、`companies`、`jobs`、`applications`（不是 PRD 旧版的 `sys_users`、`job_applications`）
2. **字段命名**：使用 camelCase（如 `publisherId`），不用 snake_case（如 `publisher_id`）
3. **前端目前全是 mock 数据**，修改页面逻辑时注意区分 mock 和真实数据调用
4. **云函数使用 `wx-server-sdk`**，不要引入其他数据库驱动
