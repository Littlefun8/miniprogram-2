# 酱菜内推系统 PRD (Product Requirements Document)

> 本文档描述产品业务需求。技术实现细节参见 [database-schema.md](database-schema.md) 和 [architecture-issues.md](architecture-issues.md)。

## 1. 项目概况

**项目名称**：酱菜内推系统 (Jiangcai Referral System)

**一句话描述**：连接校友与学生的垂直招聘微信小程序。

**核心流程**：

```
校友发布职位 → 教师背书审核 → 学生浏览申请 → 简历快照流转 → 内推权益解锁
```

**技术栈（实际）**：

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端 | 微信小程序原生 | WXML / WXSS / JS |
| UI 库 | TDesign Miniprogram | 13 个全局注册组件 |
| 图表 | ECharts for WeChat | 教师统计页使用 |
| 后端 | 微信云开发 | 云函数 (Node.js) + 云数据库 (NoSQL) |
| 状态管理 | wx.Storage | `isLoggedIn` / `userType` / `userInfo` |

> **注意**：早期 PRD 曾规划使用 uni-app + Vue 3 + TypeScript，实际开发选择了微信原生方案。本文档已更新为实际使用的技术栈。

---

## 2. 用户角色

| 角色 | 标识 | 权限说明 | 实现状态 |
|------|------|----------|----------|
| 学生 (Student) | `userType: 'student'` | 浏览职位、申请内推、查看申请状态 | 页面已实现（mock 数据） |
| 校友 (Alumni) | `userType: 'alumni'` | 发布职位、管理申请、查看简历 | 页面已实现（mock 数据） |
| 教师 (Teacher) | `userType: 'teacher'` | 审核职位背书、查看统计 | 统计页已实现（mock 数据） |
| 管理员 (Admin) | `userType: 'admin'` | 平台运营、数据管理 | 未实现 |

> **当前登录方式**：使用 `wx.showActionSheet()` 模拟角色选择，无后端校验。

---

## 3. 页面结构与路由

### TabBar 页面

| 页面 | 路径 | Tab 标题 | 功能 |
|------|------|----------|------|
| 职位列表 | `pages/job_list/job_list` | 职位 | 首页，搜索、筛选、职位卡片列表 |
| 申请进度 | `pages/application_progress/application_progress` | 进度 | 按状态分 Tab 展示申请记录 |
| 个人中心 | `pages/user_profile/user_profile` | 我的 | 登录、角色切换、个人统计 |

### 非 TabBar 页面

| 页面 | 路径 | 入口 | 功能 |
|------|------|------|------|
| 职位详情 | `pages/job_detail/job_detail` | 职位列表点击 | 职位详情、推荐人信息、关联信息、申请按钮 |
| 发布职位 | `pages/post_job/post_job` | 个人中心菜单 | 表单：标题、薪资、地点、标签、公司、发布人 |
| 教师统计 | `pages/teacher_stats/teacher_stats` | 个人中心（教师角色） | 统计概览、趋势图、热门岗位、排名 |

---

## 4. 核心业务流程

### 4.1 职位发布与背书审核

```
校友填写职位信息并上传背书凭证
       ↓
职位状态：pending（待审核）
       ↓
教师查看背书凭证并审核
  ├── 通过 → status: 'published'（招聘中），填充审核教师信息
  └── 拒绝 → status: 'rejected'（被驳回），附拒审理由
       ↓
学生端仅展示 status: 'published' 的职位
```

**实现状态**：
- 校友发布职位页面：已实现（表单 UI，提交未接入云函数）
- 教师审核功能：未实现
- 背书凭证上传：未实现
- 状态过滤展示：未实现（当前展示全部 mock 数据）

### 4.2 内推解锁机制

**敏感字段**：`referralCode`（内推码）、`contactWechat`（联系微信）

**规则**：仅当学生在该职位的申请状态为 `accepted` 时，才展示敏感字段。

