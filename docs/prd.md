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
| UI 库 | TDesign Miniprogram v1.9.3 | 13 个全局注册组件 |
| 图表 | ECharts for WeChat v1.0.2 | 教师统计页使用 |
| 后端 | 微信云开发 | 云函数 (Node.js) + 云数据库 (NoSQL) |
| 鉴权 | OPENID + `utils/auth.js` | `login` 云函数 + `setUserRole` 云函数 |

> **注意**：早期 PRD 曾规划使用 uni-app + Vue 3 + TypeScript，实际开发选择了微信原生方案。本文档已更新为实际使用的技术栈。

---

## 2. 用户角色

| 角色 | 标识 | 权限说明 | 实现状态 |
|------|------|----------|----------|
| 学生 (Student) | `userType: 'student'` | 浏览职位、申请内推、查看申请状态 | ✅ 已完成 |
| 校友 (Alumni) | `userType: 'alumni'` | 发布职位、管理申请、查看简历 | ✅ 已完成 |
| 教师 (Teacher) | `userType: 'teacher'` | 审核职位背书、查看统计 | ⚠️ 审核已完成，统计页为 mock 数据 |
| 管理员 (Admin) | `userType: 'admin'` | 平台运营、数据管理 | ⚠️ 仅 initJobs 和 createIndexes |

> **当前登录方式**：使用 `login` 云函数（OPENID 鉴权），首次通过 ActionSheet 选择角色（不可更改）。

---

## 3. 页面结构与路由

### TabBar 页面

| 页面 | 路径 | Tab 标题 | 功能 | 状态 |
|------|------|----------|------|------|
| 职位列表 | `pages/job_list/job_list` | 职位 | 首页，搜索、筛选、职位卡片列表 | ✅ 已完成 |
| 申请进度 | `pages/application_progress/application_progress` | 进度 | 按状态分 Tab 展示申请记录 | ✅ 已完成 |
| 个人中心 | `pages/user_profile/user_profile` | 我的 | 登录、角色切换、个人统计 | ✅ 已完成 |

### 非 TabBar 页面

| 页面 | 路径 | 入口 | 功能 | 状态 |
|------|------|------|------|------|
| 职位详情 | `pages/job_detail/job_detail` | 职位列表点击 | 内推通道（4 种状态驱动）+ 申请 | ✅ 已完成 |
| 发布职位 | `pages/post_job/post_job` | 个人中心菜单 | 表单 + 期望专业/年级 | ✅ 已完成 |
| 教师统计 | `pages/teacher_stats/teacher_stats` | 个人中心（教师角色） | 统计概览、趋势图、排名 | ⚠️ 全部 mock 数据 |
| 教师审核 | `pages/audit_job/audit_job` | 个人中心（教师角色） | 审核 pending 职位 | ✅ 已完成 |
| 申请管理 | `pages/manage_applications/manage_applications` | 个人中心（校友角色） | 处理收到的申请 | ✅ 已完成 |
| 通知列表 | `pages/notifications/notifications` | 个人中心 | 通知消息列表 | ✅ 已完成 |
| 编辑资料 | `pages/edit_profile/edit_profile` | 个人中心 | 编辑个人资料 | ✅ 已完成 |
| 关于我们 | `pages/about/about` | 个人中心 | 静态页面 | ✅ 已完成 |
| 帮助中心 | `pages/help/help` | 个人中心 | FAQ 列表 | ✅ 已完成 |

---

## 4. 核心业务流程

### 4.1 职位发布与背书审核 ✅ 已完成

```
校友填写职位信息（含内推者有话说）
       ↓
职位状态：pending（待审核）
       ↓
教师查看并审核
  ├── 通过 → status: 'published'，填充审核教师信息，创建通知
  └── 拒绝 → status: 'rejected'，附拒审理由，创建通知
       ↓
学生端仅展示 status: 'published' 的职位
```

**实现状态**：
- ✅ 校友发布职位页面：`postJob` 云函数 + `post_job` 前端页面
- ✅ 教师审核功能：`auditJob` 云函数 + `audit_job` 前端页面
- ✅ 状态过滤展示：`getJobList` 默认只返回 `published` 状态
- ⚠️ 背书凭证上传：未实现（当前无图片上传功能）

### 4.2 内推解锁机制 ✅ 已完成

**敏感字段**：`referralCode`（内推码）、`contactWechat`（联系微信）、`jobLink`（职位链接）

**规则**：仅当学生在该职位的申请状态为 `accepted` 时，`getJobDetail` 云函数返回敏感字段。

**实现状态**：
- ✅ `getJobDetail` 云函数中根据申请状态过滤敏感字段
- ✅ 职位详情页 4 种状态驱动展示（未申请/待审核/已通过/已拒绝）

### 4.3 简历快照机制 ✅ 已完成

**触发**：学生点击"申请职位"时

**机制**：`applyJob` 云函数将学生当前简历数据深拷贝到申请记录中，固化历史数据。

**实现状态**：
- ✅ `applyJob` 云函数从 `users.profile.student.resume` 深拷贝 `resumeSnapshot`
- ✅ 同时创建 `jobSnapshot`（title、company、salary）
- ✅ 初始化 `timeline` 数组

### 4.4 申请状态流转 ✅ 已完成

```
pending（待处理）→ processing（处理中）→ accepted（已通过）/ rejected（不合适）
```

