# 云函数开发规范

## 架构原则

1. **前端优先原则**：能用前端 `wx.cloud.database()` + Security Rules 完成的操作，不写云函数
2. **云函数仅用于**：跨集合事务、敏感字段过滤、权限校验、复杂聚合查询
3. **每个云函数独立部署**：`cloudfunctions/` 下每个目录是一个独立云函数，有自己的 `package.json`
4. **统一依赖**：所有云函数依赖 `wx-server-sdk: ~2.6.3`，不引入其他数据库驱动

## 已有云函数清单（18 个）

### 核心业务

| 函数名 | 功能 | 输入参数 | 权限校验 |
|--------|------|----------|----------|
| `login` | OPENID 鉴权 + 自动注册 | 无（使用 OPENID） | OPENID |
| `setUserRole` | 首次选择角色（不可更改） | `{ userType }` | OPENID |
| `getJobList` | 分页职位列表 | `{ pageNum, pageSize, keyword, city, jobType, sortBy, status }` | 无 |
| `getJobDetail` | 职位详情（敏感字段过滤） | `{ id }` | OPENID |
| `postJob` | 发布职位 | `{ title, salary, company, location, tags, ... }` | 校友/教师 |
| `applyJob` | 申请职位（简历快照） | `{ jobId, endorsementData? }` | OPENID |
| `getApplications` | 申请列表（分页） | `{ status, pageNum, pageSize, asPublisher }` | OPENID |
| `updateApplicationStatus` | 更新申请状态 | `{ applicationId, status, remark? }` | 发布者 |
| `auditJob` | 教师审核职位 | `{ jobId, action, rejectReason? }` | 教师 |
| `getNotifications` | 获取通知 | `{ pageNum, pageSize }` | OPENID |
| `toggleFavorite` | 收藏/取消收藏 | `{ jobId, checkOnly? }` | OPENID |
| `getUserProfile` | 用户资料+统计 | 无（使用 OPENID） | OPENID |
| `updateProfile` | 更新用户资料 | `{ nickName?, avatarUrl?, profile? }` | OPENID |
| `recordUserAction` | 行为埋点 | `{ jobId, actionType, stayDuration? }` | OPENID |
| `getJobAssociation` | 职位关联信息 | `{ jobId }` | OPENID |
| `getTeacherStats` | 教师统计页数据聚合 | `{ timeRange }` | 教师/管理员 |

### 管理员工具

| 函数名 | 功能 | 输入参数 | 权限校验 |
|--------|------|----------|----------|
| `initJobs` | 初始化种子数据（清空+重置） | 无 | admin |
| `createIndexes` | 创建数据库索引 | 无 | admin |

## 云函数模板

```javascript
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()

  try {
    // 业务逻辑
    return { code: 200, data: {}, message: '操作成功' }
  } catch (err) {
    console.error(err)
    return { code: 500, message: err.message }
  }
}
```

## 统一响应格式

```javascript
// 成功
{ code: 200, data: { ... }, message: '操作成功' }

// 错误码体系
// 400 - 请求参数错误
// 401 - 未登录
// 403 - 无权限（角色不匹配）
// 404 - 资源不存在
// 409 - 状态冲突（如重复申请、非法状态流转）
// 500 - 服务器错误
```

## 命名规范

- 获取数据：`get` + 实体名（如 `getJobList`、`getJobDetail`）
- 创建/操作：动词 + 实体名（如 `applyJob`、`auditJob`）
- 更新状态：`update` + 实体名 + 属性（如 `updateApplicationStatus`）

## 安全规范

- 所有云函数通过 `cloud.getWXContext().OPENID` 获取用户身份
- 敏感操作需校验 `userType`（如 `auditJob` 校验教师身份）
- 使用白名单字段，不直接透传 `event` 到数据库写入
- 分页查询限制 `pageSize` 最大值为 20

## 状态机

### jobs 状态流转

```
pending（待审核）→ published（招聘中）→ closed（已关闭）
                 → rejected（被驳回）
```

### applications 状态流转

```
pending（待处理）→ processing（处理中）→ accepted（已通过）
                                     → rejected（不合适）
```

> 注意：状态流转为单向，禁止回退。`updateApplicationStatus` 云函数中有状态机校验。
