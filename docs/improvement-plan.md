# 酱菜内推系统 -- 完整改进实施方案

> 基于对全部源代码（6 个页面 + 11 个云函数）的逐行分析生成。本文档可直接作为开发任务清单执行。

---

## 一、项目现状总览

### 实际代码规模

| 模块 | 数量 | 说明 |
|------|------|------|
| 前端页面 | 6 个 | 3 个 TabBar + 3 个子页面 |
| 云函数 | 11 个 | login 已删除，实际 10 个有代码 |
| 数据库集合 | 4 个 | users, jobs, applications, userActions |
| UI 组件 | 13 个 | TDesign 全局注册 |

### 项目成熟度评估

| 维度 | 完成度 | 说明 |
|------|--------|------|
| 页面 UI | 85% | 页面框架完整，但部分交互为假实现 |
| 云函数 | 30% | 10 个函数存在，但 4 个无鉴权、6 个缺少业务逻辑 |
| 数据接入 | 10% | 仅 job_list 和 application_progress 调用了云函数 |
| 登录系统 | 5% | 模拟 ActionSheet 选角色，无真实鉴权 |
| 背书审核 | 0% | 无审核页面、无审核云函数 |
| 敏感字段保护 | 0% | 内推码和联系方式未做条件过滤 |
| 简历快照 | 0% | 申请时未创建简历深拷贝 |
| 通知系统 | 0% | 不存在 |
| 用户认证 | 0% | 无实名认证流程 |

---

## 二、需修复的 Bug 清单（按严重程度排序）

### 致命级（导致功能完全不可用）

| ID | 文件 | 行号 | 问题 | 修复方案 |
|----|------|------|------|----------|
| B01 | `job_list.js` | 213 | 导航路径错误：`/pages/job/job_detail` → 应为 `/pages/job_detail/job_detail` | 修改路径并确保传递 `id` 参数 |
| B02 | `job_list.js` | 218 | `onJobDetailTap()` 未传递职位 `id` 参数 | 添加 `?id=${e.currentTarget.dataset.id}` |
| B03 | `application_progress.js` | 136 | 导航路径错误：`/pages/job/job` → 应为 `/pages/job_list/job_list` | 修改为 `wx.switchTab({ url: '/pages/job_list/job_list' })` |
| B04 | `job_detail.js` | 344 | 分享路径错误：`/pages/job/job_detail` → 应为 `/pages/job_detail/job_detail` | 修改 `onShareAppMessage` 中的 path |
| B05 | `job_detail.js` | 260 | `isLoggedIn()` 方法名与 `data.isLoggedIn` 属性名冲突，导致 `this.isLoggedIn` 返回函数而非布尔值 | 重命名方法为 `checkLoginState()` |
| B06 | `application_progress.js` | 41 | 调用不存在的 `this.refreshProgressList` 方法 | 替换为 `this.loadApplications()` |
| B07 | `getApplications` | - | 不分页，微信云数据库 `.get()` 默认最多返回 20 条记录，超过会静默截断 | 使用 `.skip().limit()` 实现分页 |
| B08 | `updateApplicationStatus` | - | 不验证 OPENID，任何人可修改任意申请的状态 | 添加 OPENID 验证 + 发布者身份校验 |
| B09 | `initJobs` | - | 无权限控制，任何用户可调用并清空所有职位数据 | 添加管理员角色校验或移除该函数 |
| B10 | `getJobList` | - | 不验证用户身份，不按角色过滤职位状态 | 添加 OPENID 验证，按角色过滤 |

### 严重级（功能异常或数据丢失）

