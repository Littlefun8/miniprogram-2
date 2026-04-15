# 表4-1 核心云函数职责说明

| 云函数 | 需求映射 | 主要职责 | 关键校验 | 关键输出 | 代码证据 |
|---|---|---|---|---|---|
| login | REQ-F-01 | 用户登录与自动注册 | OPENID 获取 | 用户基础信息 | `cloudfunctions/login/index.js` |
| setUserRole | REQ-F-01 | 首次角色设置 | 合法角色枚举 | userType | `cloudfunctions/setUserRole/index.js` |
| postJob | REQ-F-02 | 发布职位 | 角色校验、必填校验、白名单写入 | 待审核职位ID | `cloudfunctions/postJob/index.js` |
| auditJob | REQ-F-02 | 教师审核职位 | 教师角色、pending 状态校验 | 发布/拒绝结果与通知 | `cloudfunctions/auditJob/index.js` |
| getJobList | REQ-F-02 | 获取职位列表 | 分页与筛选参数 | 列表、total、hasMore | `cloudfunctions/getJobList/index.js` |
| getJobDetail | REQ-F-04 | 获取职位详情 | jobId 校验、敏感字段门控 | 职位详情 | `cloudfunctions/getJobDetail/index.js` |
| applyJob | REQ-F-03 | 提交申请 | 职位状态、防重复、资料相关校验 | 申请成功结果 | `cloudfunctions/applyJob/index.js` |
| updateApplicationStatus | REQ-F-03 | 更新申请状态 | 发布者权限、状态机合法性 | 状态更新结果 | `cloudfunctions/updateApplicationStatus/index.js` |
| getApplications | REQ-F-03 | 查询申请列表 | 视角参数 asPublisher | 列表、分页信息 | `cloudfunctions/getApplications/index.js` |
| getTeacherStats | REQ-F-05 | 教师统计聚合 | teacher/admin 角色校验 | overview、trend、funnel 等 | `cloudfunctions/getTeacherStats/index.js` |


