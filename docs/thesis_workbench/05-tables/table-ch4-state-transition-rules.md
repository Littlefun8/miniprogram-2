# 表4-4 申请状态迁移规则表

| 当前状态 | 目标状态 | 允许/禁止 | 触发角色 | 返回码建议 | 规则说明 |
|---|---|---|---|---|---|
| pending | processing | 允许 | 校友（发布者） | 200 | 进入处理阶段 |
| pending | accepted | 禁止 | 校友（发布者） | 409 | 不允许越级通过 |
| pending | rejected | 禁止 | 校友（发布者） | 409 | 不允许越级拒绝 |
| processing | accepted | 允许 | 校友（发布者） | 200 | 审核通过终态 |
| processing | rejected | 允许 | 校友（发布者） | 200 | 审核拒绝终态 |
| accepted | * | 禁止 | 任意 | 409 | accepted 为终态 |
| rejected | * | 禁止 | 任意 | 409 | rejected 为终态 |

