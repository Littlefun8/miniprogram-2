# 表4-5 详细设计错误码约束表

| 场景 | 典型错误码 | 触发条件 | 用户侧处理建议 | 代码证据 |
|---|---|---|---|---|
| 参数缺失 | 400 | 缺必要参数（如 jobId、applicationId） | 提示并阻止提交 | `applyJob`、`updateApplicationStatus` |
| 未登录/未注册 | 401 | 用户记录不存在 | 引导重新登录/初始化账号 | `postJob`、`auditJob` |
| 无权限 | 403 | 角色不匹配或非资源所有者 | 提示无权操作 | `auditJob`、`updateApplicationStatus` |
| 资源不存在 | 404 | job/app 不存在 | 提示数据已变更并刷新 | `getJobDetail`、`updateApplicationStatus` |
| 业务冲突 | 409 | 重复申请或非法状态迁移 | 提示业务冲突，保持现状态 | `applyJob`、`updateApplicationStatus` |
| 服务异常 | 500 | 云函数异常 | 提示稍后重试并记录日志 | 多数云函数 catch 返回 |

