# 表3-2 模块调用链与边界表

| 业务链路 | 页面入口 | 云函数调用链 | 关键数据集合 | 边界规则 |
|---|---|---|---|---|
| 职位列表查询 | `pages/job_list/job_list.js` | `getJobList` | `jobs` | 默认只查 published，统一分页 |
| 职位发布审核 | `pages/post_job` -> `pages/audit_job` | `postJob` -> `auditJob` | `jobs`, `notifications` | 发布者/审核者角色分离 |
| 学生申请处理 | `pages/job_detail` -> `pages/manage_applications` | `applyJob` -> `updateApplicationStatus` | `applications`, `jobs` | 状态机合法性校验 |
| 详情信息门控 | `pages/job_detail` | `getJobDetail` | `jobs`, `applications` | accepted 才返回敏感字段 |
| 教师统计聚合 | `pages/teacher_stats` | `getTeacherStats` | `users`, `applications`, `jobs` | 仅 teacher/admin 可访问 |

