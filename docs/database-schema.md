# 数据库设计文档

> 本文档记录数据库集合的实际状态和目标设计。分为三部分：当前实际 schema、前端 mock 数据结构、目标统一 schema。

---

## 第一部分：当前实际 Schema（云函数）

以下是从 `cloudfunctions/` 代码中提取的真实集合和字段。

### 1. users 集合

**写入来源**：`login/index.js`、`initData/index.js`

```json
{
  "_id": "String (OPENID 或自动生成)",
  "nickName": "String (用户昵称)",
  "avatarUrl": "String (头像 URL)",
  "userType": "String ('hr' | 'alumni' | 'teacher' | 'student')",
  "companyId": "String (仅校友，关联 companies._id)",
  "createTime": "Date (db.serverDate())",
  "updateTime": "Date (db.serverDate())"
}
```

**已知的读取问题**：
- `getJobDetail/index.js` 读取 `publisher.type`，但实际字段名是 `userType`，会返回 `undefined`
- `getJobList/index.js` 通过聚合查询读取 `nickName` 和 `userType`，无问题

### 2. companies 集合

**写入来源**：`initData/index.js`

```json
{
  "_id": "String (自动生成)",
  "name": "String (公司名称)",
  "description": "String (公司描述)",
  "industry": "String (行业，如 '互联网')",
  "size": "String (规模，如 '100-500人')",
  "location": "String (地点，如 '北京市朝阳区')",
  "createTime": "Date (db.serverDate())"
}
```

**已知的读取问题**：
- `getJobDetail/index.js` 读取 `company.logo`，但 `initData` 从未写入该字段

### 3. jobs 集合

**写入来源**：`initData/index.js`
**读取来源**：`getJobList/index.js`、`getJobDetail/index.js`、`applyJob/index.js`

```json
{
  "_id": "String (自动生成)",
  "title": "String (职位标题)",
  "salary": "String (薪资范围，如 '15k-25k')",
  "location": "String (工作地点)",
  "tags": ["String (技能标签)"],
  "description": "String (职位描述)",
  "requirements": "String (任职要求)",
  "companyId": "String (关联 companies._id)",
  "publisherId": "String (关联 users._id)",
  "publishTime": "String (发布日期，注意是 String 非 Date)",
  "createTime": "Date (db.serverDate())",
  "applicationCount": "Number (申请人数，applyJob 时自增)"
}
```

**注意**：
- `publishTime` 在 `initData` 中是硬编码的字符串 `'2024-03-20'`，非 Date 类型
- `getJobList` 按 `createTime` 降序排序，不使用 `publishTime`
- 缺少 `status` 字段（职位状态管理未实现）
- 缺少背书相关字段（`endorsementProof`、`endorserInfo`）
- 缺少敏感字段（`referralCode`、`contactWechat`）

### 4. applications 集合

**写入来源**：`applyJob/index.js`

```json
{
  "_id": "String (自动生成)",
  "jobId": "String (关联 jobs._id)",
  "userId": "String (申请人 OPENID)",
  "status": "String ('pending')",
  "createTime": "Date (db.serverDate())",
  "updateTime": "Date (db.serverDate())"
}
```

**注意**：
- 状态值为字符串 `'pending'`，仅此一种（缺少 `accepted`、`rejected` 的状态流转）
- 缺少简历快照字段（`resumeSnapshot`）
- 缺少背书数据字段（`endorsementData`）
- 缺少时间线字段（`timeline`）

---

## 第二部分：前端 Mock 数据结构

以下是从各页面 JS 文件中提取的 mock 数据字段。

### job_list 页面 mock

```json
{
  "id": "String",
  "title": "String",
  "salary": "String",
  "company": "String (公司名，非关联 ID)",
  "location": "String",
  "date": "String (发布日期)",
  "tags": ["String"],
  "publisher": {
    "name": "String",
    "tag": "String (如 '校友')"
  },
  "reviewer": {
    "name": "String",
    "tag": "String (如 '老师')"
  },
  "likeCount": "Number"
}
```

### job_detail 页面 mock

```json
{
  "title": "String",
  "salary": "String",
  "location": "String",
  "date": "String",
  "tags": ["String"],
  "recommenderMessage": "String (推荐人寄语)",
  "link": "String (外链)",
  "publisher": {
    "avatar": "String",
    "name": "String",
    "tag": "String"
  },
  "reviewer": {
    "avatar": "String",
    "name": "String",
    "tag": "String"
  },
  "association": {
    "teacher": "String (关联教师描述)",
    "students": [
      { "name": "String", "info": "String", "comment": "String" }
    ]
  }
}
```