**实现状态**：
- ✅ `applyJob` 创建申请时状态为 `'pending'`
- ✅ `updateApplicationStatus` 云函数校验状态流转规则（状态机）
- ✅ 校友通过 `manage_applications` 页面处理申请
- ✅ 状态变更时追加 `timeline` 记录

### 4.5 申请门槛 ✅ 已完成

**硬门槛（资料完善度）**：
- ✅ 申请前检查 `nickName` + `department` + `major` 是否已填写
- ✅ 不完善则弹窗引导去编辑资料页

**软门槛（专业/年级匹配）**：
- ✅ 校友发布时可设置 `expectedMajors` 和 `minGrade`
- ✅ 学生申请时对比，不匹配弹窗警告但允许继续

---

## 5. 前后端职责划分

### 5.1 前端可直接操作数据库的场景（配合 Security Rules）

> 当前前端仅 `notifications` 页面直接操作数据库（标记已读），其余全部通过云函数。

### 5.2 必须通过云函数的场景

- 职位详情获取（含敏感字段过滤）— `getJobDetail`
- 申请职位（含简历快照创建）— `applyJob`
- 背书审核（仅教师可操作）— `auditJob`
- 申请处理（仅校友可操作）— `updateApplicationStatus`
- 任何涉及状态流转的操作

### 5.3 云函数清单（17 个）

| 函数名 | 状态 | 功能 |
|--------|------|------|
| `login` | ✅ 已完成 | 用户登录/注册（OPENID 鉴权） |
| `setUserRole` | ✅ 已完成 | 首次选择角色（不可更改） |
| `getJobList` | ✅ 已完成 | 分页职位列表（搜索+筛选+按角色过滤） |
| `getJobDetail` | ✅ 已完成 | 职位详情（敏感字段过滤+申请状态） |
| `postJob` | ✅ 已完成 | 发布职位（角色校验+白名单字段） |
| `applyJob` | ✅ 已完成 | 申请职位（简历快照+防重复） |
| `getApplications` | ✅ 已完成 | 申请列表（分页+双视角） |
| `updateApplicationStatus` | ✅ 已完成 | 更新申请状态（状态机校验） |
| `auditJob` | ✅ 已完成 | 教师审核职位 |
| `getNotifications` | ✅ 已完成 | 获取通知（分页+未读计数） |
| `toggleFavorite` | ✅ 已完成 | 收藏/取消收藏 |
| `getUserProfile` | ✅ 已完成 | 用户资料+统计 |
| `updateProfile` | ✅ 已完成 | 更新用户资料 |
| `recordUserAction` | ✅ 已完成 | 行为埋点 |
| `getJobAssociation` | ✅ 已完成 | 职位关联信息 |
| `createIndexes` | ✅ 已完成 | 创建数据库索引（管理员） |
| `initJobs` | ✅ 已完成 | 初始化种子数据（管理员） |

---

## 6. 数据模型概览

> 详细字段定义见 [database-schema.md](database-schema.md)

| 集合名 | 说明 | 主要字段 |
|--------|------|----------|
| `users` | 用户（校友/学生/教师） | `nickName`, `avatarUrl`, `userType`, `profile` |
| ~~`companies`~~ | ~~企业~~ | 集合未单独创建，公司名作为 jobs 的扁平字段存储 |
| `jobs` | 职位 | `title`, `salary`, `location`, `tags`, `publisherId`, `status` |
| `applications` | 职位申请 | `jobId`, `userId`, `status`, `resumeSnapshot`, `timeline` |
| `notifications` | 通知 | `userId`, `type`, `title`, `content`, `isRead` |
| `favorites` | 收藏 | `userId`, `jobId` |
| `userActions` | 行为日志 | `userId`, `jobId`, `actionType`, `weight` |

---

## 7. 两种背书机制

| 类型 | 时机 | 必要性 | 实现状态 |
|------|------|--------|----------|
| **职位背书** | 教师审核职位时 | 必须 | ✅ `auditJob` 云函数实现 |
| **申请背书** | 学生申请职位时 | 可选 | ⚠️ 前端支持但无 UI 入口 |

---

## 8. 代码审查检查清单

### 功能检查

- [x] 敏感字段是否根据申请状态有条件返回？→ `getJobDetail` 已实现
- [x] 申请时是否创建了完整的简历快照（深拷贝）？→ `applyJob` 已实现
- [x] 状态流转是否符合业务规则？→ `updateApplicationStatus` 有状态机校验
- [x] 职位发布时是否校验了角色？→ `postJob` 校验校友/教师身份
- [ ] 职位发布时是否上传了背书凭证？→ 未实现
- [ ] 教师统计页是否接入真实数据？→ 未实现

### 权限检查

- [x] 云函数是否通过 OPENID 校验用户身份？→ 所有云函数使用 `getWXContext().OPENID`
- [x] 敏感操作是否校验了用户角色（`userType`）？→ `auditJob` 校验教师，`postJob` 校验校友/教师
- [x] 前端是否未直接操作敏感数据？→ 仅 `notifications` 标记已读使用直接操作

### 数据一致性

- [x] 字段命名是否统一 camelCase？→ 已统一
- [x] 集合名是否使用实际名称（`users`/`applications`）？→ 已统一
- [x] 状态值是否使用字符串枚举？→ 已统一

---

**文档版本**：v3.0
**最后更新**：2026-04-13
**变更说明**：全面更新功能实现状态标注，修正云函数清单为 17 个，反映当前实际开发进度
