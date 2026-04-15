# Prompt - 第 4 章 系统详细设计

基于 `02-prompts/00-master-prompt.md`，撰写第 4 章《系统详细设计》。

## 章节要求
- 4.1 鉴权与权限控制设计
- 4.2 职位发布与审核模块设计
- 4.3 申请与状态机模块设计
- 4.4 职位详情敏感字段控制设计
- 4.5 数据库与索引设计
- 4.6 本章小结

## 必须引用的实现细节
- `cloud.getWXContext().OPENID`
- 白名单写入策略
- `pending -> processing -> accepted/rejected`
- 敏感字段在 accepted 后返回

## 字数建议
3000-4500。

