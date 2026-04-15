# 表：核心云函数职责说明

| 云函数 | 主要职责 | 关键校验 | 关键输出 |
|---|---|---|---|
| login | 用户登录与自动注册 | OPENID 获取 | 用户基础信息 |
| setUserRole | 首次角色设置 | 合法角色枚举 | userType |
| postJob | 发布职位 | 角色校验、必填校验 | 待审核职位ID |
| auditJob | 教师审核职位 | 教师角色、状态校验 | 发布/拒绝结果 |
| getJobList | 获取职位列表 | 分页与筛选参数 | 列表、total、hasMore |
| getJobDetail | 获取职位详情 | jobId 校验、敏感字段门控 | 职位详情 |
| applyJob | 提交申请 | 职位状态、防重复 | 申请成功结果 |
| updateApplicationStatus | 更新申请状态 | 发布者权限、状态机 | 状态更新结果 |
| getApplications | 查询申请列表 | 视角参数 asPublisher | 列表、分页信息 |
| getTeacherStats | 教师统计聚合 | 角色校验 | overview、trend 等 |