| ID | 文件 | 问题 | 修复方案 |
|----|------|------|----------|
| B11 | `job_detail.js` | `getJobDetail()` 忽略 id 参数，始终显示硬编码 mock 数据 | 接入云函数获取真实数据 |
| B12 | `job_detail.js` | `applyJob()` 用 setTimeout 模拟提交，无真实 API 调用 | 调用 `applyJob` 云函数 |
| B13 | `post_job.js` | `onSubmit()` 用 setTimeout 模拟提交，数据不持久化 | 调用 `postJob` 云函数 |
| B14 | `job_detail.js` | `saveAllInfo()` 不真正保存截图，只弹 toast | 使用 canvas 绘制 + `wx.saveImageToPhotosAlbum` |
| B15 | `job_detail.js` | `toggleFavorite()` 不持久化收藏状态 | 接入收藏功能（云函数或本地存储） |
| B16 | `user_profile.js` | `onLogoutTap()` 使用 `wx.clearStorageSync()` 清除所有数据（包括 app.js 的 logs） | 改为 `wx.removeStorageSync()` 逐个删除 |
| B17 | `application_progress.js` | `simulateLogin()` 不写入 `userInfo`（其他页面的 simulateLogin 都写入） | 补充 `userInfo` 写入 |
| B18 | `job_list.js` | `onSearchSubmit()` 只弹 toast，不执行搜索 | 调用 `getJobList` 云函数并传递 keyword 参数 |
| B19 | `job_list.js` | `loadMoreJobs()` 用 setTimeout 模拟分页，立即设置 `noMoreData=true` | 调用云函数获取下一页数据 |
| B20 | `teacher_stats.js` | `getWeekTrendData()` 和 `getMonthTrendData()` 使用 `Math.random()` 生成数据 | 接入真实聚合查询 |

### 一般级（体验问题）

| ID | 文件 | 问题 |
|----|------|------|
| B21 | `user_profile.js` | 导航到不存在的页面：`/pages/verify/index`、`/pages/help/index`、`/pages/about/index` |
| B22 | `teacher_stats.js` | 导航到不存在的页面：`/pages/all_applications/index`、`/pages/application_detail/index`、`/pages/handle_application/index` |
| B23 | `user_profile.js` | `onEditAvatarTap()` 只保存本地临时路径，不上传云存储，重启后路径失效 |
| B24 | `teacher_stats.js` | `applyFilters()` 只弹 toast 不真正筛选数据 |
| B25 | `job_detail.js` | 学生身份过滤基于硬编码的 `screenshotUser.name`（'贾明'），非真实用户 |
| B26 | `job_detail.js` | QR 码使用硬编码的 WeChat 文档 URL，非真实职位二维码 |
| B27 | `user_profile.js` | `onLoginDialogConfirm()` 和 `onUserInfoTap()` 包含重复的登录代码 |
| B28 | `post_job.js` | `onLocationChange()` 是死代码，WXML 使用 picker 而非文本输入 |

---

## 三、数据库改进方案

### 3.1 集合重命名

| 当前名称 | 目标名称 | 说明 |
|----------|----------|------|
| `userActions` | `behavior_logs` | 与目标 schema 统一 |

> `users`、`jobs`、`applications` 保持不变。`companies` 集合需要创建（当前代码中 `initJobs` 不创建公司记录）。

### 3.2 目标集合完整定义

#### users

```json
{
  "_id": "String",
  "_openid": "String (OPENID)",
  "nickName": "String",
  "avatarUrl": "String",
  "userType": "String ('student' | 'alumni' | 'teacher' | 'admin')",
  "isVerified": "Boolean (默认 false)",
  "createTime": "Date",
  "updateTime": "Date",
  "profile": {
    "student": {
      "studentNumber": "String",
      "class": "String",
      "major": "String",
      "resume": {
        "skills": ["String"],
        "projects": [{ "name": "String", "description": "String", "startDate": "String", "endDate": "String" }],
        "experiences": [{ "company": "String", "position": "String", "startDate": "String", "endDate": "String", "description": "String" }]
      }
    },
    "alumni": {
      "gradYear": "Number",
      "companyId": "String",
      "jobTitle": "String",
      "proofImg": "String"
    },
    "teacher": {
      "teacherNumber": "String",
      "dept": "String",
      "title": "String",
      "proofImg": "String"
    }
  }
}
```

#### companies（需新建）

