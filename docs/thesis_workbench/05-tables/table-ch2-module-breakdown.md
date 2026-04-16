# 表2-2 功能模块分解表（需求章节）

| 模块 | 需求编号 | 子功能 | 输入 | 输出 | 约束/校验 |
|---|---|---|---|---|---|
| 用户与权限管理 | REQ-F-01 | 自动注册与登录 | OPENID | userInfo/userType | 身份来源仅服务端上下文 |
| 用户与权限管理 | REQ-F-01 | 首次角色设置 | userType | role 持久化 | 合法角色枚举校验 |
| 职位管理 | REQ-F-02 | 职位发布 | 表单字段 | pending 职位记录 | 角色校验 + 白名单写入 |
| 职位管理 | REQ-F-02 | 教师审核 | jobId/action | 审核结果/通知 | 仅 teacher 可审核 |
| 职位管理 | REQ-F-04 | 敏感信息门控 | jobId | 详情对象 | accepted 才返回敏感字段 |
| 申请与进度管理 | REQ-F-03 | 申请提交 | jobId | 申请记录 | 职位状态可申请 + 防重复 |
| 申请与进度管理 | REQ-F-03 | 状态流转 | applicationId/status | 状态更新结果 | 状态机合法性校验 |
| 通知与统计 | REQ-F-05 | 教师统计 | timeRange | overview/trend 等 | teacher/admin 角色校验 |
| 通知与统计 | REQ-F-05 | 通知查询 | pageNum/pageSize | 列表 + 未读数 | userId 过滤 + 分页 |

