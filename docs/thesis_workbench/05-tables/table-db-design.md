# 表：数据库集合与关键字段

| 集合 | 业务含义 | 关键字段 | 说明 |
|---|---|---|---|
| users | 用户信息 | _openid, userType, nickName, profile | 角色与个人资料中心 |
| jobs | 职位信息 | title, salary, location, status, publisherId | 状态驱动职位生命周期 |
| applications | 申请记录 | jobId, userId, status, resumeSnapshot, timeline | 申请流转与历史固化 |
| notifications | 通知信息 | userId, type, title, isRead | 审核与流程消息触达 |
| favorites | 收藏关系 | userId, jobId | 学生收藏职位 |
| userActions | 行为日志 | userId, jobId, actionType, weight | 行为埋点与后续分析 |