```json
{
  "_id": "String",
  "name": "String",
  "logo": "String",
  "description": "String",
  "industry": "String",
  "size": "String",
  "location": "String",
  "isVerified": "Boolean",
  "createTime": "Date",
  "updateTime": "Date"
}
```

#### jobs

```json
{
  "_id": "String",
  "title": "String",
  "salary": "String",
  "location": "String",
  "tags": ["String"],
  "description": "String",
  "requirements": "String",
  "status": "String ('pending' | 'published' | 'closed' | 'rejected')",
  "publisherId": "String (OPENID)",
  "publisherSnapshot": { "nickName": "String", "avatarUrl": "String", "userType": "String" },
  "companyId": "String",
  "companySnapshot": { "name": "String", "logo": "String", "industry": "String" },
  "endorsementProof": "String (图片 URL)",
  "endorserInfo": {
    "teacherId": "String",
    "teacherName": "String",
    "teacherAvatar": "String",
    "dept": "String",
    "auditedAt": "Date"
  },
  "recommenderMsg": "String",
  "referralCode": "String (敏感)",
  "contactWechat": "String (敏感)",
  "applicationCount": "Number",
  "rejectReason": "String",
  "publishTime": "Date",
  "createTime": "Date",
  "updateTime": "Date"
}
```

#### applications

```json
{
  "_id": "String",
  "jobId": "String",
  "userId": "String (OPENID)",
  "publisherId": "String (冗余)",
  "status": "String ('pending' | 'processing' | 'accepted' | 'rejected')",
  "replyMsg": "String",
  "resumeSnapshot": "Object (深拷贝)",
  "jobSnapshot": { "title": "String", "company": "String", "salary": "String" },
  "endorsementData": {
    "endorserUid": "String",
    "teacherName": "String",
    "teacherDept": "String",
    "proofImg": "String"
  },
  "timeline": [{ "status": "String", "time": "Date", "desc": "String" }],
  "createTime": "Date",
  "updateTime": "Date"
}
```

#### behavior_logs（重命名自 userActions）

```json
{
  "_id": "String",
  "userId": "String (OPENID)",
  "jobId": "String",
  "actionType": "String ('view' | 'apply' | 'share' | 'expandAssociation' | 'saveAllInfo')",
  "stayDuration": "Number (秒，仅 view)",
  "weight": "Number (view=1, apply=5, share=3)",
  "createTime": "Date"
}
```

#### notifications（需新建）

```json
{
  "_id": "String",
  "userId": "String (接收者 OPENID)",
  "type": "String ('job_audit' | 'application_status' | 'new_application' | 'system')",
  "title": "String",
  "content": "String",
  "isRead": "Boolean (默认 false)",
  "relatedId": "String (关联的 jobId 或 applicationId)",
  "createTime": "Date"
}
```

#### favorites（需新建）

```json
{
  "_id": "String",
  "userId": "String (OPENID)",
  "jobId": "String",
  "createTime": "Date"
}
```

### 3.3 必建索引

| 集合 | 索引字段 | 类型 | 用途 |
|------|----------|------|------|
| `users` | `{ _openid: 1 }` | 唯一 | 登录查询 |
| `jobs` | `{ status: 1, createTime: -1 }` | 复合 | 按状态筛选+排序 |
| `jobs` | `{ publisherId: 1 }` | 普通 | 校友查自己的职位 |
| `applications` | `{ jobId: 1, userId: 1 }` | 唯一复合 | 防重复投递 |
| `applications` | `{ userId: 1, status: 1 }` | 复合 | 学生查申请列表 |
| `applications` | `{ publisherId: 1, status: 1 }` | 复合 | 校友查看收到的申请 |
| `behavior_logs` | `{ userId: 1, jobId: 1 }` | 复合 | 行为查询 |
| `notifications` | `{ userId: 1, isRead: 1 }` | 复合 | 未读通知查询 |
| `favorites` | `{ userId: 1, jobId: 1 }` | 唯一复合 | 防重复收藏 |

---

