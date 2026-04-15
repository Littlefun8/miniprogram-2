# 表2-5 需求可追踪矩阵

| 需求ID | 需求描述 | 页面入口 | 云函数 | 关键校验 | 关键输出 | 验收要点 |
|---|---|---|---|---|---|---|
| REQ-F-01-01 | 自动注册登录 | app 启动 | `login` | OPENID 获取 | userInfo | 首次进入自动建档 |
| REQ-F-01-02 | 角色设置 | 个人中心登录弹窗 | `setUserRole` | 合法角色校验 | userType | 角色写入并可读取 |
| REQ-F-02-01 | 发布职位 | `post_job` | `postJob` | alumni/teacher 权限 | pending 职位ID | 非法角色发布失败 |
| REQ-F-02-02 | 教师审核 | `audit_job` | `auditJob` | teacher 权限 + 状态校验 | 审核结果 | 审核后状态正确 |
| REQ-F-02-03 | 列表过滤 | `job_list` | `getJobList` | status 默认 published | 列表/分页 | 学生只见发布职位 |
| REQ-F-03-01 | 申请提交 | `job_detail` | `applyJob` | 可申请状态 + 防重复 | 申请成功 | 重复申请被拒绝 |
| REQ-F-03-04 | 状态流转 | `manage_applications` | `updateApplicationStatus` | 发布者权限 + 状态机 | 更新结果 | 非法跃迁被拦截 |
| REQ-F-04-02 | 敏感字段门控 | `job_detail` | `getJobDetail` | accepted 检查 | 详情对象 | 非 accepted 不返回敏感字段 |
| REQ-F-05-01 | 教师统计 | `teacher_stats` | `getTeacherStats` | teacher/admin 校验 | overview/trend | 无权限无法访问 |
| REQ-F-05-03 | 通知查询 | `notifications` | `getNotifications` | userId 过滤 + 分页 | 列表/未读数 | 未读数统计正确 |

