# 表3-2 功能模块与实现要素对应表

| 功能模块 | 主要业务内容 | 主要页面 | 主要云函数 | 主要数据对象 | 约束要点 |
|---|---|---|---|---|---|
| 用户与权限管理模块 | 登录、角色设置、会话恢复 | `pages/profile`、`pages/login` | `login`、`setUserRole` | `users` | 身份识别基于 OPENID |
| 职位管理模块 | 职位发布、职位审核、职位展示 | `pages/post_job`、`pages/audit_job`、`pages/job_list`、`pages/job_detail` | `postJob`、`auditJob`、`getJobList`、`getJobDetail` | `jobs`、`notifications` | 发布与审核角色分离 |
| 申请与进度管理模块 | 申请提交、申请处理、进度查询 | `pages/job_detail`、`pages/manage_applications`、`pages/application_progress` | `applyJob`、`updateApplicationStatus`、`getApplications` | `applications`、`jobs` | 重复申请拦截，状态更新受限 |
| 通知与统计模块 | 结果通知、统计查询 | `pages/notifications`、`pages/teacher_stats` | `getNotifications`、`getTeacherStats` | `notifications`、`users`、`applications`、`jobs` | 教师统计需满足角色权限 |

来源：作者根据系统设计与实现整理