## 四、云函数接口规范（11 个函数完整定义）

### 4.1 统一响应格式

```javascript
// 成功
{ code: 200, data: { ... }, message: "操作成功" }

// 错误码体系
// 400 - 请求参数错误
// 401 - 未登录
// 403 - 无权限（角色不匹配）
// 404 - 资源不存在
// 409 - 状态冲突（如重复申请、非法状态流转）
// 422 - 业务校验失败（如简历未填写）
// 500 - 服务器错误
```

### 4.2 每个云函数的完整规范

#### login（需新建）

- **触发时机**：`app.js` 的 `onLaunch` 或首次打开任意需要登录的页面
- **输入**：无（使用 `cloud.getWXContext().OPENID`）
- **逻辑**：按 OPENID 查询 `users`，不存在则创建默认记录（`userType` 为空，`isVerified: false`），存在则返回完整信息
- **输出**：`{ code: 200, data: { userId, nickName, avatarUrl, userType, isVerified, profile } }`
- **关键**：这是整个系统真实鉴权的起点

#### setUserRole（需新建）

- **输入**：`{ userType: 'student' | 'alumni' | 'teacher' }`
- **逻辑**：验证 OPENID，更新 `users.userType`。一个用户只能设置一次角色，设置后不可更改
- **输出**：`{ code: 200, data: { userType } }`

#### getJobList（需重构）

- **输入**：`{ pageNum: Number, pageSize: Number, keyword?: String, city?: String, jobType?: String, sortBy?: 'newest' | 'recommend' }`
- **新增逻辑**：
  - 验证 OPENID
  - 学生只看 `status: 'published'`
  - 校友看自己的职位（含所有状态）+ 已发布职位
  - 教师看 `pending`（需审核）+ `published`
  - keyword 搜索 title 和 tags
  - 返回 `{ list, total, hasMore }` 含分页元数据
  - 返回数据包含 `companySnapshot`（冗余，避免前端二次查询）

#### getJobDetail（需重构）

- **输入**：`{ id: String }`
- **新增逻辑**：
  - 验证 OPENID
  - 查询申请状态：按 `(jobId, userId)` 查 `applications`
  - 若申请状态为 `accepted`，返回含 `referralCode` + `contactWechat` 的完整数据
  - 否则删除敏感字段后返回
  - 返回数据包含 `publisherSnapshot` 和 `companySnapshot`
  - 返回 `userApplicationStatus` 字段（`null` / `'pending'` / `'processing'` / `'accepted'` / `'rejected'`）

#### applyJob（需增强）

- **输入**：`{ jobId: String, endorsementData?: Object }`
- **新增逻辑**：
  - 验证 OPENID + `userType === 'student'`
  - 验证职位 `status === 'published'`
  - 防重复检查（已有）
  - **新增**：查询学生 `users.profile.student.resume`，深拷贝为 `resumeSnapshot`
  - **新增**：查询职位 title/company/salary，存为 `jobSnapshot`
  - **新增**：初始化 `timeline: [{ status: 'pending', time: now, desc: '提交申请' }]`
  - **新增**：自增 `jobs.applicationCount`

#### postJob（需重构）

- **输入**：`{ title, salary, company, location, tags, recommenderComment, jobLink, publisherName, description?, requirements?, referralCode?, contactWechat? }`
- **新增逻辑**：
  - 验证 OPENID + `userType === 'alumni'` + `isVerified === true`
  - 设置 `status: 'pending'`
  - 创建 `publisherSnapshot`（从 `users` 读取当前信息）
  - 创建 `companySnapshot`（按名称查 `companies`，不存在则新建）
  - 所有字段做长度/格式校验

#### getApplications（需重构）

- **输入**：`{ status?: String, pageNum?: Number, pageSize?: Number }`
- **新增逻辑**：
  - 验证 OPENID
  - **学生**：按 `userId` 查询
  - **校友**：按 `publisherId` 查询（收到的申请）
  - **教师**：查所有申请（可按班级筛选）
  - 使用 `.skip().limit()` 分页
  - 返回 `{ list, total, hasMore }`
  - 关联查询 `jobs` 填充职位标题和公司名

