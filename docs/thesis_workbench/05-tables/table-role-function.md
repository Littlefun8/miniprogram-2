# 表2-1 角色功能矩阵

| 角色 | 功能ID | 用例ID | 功能描述 | 输入 | 输出 | 关键约束 | 代码证据 |
|---|---|---|---|---|---|---|---|
| 学生 | REQ-F-02-03 | UC-S01 | 浏览与筛选职位 | 搜索词、筛选条件 | 职位列表 | 仅显示 published 职位 | `getJobList/index.js`, `job_list.js` |
| 学生 | REQ-F-03-01 | UC-S02 | 发起职位申请 | jobId、资料信息 | 申请记录 | 防重复、资料完整度校验 | `applyJob/index.js`, `job_detail.js` |
| 学生 | REQ-F-03-05 | UC-S03 | 查看申请进度 | 状态筛选 | 申请进度列表 | 按用户视角查询 | `getApplications/index.js` |
| 学生 | REQ-F-04-02 | UC-C01 | 解锁敏感信息 | jobId | 含/不含敏感字段的详情 | 仅 accepted 可见敏感字段 | `getJobDetail/index.js` |
| 校友 | REQ-F-02-01 | UC-A01 | 发布职位 | 职位表单 | 待审核职位ID | 仅 alumni/teacher 可发布 | `postJob/index.js` |
| 校友 | REQ-F-03-04 | UC-A02 | 处理申请状态 | applicationId、目标状态 | 更新结果 | 发布者权限 + 状态机规则 | `updateApplicationStatus/index.js` |
| 教师 | REQ-F-02-02 | UC-T01 | 审核职位 | jobId、approve/reject | 审核结果与通知 | 仅 teacher 可审核 | `auditJob/index.js` |
| 教师 | REQ-F-05-01 | UC-T02 | 查看统计 | timeRange | overview/trend 等聚合数据 | 仅 teacher/admin 可访问 | `getTeacherStats/index.js` |


