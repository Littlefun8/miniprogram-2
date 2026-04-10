# 云函数开发规范

## 架构原则

1. **前端优先原则**：能用前端 `wx.cloud.database()` + Security Rules 完成的操作，不写云函数
2. **云函数仅用于**：跨集合事务、敏感字段过滤、权限校验、复杂聚合查询
3. **每个云函数独立部署**：`cloudfunctions/` 下每个目录是一个独立云函数，有自己的 `package.json`

## 已有云函数清单

| 函数名 | 路径 | 功能 | 输入 |
|--------|------|------|------|
| `login` | `cloudfunctions/login/` | 用户登录/注册 | `{ userInfo, userType }` |
| `getJobList` | `cloudfunctions/getJobList/` | 分页职位列表 | `{ pageNum, pageSize, keyword }` |
| `getJobDetail` | `cloudfunctions/getJobDetail/` | 职位详情 | `{ id }` |
| `applyJob` | `cloudfunctions/applyJob/` | 申请职位 | `{ jobId }` |
| `initData` | `cloudfunctions/initData/` | 种子数据 | 无 |

## 云函数模板

```javascript
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()

  try {
    // 业务逻辑
    return { code: 0, data: {} }
  } catch (err) {
    console.error(err)
    return { code: -1, message: err.message }
  }
}
```

## 命名规范

- 获取数据：`get` + 实体名（如 `getJobList`、`getJobDetail`）
- 创建/操作：动词 + 实体名（如 `applyJob`、`auditJob`）
- 更新状态：`update` + 实体名 + 属性（如 `updateJobStatus`）

## 已知问题（云函数层面）

1. `getJobDetail` 读取 `publisher.type` 但写入的字段是 `userType`，会导致 undefined
2. `getJobDetail` 读取 `company.logo` 但 `initData` 从未写入该字段
3. `applyJob` 中 `applications.status` 为字符串 `'pending'`，需要确认与前端 mock 的状态枚举一致
4. `quickstartFunctions/` 为空目录，需删除

## 待实现的云函数

根据业务需求，以下云函数尚未编写但 PRD 中有设计：

- `auditJob` -- 教师审核职位背书
- `processApplication` -- 校友处理申请
- `updateProfile` -- 用户更新个人信息
- `logBehavior` -- 记录用户行为埋点

详见 [docs/prd.md](../../docs/prd.md) 中的云函数设计章节。