#### updateApplicationStatus（需重构）

- **输入**：`{ applicationId: String, status: 'processing' | 'accepted' | 'rejected', remark?: String }`
- **新增逻辑**：
  - 验证 OPENID
  - 查询申请记录对应的 `jobs.publisherId`，确认调用者是职位发布者
  - 校验状态流转：`pending → processing → accepted/rejected`（禁止反向）
  - 追加 `timeline` 记录
  - 若变为 `accepted`，创建通知给学生
  - 更新 `updateTime`

#### auditJob（需新建）

- **输入**：`{ jobId: String, action: 'approve' | 'reject', rejectReason?: String }`
- **逻辑**：
  - 验证 OPENID + `userType === 'teacher'` + `isVerified === true`
  - 验证职位 `status === 'pending'`
  - approve：设置 `status: 'published'`，填充 `endorserInfo`（教师信息 + 审核时间），创建通知给校友
  - reject：设置 `status: 'rejected'`，存储 `rejectReason`，创建通知给校友

#### recordUserAction（需重命名为 logBehavior）

- **输入**：`{ jobId: String, actionType: String, stayDuration?: Number }`
- **新增逻辑**：
  - 写入 `behavior_logs` 集合（非 `userActions`）
  - 自动计算 `weight`（view=1, apply=5, share=3）
  - 校验 `actionType` 为合法枚举值

#### getUserProfile（需增强）

- **输入**：无（使用 OPENID）
- **新增逻辑**：
  - 按 OPENID 查询 `users` 完整记录
  - 统计 `jobs` 中 `publisherId === OPENID` 的数量 → `publishedCount`
  - 统计 `applications` 中 `userId === OPENID` 的数量 → `appliedCount`
  - 统计 `favorites` 中 `userId === OPENID` 的数量 → `favoriteCount`
  - 返回 `{ userInfo, stats: { publishedCount, appliedCount, favoriteCount } }`

### 4.3 需新建的云函数

| 函数名 | 功能 | 优先级 |
|--------|------|--------|
| `login` | OPENID 鉴权 + 自动注册 | P0 |
| `setUserRole` | 首次选择角色（不可更改） | P0 |
| `auditJob` | 教师审核职位背书 | P1 |
| `updateProfile` | 用户编辑个人资料 | P1 |
| `getJobAssociation`（需重构） | 获取关联信息（含角色过滤） | P2 |
| `toggleFavorite` | 收藏/取消收藏 | P2 |
| `getNotifications` | 获取通知列表 | P2 |

---

## 五、前端改造方案

### 5.1 需新建的页面

| 页面路径 | 功能 | 优先级 |
|----------|------|--------|
| `pages/audit_job/audit_job` | 教师审核待审职位列表（TabBar 外） | P1 |
| `pages/manage_applications/manage_applications` | 校友查看收到的申请并处理 | P1 |
| `pages/edit_profile/edit_profile` | 学生编辑简历 / 校友编辑资料 / 教师编辑资料 | P1 |
| `pages/verify/verify` | 用户身份认证（上传证明材料） | P2 |
| `pages/notifications/notifications` | 通知列表 | P2 |
| `pages/about/about` | 关于页面（简单静态页） | P3 |
| `pages/help/help` | 帮助页面（简单静态页） | P3 |

### 5.2 现有页面改造清单

#### job_list.js

| 改造项 | 说明 |
|--------|------|
| 修复导航路径 | `onJobItemTap` → `/pages/job_detail/job_detail?id=${id}` |
| 修复 id 传递 | `onJobDetailTap` 添加 `?id=` 参数 |
| 实现搜索 | `onSearchSubmit` 调用 `getJobList` 传 keyword |
| 实现分页 | `loadMoreJobs` 调用云函数获取下一页 |
| 替换模拟登录 | `simulateLogin` → 调用 `login` 云函数 + `setUserRole` |
| 接入云函数返回 | `getJobList` 返回数据映射到页面数据结构 |

