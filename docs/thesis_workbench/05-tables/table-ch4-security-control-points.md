# 表4-6 安全控制点设计表

| 控制点ID | 控制点描述 | 所在环节 | 控制方式 | 代码证据 | 风险备注 |
|---|---|---|---|---|---|
| SEC-01 | 身份来源可信 | 所有云函数入口 | `getWXContext().OPENID` | `cloudfunctions/*/index.js` | 禁止信任前端 userId |
| SEC-02 | 角色权限控制 | 发布/审核/统计 | 查询 `users.userType` 并校验 | `postJob`、`auditJob`、`getTeacherStats` | 角色漂移需审计 |
| SEC-03 | 资源归属控制 | 申请状态更新 | 校验 `job.publisherId === OPENID` | `updateApplicationStatus` | 防止越权处理 |
| SEC-04 | 写入字段白名单 | 职位发布/申请创建 | 构建白名单对象，不展开 event | `postJob`、`applyJob` | 防字段注入 |
| SEC-05 | 敏感字段门控 | 职位详情 | accepted 才返回敏感字段 | `getJobDetail` | 防敏感信息泄露 |
| SEC-06 | 状态机防绕过 | 申请处理 | 显式状态迁移表校验 | `updateApplicationStatus` | 防非法跃迁 |

