# 安全与权限规则

## 数据库权限模型

微信云数据库通过 Security Rules 控制读写权限。目前项目未配置自定义 Security Rules，使用默认规则。

### 当前实际权限

- 所有云函数使用管理员权限（绕过 Security Rules）
- 前端仅 `notifications` 页面使用 `wx.cloud.database()` 直接更新已读状态，其余全部通过云函数操作

### 目标权限规则（待实现）

#### jobs 集合

```json
{
  "read": "auth.openid != null",
  "write": "auth.openid != null && doc.publisherId == auth.openid"
}
```

#### applications 集合

```json
{
  "read": "auth.openid != null && (doc.userId == auth.openid || doc.publisherId == auth.openid)",
  "write": false
}
```

## 敏感字段保护

以下字段在未满足条件时不得返回给前端（`getJobDetail` 云函数中已实现过滤）：

| 集合 | 字段 | 解锁条件 |
|------|------|----------|
| `jobs` | `referralCode` | 申请状态为 `accepted`（已通过） |
| `jobs` | `contactWechat` | 申请状态为 `accepted`（已通过） |
| `jobs` | `jobLink` | 申请状态为 `accepted`（已通过） |

> 已实现：`getJobDetail` 云函数会查询当前用户对该职位的申请状态，非 `accepted` 时删除上述字段后返回。

## 用户身份校验

### 当前方案（已实现）

- `app.js` 的 `onLaunch` 调用 `auth.silentLogin()` 静默登录
- 静默登录调用 `login` 云函数，使用 OPENID 自动注册/获取用户信息
- 首次用户通过 `interactiveLogin()` 选择角色，调用 `setUserRole` 云函数（不可更改）
- 角色信息存储在 `users` 集合的 `userType` 字段
- 本地缓存通过 `utils/auth.js` 管理（`isLoggedIn`、`userType`、`userInfo`）

### 待改进

- 无真实身份验证（校友/教师身份无法核实）
- `/pages/verify/index` 身份认证页面尚未创建
- userType 虽不可更改，但选择时无审核

## 已知安全风险

| 风险 | 级别 | 说明 |
|------|------|------|
| `notifications` 页面直接操作数据库 | 中 | 使用 `wx.cloud.database()` 更新已读状态，未走云函数 |
| 无身份验证 | 中 | 校友/教师角色无实名认证，用户自选 |
| `getJobList` 无 OPENID 校验 | 低 | 职位列表为公开数据，暂无安全风险 |

## 禁止的安全操作

- 禁止在前端直接暴露云数据库连接字符串
- 禁止在客户端代码中硬编码任何密钥或 token
- 禁止绕过云函数直接在前端操作敏感集合
- 禁止将 `userInfo` 中的个人敏感信息（手机号等）存储在 `wx.Storage` 中