#### job_detail.js

| 改造项 | 说明 |
|--------|------|
| 接入真实数据 | `getJobDetail` 调用云函数，替换硬编码 mock |
| 实现申请功能 | `applyJob` 调用云函数，创建真实申请 |
| 修复方法名冲突 | `isLoggedIn()` 重命名为 `checkLoginState()` |
| 修复分享路径 | `onShareAppMessage` 中 path 改为正确路径 |
| 实现收藏 | `toggleFavorite` 调用云函数或操作 favorites 集合 |
| 实现截图保存 | 使用 canvas + `wx.saveImageToPhotosAlbum` |
| 替换模拟登录 | 同 job_list |

#### application_progress.js

| 改造项 | 说明 |
|--------|------|
| 修复导航路径 | `onBrowseJobsTap` → `/pages/job_list/job_list` |
| 修复未定义方法 | `refreshProgressList` → `this.loadApplications()` |
| 补充 userInfo 写入 | `simulateLogin` 中补充 `userInfo` 存储 |
| 接入分页 | `loadApplications` 使用 skip/limit 分页 |
| 实现申请详情导航 | `onApplicationTap` 导航到申请详情页 |
| 替换模拟登录 | 同上 |

#### user_profile.js

| 改造项 | 说明 |
|--------|------|
| 修复登出逻辑 | `clearStorageSync` → 逐个 `removeStorageSync` |
| 头像上传云存储 | `onEditAvatarTap` 使用 `wx.cloud.uploadFile` |
| 实现我的发布 | `onNavigateToMyPosts` 导航到管理页面 |
| 实现我的申请 | `onNavigateToMyApplies` 导航到申请列表 |
| 实现收藏列表 | `onNavigateToMyFavorites` 导航到收藏页 |
| 消除重复代码 | 合并两处 simulateLogin 为统一方法 |
| 替换模拟登录 | 同上 |

#### post_job.js

| 改造项 | 说明 |
|--------|------|
| 接入云函数 | `onSubmit` 调用 `postJob` 云函数 |
| 添加登录校验 | `onLoad` 检查登录状态和角色 |
| 自动填充发布人 | 从 `userInfo` 预填 `publisherName` |
| 删除死代码 | 移除 `onLocationChange` |
| 添加图片上传 | 背书凭证上传组件 |

#### teacher_stats.js

| 改造项 | 说明 |
|--------|------|
| 接入真实数据 | 所有统计模块从云数据库聚合查询 |
| 添加角色校验 | `onLoad` 检查 `userType === 'teacher'` |
| 实现筛选 | `applyFilters` 重新查询带筛选条件的数据 |
| 修复不存在的导航 | 跳转到管理申请页面 |
| 使用 ECharts | 替代 CSS 进度条，使用已有的 echarts-for-weixin |
| 消除数据冗余 | 去掉重复的 mock 数据变量 |

### 5.3 公共模块抽取

#### 登录模块（`utils/auth.js`）

```javascript
// 统一登录逻辑，替换 4 处重复的 simulateLogin
function login() { ... }          // 调用 login 云函数
function setUserRole(type) { ... } // 调用 setUserRole 云函数
function isLoggedIn() { ... }      // 读取 wx.Storage
function getUserType() { ... }     // 读取 wx.Storage
function logout() { ... }          // 清除指定 Storage 键
```

#### 数据服务层（`services/`）

```
miniprogram/services/
├── jobService.js      # getJobList, getJobDetail, postJob
├── applicationService.js  # applyJob, getApplications, updateApplicationStatus
├── userService.js     # login, getUserProfile, updateProfile
└── statsService.js    # 教师统计查询（聚合）
```

#### Mock 数据层（`mock/`）

```
miniprogram/mock/
├── jobs.js            # 职位 mock 数据
├── applications.js    # 申请 mock 数据
├── users.js           # 用户 mock 数据
└── stats.js           # 统计 mock 数据
```