### application_progress 页面 mock

```json
{
  "id": "String",
  "jobTitle": "String",
  "company": "String",
  "location": "String",
  "status": "String ('pending' | 'processing' | 'completed')",
  "statusText": "String (中文状态文本)",
  "applyDate": "String",
  "timeline": [
    { "title": "String", "time": "String", "done": "Boolean", "status": "String" }
  ],
  "referralInfo": "String (仅 completed)",
  "referralCode": "String (仅 completed)",
  "referralContact": "String (仅 completed)"
}
```

### post_job 页面表单

```json
{
  "title": "String",
  "salary": "String",
  "company": "String",
  "location": "String",
  "recommenderComment": "String",
  "jobLink": "String",
  "tags": ["String (最多5个)"],
  "publisherName": "String",
  "publisherType": "String (默认 '校友')",
  "reviewerName": "String (默认 '待审核')"
}
```

### teacher_stats 页面 mock

结构复杂，包含以下模块（全部硬编码数据）：
- `overview`：总学生数、总申请数、待处理数、通过率
- `statusDistribution`：各状态分布
- `weekTrendData` / `monthTrendData` / `semesterTrendData`：时间趋势
- `hotJobsData`：热门岗位排行
- `topReferralPosters`：活跃校友排行
- `lowResponsivenessAlumni`：低响应校友
- `highSuccessRateStudents`：高成功率学生
- `recentApplications`：近期申请
- `jobStats`：各岗位统计
- `funnelStages`：转化漏斗

### user_profile 页面 mock

```json
{
  "userInfo": { "avatarUrl": "String", "nickName": "String", "isVerified": "Boolean", "role": "String" },
  "stats": { "postsCount": "Number", "appliesCount": "Number", "favoritesCount": "Number" }
}
```

---

## 第三部分：目标统一 Schema

以下是基于业务需求设计的目标数据库方案。实现时应按此结构统一云函数和前端。

### 1. users

```json
{
  "_id": "String",
  "_openid": "String (微信 OPENID)",
  "nickName": "String",
  "avatarUrl": "String",
  "userType": "String ('student' | 'alumni' | 'teacher' | 'admin')",
  "isVerified": "Boolean (是否已认证，默认 false)",
  "createTime": "Date",
  "updateTime": "Date",

  "profile": {
    "student": {
      "studentNumber": "String (学号)",
      "class": "String (班级)",
      "major": "String (专业)",
      "resume": {
        "skills": ["String"],
        "projects": [{ "name": "String", "description": "String", "startDate": "String", "endDate": "String" }],
        "experiences": [{ "company": "String", "position": "String", "startDate": "String", "endDate": "String", "description": "String" }]
      }
    },
    "alumni": {
      "gradYear": "Number (毕业年份)",
      "companyId": "String (关联 companies._id)",
      "jobTitle": "String",
      "proofImg": "String (认证图片 URL)"
    },
    "teacher": {
      "teacherNumber": "String (工号)",
      "dept": "String (院系)",
      "title": "String (职称)",
      "proofImg": "String (认证图片 URL)"
    }
  }
}
```

### 2. companies

```json
{
  "_id": "String",
  "name": "String (公司名)",
  "logo": "String (Logo URL)",
  "description": "String (公司简介)",
  "industry": "String (行业)",
  "size": "String (规模)",
  "location": "String (总部地址)",
  "isVerified": "Boolean (是否管理员审核通过)",
  "createTime": "Date",
  "updateTime": "Date"
}
```

### 3. jobs

```json
{
  "_id": "String",
  "title": "String",
  "salary": "String",
  "location": "String",
  "tags": ["String"],
  "description": "String (职位描述)",
  "requirements": "String (任职要求)",
  "status": "String ('pending' | 'published' | 'closed' | 'rejected')",
  "publisherId": "String (关联 users._id)",
  "companyId": "String (关联 companies._id)",
  "companySnapshot": {
    "name": "String",
    "logo": "String",
    "industry": "String"
  },
  "endorsementProof": "String (背书凭证图片 URL)",
  "endorserInfo": {
    "teacherId": "String",
    "teacherName": "String",
    "teacherAvatar": "String",
    "dept": "String",
    "auditedAt": "Date"
  },
  "recommenderMsg": "String (内推人寄语)",
  "referralCode": "String (敏感，申请通过后可见)",
  "contactWechat": "String (敏感，申请通过后可见)",
  "applicationCount": "Number (申请人数)",
  "publishTime": "Date",
  "createTime": "Date",
  "updateTime": "Date"
}
```