**实现状态**：未实现。当前前端 mock 中，`application_progress` 页面的"已完成"申请会展示 mock 的内推码和联系方式。

### 4.3 简历快照机制

**触发**：学生点击"申请职位"时

**机制**：将学生当前简历数据深拷贝到申请记录中，固化历史数据，防止后续修改导致信息不一致。

**实现状态**：未实现。当前 `applyJob` 云函数未创建简历快照。

### 4.4 申请状态流转

```
pending（待处理）→ processing（处理中）→ accepted（已通过）/ rejected（不合适）
```

**实现状态**：
- 前端 mock 使用 `pending` / `processing` / `completed` 三种状态
- 云函数 `applyJob` 创建申请时状态为 `'pending'`
- 状态流转处理函数（`processApplication`）未实现

---

## 5. 前后端职责划分

### 5.1 前端可直接操作数据库的场景（配合 Security Rules）

- 查询公开职位列表（无敏感字段）
- 用户个人信息更新（仅限本人）
- 简单统计查询

> 当前前端未使用任何数据库直接操作，全部使用 mock 数据。

### 5.2 必须通过云函数的场景

- 职位详情获取（含敏感字段过滤）
- 申请职位（含简历快照创建）
- 背书审核（仅教师可操作）
- 申请处理（仅校友可操作）
- 任何涉及状态流转的操作

### 5.3 云函数清单

| 函数名 | 状态 | 功能 |
|--------|------|------|
| `login` | 已编写 | 用户登录/注册（OPENID 鉴权） |
| `getJobList` | 已编写 | 分页职位列表（关键词搜索 + 关联查询） |
| `getJobDetail` | 已编写 | 职位详情（关联发布人和公司） |
| `applyJob` | 已编写 | 申请职位（防重复投递） |
| `initData` | 已编写 | 初始化种子数据（开发工具） |
| `auditJob` | 未实现 | 教师审核职位背书 |
| `processApplication` | 未实现 | 校友处理申请（通过/拒绝） |
| `updateProfile` | 未实现 | 更新用户资料 |
| `logBehavior` | 未实现 | 用户行为埋点 |

---

## 6. 数据模型概览

> 详细字段定义见 [database-schema.md](database-schema.md)

| 集合名 | 说明 | 主要字段 |
|--------|------|----------|
| `users` | 用户（校友/学生/教师） | `nickName`, `avatarUrl`, `userType`, `companyId` |
| `companies` | 企业 | `name`, `industry`, `size`, `location` |
| `jobs` | 职位 | `title`, `salary`, `location`, `tags`, `publisherId`, `companyId` |
| `applications` | 职位申请 | `jobId`, `userId`, `status`, `createTime` |

---

## 7. 两种背书机制

| 类型 | 时机 | 必要性 | 说明 |
|------|------|--------|------|
| **职位背书** | 校友发布职位时 | 必须 | 校友上传背书凭证图片，教师审核确认职位真实性 |
| **申请背书** | 学生申请职位时 | 可选 | 学生上传教师推荐信/截图，增加通过率 |

---

## 8. 代码审查检查清单

### 功能检查

- [ ] 职位发布时是否上传了背书凭证？
- [ ] 敏感字段是否根据申请状态有条件返回？
- [ ] 申请时是否创建了完整的简历快照（深拷贝）？
- [ ] 是否存在简单 CRUD 可改为前端直接调用？
- [ ] 状态流转是否符合业务规则？

### 权限检查

- [ ] 云函数是否通过 OPENID 校验用户身份？
- [ ] 敏感操作是否校验了用户角色（`userType`）？
- [ ] 前端是否未直接操作敏感数据？

### 数据一致性

- [ ] 字段命名是否统一 camelCase？
- [ ] 集合名是否使用实际名称（`users`/`applications`）？
- [ ] 状态值是否使用字符串枚举？

---

**文档版本**：v2.0
**最后更新**：2026-04-10
**变更说明**：基于实际代码重写，修正技术栈、集合命名、字段命名