---

## 六、实施路线图

### 阶段一：修复致命 Bug（预计改动 15+ 文件）

**目标**：让现有页面至少能正确导航和显示数据结构。

1. 修复所有导航路径错误（B01-B04）
2. 修复方法名冲突和未定义方法（B05-B06）
3. 为云函数添加 OPENID 验证（B07-B10）
4. 统一 `getApplications` 和 `getUserProfile` 的分页逻辑

### 阶段二：真实登录 + 数据接入

**目标**：替换模拟登录，前端接入真实云函数。

1. 新建 `login` 和 `setUserRole` 云函数
2. 抽取 `utils/auth.js` 公共登录模块
3. 所有页面替换 `simulateLogin` 为真实登录
4. `job_list.js` 接入 `getJobList`（搜索、分页、按角色过滤）
5. `job_detail.js` 接入 `getJobDetail`（真实数据、敏感字段过滤）
6. `application_progress.js` 接入 `getApplications`（分页、按角色查询）
7. `user_profile.js` 接入 `getUserProfile`
8. `post_job.js` 接入 `postJob`

### 阶段三：核心业务流程

**目标**：实现完整的职位发布 → 审核 → 申请 → 处理闭环。

1. 重构 `postJob`（添加角色校验、字段校验、背书凭证上传、status 初始为 pending）
2. 新建 `auditJob` 云函数 + 教师审核页面 `pages/audit_job/audit_job`
3. 重构 `applyJob`（添加简历快照、jobSnapshot、timeline）
4. 重构 `updateApplicationStatus`（添加权限校验、状态流转校验、timeline 追加）
5. 新建校友申请管理页面 `pages/manage_applications/manage_applications`
6. 新建 `getNotifications` + 通知页面

### 阶段四：完善功能

**目标**：补齐所有"功能开发中"的功能。

1. 用户资料编辑页面 `pages/edit_profile/edit_profile` + `updateProfile` 云函数
2. 身份认证页面 `pages/verify/verify` + 证明材料上传
3. 收藏功能（`toggleFavorite` 云函数 + `favorites` 集合）
4. 教师统计页接入真实聚合查询 + ECharts 图表
5. `behavior_logs` 集合重命名 + 完善埋点（添加 stayDuration 和 weight）
6. 关于页面、帮助页面

### 阶段五：优化与上线

1. 创建所有数据库索引
2. 配置 Security Rules
3. 清理模板残留（`quickstartFunctions/`）
4. 删除 `app.ts`（与 `app.js` 重复）
5. 重命名 `package.json` 的 `name` 字段
6. 抽取 mock 数据到独立目录，添加编译条件切换
7. 配置微信订阅消息模板
8. 端到端测试

---

## 七、PRD 需更新的内容

| 章节 | 需更新的内容 |
|------|-------------|
| 技术栈 | app.js 已有 `wx.cloud.init()`，确认云环境 ID |
| 云函数清单 | 从 9 个更新为 14 个（补充 login, setUserRole, getJobAssociation, getUserProfile, toggleFavorite, getNotifications） |
| 接口定义 | 每个云函数补充完整的输入/输出/错误码/权限要求（参照本文档第四节） |
| 数据模型 | 集合从 4 个扩展到 7 个（+companies, notifications, favorites）；字段补充 status, endorserInfo 等 |
| 页面清单 | 从 6 个扩展到 13 个（+audit_job, manage_applications, edit_profile, verify, notifications, about, help） |
| 业务规则 | 补充：角色选择不可更改规则、申请状态流转规则、职位状态流转规则、通知触发规则 |
| 状态枚举 | 统一为字符串：jobs 的 `pending/published/closed/rejected`，applications 的 `pending/processing/accepted/rejected` |
| 权限矩阵 | 补充每个角色对每个云函数的调用权限表 |

---

**文档版本**：v1.0
**创建日期**：2026-04-11
**分析范围**：main 分支全部源代码（6 页面 + 11 云函数 + 3 文档）