**状态说明**：
- `pending`：待审核（校友发布后初始状态）
- `published`：招聘中（教师审核通过）
- `closed`：已关闭（校友关闭或招满）
- `rejected`：被驳回（教师审核未通过）

### 4. applications

```json
{
  "_id": "String",
  "jobId": "String (关联 jobs._id)",
  "userId": "String (申请人 OPENID)",
  "publisherId": "String (冗余，便于查询)",
  "status": "String ('pending' | 'processing' | 'accepted' | 'rejected')",
  "replyMsg": "String (校友反馈)",
  "resumeSnapshot": "Object (申请时的简历完整深拷贝)",
  "endorsementData": {
    "endorserUid": "String (推荐教师 ID)",
    "teacherName": "String",
    "teacherDept": "String",
    "proofImg": "String (推荐信图片 URL)"
  },
  "timeline": [
    { "status": "String", "time": "Date", "desc": "String" }
  ],
  "createTime": "Date",
  "updateTime": "Date"
}
```

**状态说明**：
- `pending`：待处理
- `processing`：处理中（校友已查看）
- `accepted`：已通过（解锁内推码）
- `rejected`：不合适

### 5. behavior_logs（待实现）

```json
{
  "_id": "String",
  "userId": "String",
  "jobId": "String",
  "actionType": "String ('view' | 'apply' | 'share')",
  "stayDuration": "Number (秒，仅 view)",
  "weight": "Number (view=1, apply=5, share=3)",
  "createTime": "Date"
}
```

---

## 第四部分：差异对照表

### 云函数 vs 前端 Mock 关键差异

| 概念 | 云函数（数据库） | 前端 Mock | 目标统一方案 |
|------|-----------------|-----------|-------------|
| 职位 ID | `_id` | `id` | `_id` |
| 公司名称 | 关联查询 `company.name` | 扁平字段 `company` | `companySnapshot.name` |
| 发布日期 | `publishTime` (String) | `date` | `publishTime` (Date) |
| 发布人 | `publisherId` 关联查询 | `{ name, tag }` 对象 | `companySnapshot` 式冗余 |
| 职位状态 | 无此字段 | 无 | `status` (String) |
| 申请状态 | `'pending'` | `'pending'/'processing'/'completed'` | `'pending'/'processing'/'accepted'/'rejected'` |
| 申请学生 | `userId` | 无对应 | `userId` |
| 薪资 | `salary` | `salary` | `salary` (已一致) |

### 旧文档 vs 实际代码差异

| 旧文档 (database-schema.md) | 实际代码 |
|-----------------------------|---------|
| 集合 `sys_users` | 集合 `users` |
| 集合 `job_applications` | 集合 `applications` |
| 字段 `base_info.name` | 字段 `nickName` |
| 字段 `base_info.avatar` | 字段 `avatarUrl` |
| 字段 `role` | 字段 `userType` |
| 字段 `salary_range` | 字段 `salary` |
| 字段 `publisher_id` | 字段 `publisherId` |
| 字段 `company_id` | 字段 `companyId` |
| 状态 Number 0/1/2/3 | 状态 String `'pending'`/... |

---

## 第五部分：索引建议

### users 集合

```
{ "_openid": 1 }          -- 按 OPENID 查询用户（登录）
{ "userType": 1 }         -- 按角色筛选用户
```

### jobs 集合

```
{ "status": 1, "createTime": -1 }   -- 按状态筛选并按时间倒序
{ "publisherId": 1 }                 -- 按发布人查询
{ "companyId": 1 }                   -- 按公司查询
{ "title": "text" }                  -- 全文搜索（或使用 db.RegExp）
```

### applications 集合

```
{ "jobId": 1, "userId": 1 }          -- 防重复投递查询
{ "userId": 1, "status": 1 }         -- 查询用户的申请列表
{ "publisherId": 1, "status": 1 }    -- 校友查询收到的申请
```

### behavior_logs 集合（待创建）

```
{ "userId": 1, "jobId": 1 }          -- 查询用户对某职位的行为
{ "jobId": 1, "actionType": 1 }      -- 按职位和行为类型统计
{ "createTime": -1 }                 -- 按时间排序
```

---

**文档版本**：v2.0
**最后更新**：2026-04-10
**变更说明**：基于实际代码分析重写，增加差异对照表和索引建议
