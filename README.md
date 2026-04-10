# 酱菜内推系统

连接校友与学生的垂直招聘微信小程序。

## 核心流程

```
校友发布职位 → 教师背书审核 → 学生浏览申请 → 简历快照流转 → 内推权益解锁
```

## 功能概览

### 学生
- 浏览已发布职位（搜索、筛选）
- 申请内推、查看申请进度
- 申请通过后解锁内推码和联系方式

### 校友
- 发布内推职位
- 查看学生申请和简历
- 通过/拒绝申请

### 教师
- 审核职位背书（确认真实性）
- 查看平台统计数据（申请趋势、热门岗位、排名等）

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | 微信小程序原生（WXML / WXSS / JS） |
| 渲染引擎 | glass-easel + Skyline |
| UI 组件库 | TDesign Miniprogram v1.9.3 |
| 图表 | ECharts for WeChat v1.0.2 |
| 后端 | 微信云开发（云函数 + 云数据库） |
| 语言 | 页面 JS / 工具 TS |

## 项目结构

```
miniprogram-2/
├── miniprogram/                  # 小程序源码
│   ├── app.js / app.json / app.wxss
│   ├── pages/
│   │   ├── job_list/             # [TabBar] 首页 - 职位列表
│   │   ├── application_progress/ # [TabBar] 申请进度
│   │   ├── user_profile/         # [TabBar] 个人中心
│   │   ├── job_detail/           # 职位详情
│   │   ├── post_job/             # 发布职位
│   │   └── teacher_stats/        # 教师统计面板
│   ├── utils/util.ts
│   ├── miniprogram_npm/          # npm 构建产物（TDesign, ECharts）
│   └── assets/                   # 图标、字体
├── cloudfunctions/               # 云函数
│   ├── login/                    # 用户登录/注册
│   ├── getJobList/               # 职位列表（分页+搜索）
│   ├── getJobDetail/             # 职位详情
│   ├── applyJob/                 # 申请职位
│   └── initData/                 # 种子数据
├── prototype/                    # HTML 原型页面
├── docs/                         # 项目文档
│   ├── prd.md                    # 产品需求文档
│   ├── database-schema.md        # 数据库设计
│   └── architecture-issues.md    # 架构问题与改进建议
├── .claude/                      # Claude Code 配置
│   ├── CLAUDE.md                 # Claude 工作指南（入口）
│   └── rules/                    # 开发规范
├── typings/                      # TypeScript 类型定义
├── project.config.json           # 微信开发者工具配置
├── tsconfig.json                 # TypeScript 编译配置
└── package.json                  # npm 依赖
```

## 数据库集合速查

| 集合 | 说明 | 关键字段 |
|------|------|----------|
| `users` | 用户信息 | `userType`, `nickName`, `avatarUrl` |
| `companies` | 企业信息 | `name`, `industry`, `size` |
| `jobs` | 职位 | `title`, `salary`, `publisherId`, `companyId` |
| `applications` | 申请记录 | `jobId`, `userId`, `status` |

## 开发环境

### 前置要求

- [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
- Node.js 14+
- 微信小程序 AppID（已配置：`wxde50d797e8fd2c38`）

### 启动步骤

1. 克隆项目
2. 用微信开发者工具打开项目根目录
3. 安装 npm 依赖：`npm install`
4. 在开发者工具中构建 npm：工具 → 构建 npm
5. 确保 `project.config.json` 中 `miniprogramRoot` 指向 `miniprogram/`

### 云函数部署

1. 在微信开发者工具中选择云开发环境
2. 右键 `cloudfunctions/` 下各函数目录 → 上传并部署

## 开发状态

| 模块 | 状态 | 说明 |
|------|------|------|
| 页面 UI | 基本完成 | 6 个页面均已实现，使用 mock 数据 |
| 云函数 | 部分完成 | 5 个已编写，4 个待实现 |
| 数据接入 | 未开始 | 前端全部使用 mock 数据，未调用云函数 |
| 登录系统 | 模拟实现 | 使用 ActionSheet 选择角色，无真实鉴权 |
| 背书审核 | 未实现 | 业务流程未编码 |
| 敏感字段保护 | 未实现 | 内推码和联系方式未做条件过滤 |
| 简历快照 | 未实现 | 申请时未创建简历深拷贝 |

## 文档

| 文档 | 说明 |
|------|------|
| [docs/prd.md](docs/prd.md) | 产品需求文档 |
| [docs/database-schema.md](docs/database-schema.md) | 数据库设计（含当前实际、目标方案、差异对照） |
| [docs/architecture-issues.md](docs/architecture-issues.md) | 架构问题与改进建议 |
| [.claude/CLAUDE.md](.claude/CLAUDE.md) | Claude Code 工作指南 |

## AppID

`wxde50d797e8fd2c38`
