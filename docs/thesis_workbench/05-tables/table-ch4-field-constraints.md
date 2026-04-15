# 表4-3 关键字段约束表

| 集合 | 字段 | 类型/示例 | 约束规则 | 写入时机 | 校验位置 |
|---|---|---|---|---|---|
| jobs | title | String | 必填，非空 | 发布职位 | `postJob` 参数校验 |
| jobs | status | pending/published/rejected | 仅允许枚举值 | 发布/审核 | `postJob`/`auditJob` |
| jobs | publisherId | String(OPENID) | 不信任前端传值，服务端填充 | 发布职位 | `postJob` |
| jobs | referralCode | String | 敏感字段，详情按状态门控返回 | 发布职位 | `getJobDetail` |
| jobs | contactWechat | String | 敏感字段，详情按状态门控返回 | 发布职位 | `getJobDetail` |
| jobs | jobLink | String | 敏感字段，详情按状态门控返回 | 发布职位 | `getJobDetail` |
| applications | jobId | String | 必填，关联职位 | 申请创建 | `applyJob` |
| applications | userId | String(OPENID) | 服务端上下文获取 | 申请创建 | `applyJob` |
| applications | status | pending/processing/accepted/rejected | 严格状态机约束 | 申请创建/状态更新 | `applyJob`/`updateApplicationStatus` |
| applications | timeline | Array | 状态历史节点，建议每次变更追加 | 申请创建/状态更新 | `applyJob`/后续优化点 |
| notifications | userId | String | 必填，目标用户 | 审核/状态变化 | `auditJob`/其他通知函数 |
| users | userType | student/alumni/teacher/admin | 合法枚举校验 | 角色设置 | `setUserRole` |

