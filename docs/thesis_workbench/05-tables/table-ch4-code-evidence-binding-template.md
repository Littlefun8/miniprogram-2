# 表4-7 设计结论与代码证据绑定模板

| 设计点ID | 设计结论 | 代码路径 | 关键符号/函数 | 返回码/状态 | 一致性结论 | 备注 |
|---|---|---|---|---|---|---|
| DS-XX | 示例：申请状态必须遵守状态机 | `cloudfunctions/updateApplicationStatus/index.js` | `VALID_STATUS_TRANSITIONS` | 409 | 一致/需改进 | 可补 timeline 追加 |
| DS-XX | 示例：敏感字段仅 accepted 可见 | `cloudfunctions/getJobDetail/index.js` | `SENSITIVE_FIELDS` 删除逻辑 | 200 | 一致 | 建议补访问日志 |

