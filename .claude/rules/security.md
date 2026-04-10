# 安全与权限规则

## 数据库权限模型

微信云数据库通过 Security Rules 控制读写权限。目前项目未配置自定义 Security Rules，使用默认规则。

### 当前实际权限

- 所有云函数使用管理员权限（绕过 Security Rules）
- 前端暂无直接数据库操作（全部使用 mock 数据）

### 目标权限规则（待实现）

#### jobs 集合

```json
{
  "read": "auth.openid != null",
  "write": "auth.openid != null && doc.publisherId == auth.openid"
}
```

- 所有登录用户可读已发布职位
- 仅职位发布者可修改自己的职位

#### applications 集合

```json
{
  "read": "auth.openid != null && (doc.userId == auth.openid || doc.publisherId == auth.openid)",
  "write": false
}
```

- 申请人和职位发布者可读申请记录
- 写入仅通过云函数操作

## 敏感字段保护

以下字段在未满足条件时不得返回给前端：

| 集合 | 字段 | 解锁条件 |
|------|------|----------|
| `jobs` | `referralCode` | 申请状态为 `accepted`（已通过） |
| `jobs` | `contactWechat` | 申请状态为 `accepted`（已通过） |

> 注意：当前代码中这些字段尚未实现。`initData` 未创建这些字段，前端 mock 中仅在"已完成"状态的申请里展示。

## 用户身份校验

### 当前方案

- 使用 `wx.showActionSheet()` 模拟登录，用户自行选择角色
- 角色存储在 `wx.Storage`：`userType`（`'alumni'` | `'teacher'` | `'student'`）
- **无后端校验**，任何用户可伪装任何角色

### 目标方案

- 通过 `login` 云函数使用 OPENID 鉴权
- 角色信息存储在 `users` 集合的 `userType` 字段
- 云函数内部通过 `cloud.getWXContext().OPENID` 获取真实身份

## 禁止的安全操作

- 禁止在前端直接暴露云数据库连接字符串
- 禁止在客户端代码中硬编码任何密钥或 token
- 禁止绕过云函数直接在前端操作敏感集合
- 禁止将 `userInfo` 中的个人敏感信息（手机号等）存储在 `wx.Storage` 中
