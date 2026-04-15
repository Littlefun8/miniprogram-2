# 表3-3 核心接口样例表

| 接口名 | 调用入口 | 请求参数示例 | 响应结构示例 | 鉴权来源 | 状态/规则约束 | 代码证据 |
|---|---|---|---|---|---|---|
| getJobList | `job_list.js` | `{ pageNum, pageSize, keyword, city }` | `{ code, data, total, hasMore }` | OPENID（上下文） | 默认 status=published | `getJobList/index.js` |
| postJob | `post_job.js` | `{ title, salary, company, location, ... }` | `{ code, message, id }` | OPENID + userType | 仅 alumni/teacher | `postJob/index.js` |
| applyJob | `job_detail.js` | `{ jobId }` | `{ code, message }` | OPENID | 防重复 + 职位状态可申请 | `applyJob/index.js` |
| updateApplicationStatus | `manage_applications.js` | `{ applicationId, status, remark }` | `{ code, message }` | OPENID | 发布者权限 + 状态机 | `updateApplicationStatus/index.js` |
| getJobDetail | `job_detail.js` | `{ id }` | `{ code, data }` | OPENID | accepted 才回敏感字段 | `getJobDetail/index.js` |
| getTeacherStats | `teacher_stats.js` | `{ timeRange }` | `{ code, data: { overview, trendData, ... } }` | OPENID + userType | teacher/admin 可访问 | `getTeacherStats/index.js` |

