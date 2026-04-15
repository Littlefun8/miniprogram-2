# 表2-4 非功能需求量化表

| 类别 | 需求编号 | 需求描述 | 量化/判定标准 | 设计策略 | 证据位置 |
|---|---|---|---|---|---|
| 安全性 | REQ-NF-01 | 防止越权访问与敏感信息泄露 | 关键写操作均走云函数；敏感字段需状态门控 | OPENID 鉴权 + 角色校验 + 敏感字段门控 | `postJob`, `auditJob`, `getJobDetail` |
| 性能 | REQ-NF-02 | 列表查询稳定可控 | 分页查询，`limit <= 20` | 统一分页参数与上限控制 | `getJobList`, `getApplications`, `getNotifications` |
| 可维护性 | REQ-NF-03 | 便于定位问题与迭代 | 一功能一云函数，接口结构统一 | 模块化函数目录 + 统一返回结构 | `cloudfunctions/*/index.js` |
| 可扩展性 | REQ-NF-04 | 支持后续能力扩展 | 新模块可按函数和页面独立扩展 | 页面分层 + 结构化数据模型 | `miniprogram/pages/*`, `docs/database-schema.md` |
| 可用性 | REQ-NF-05 | 流程连贯、反馈明确 | 关键流程有状态反馈和提示 | 状态驱动页面展示 + 提示机制 | `job_detail.js`, `manage_applications` |


