# Diagram Prompts（可直接给 AI）

## 1. 总用例图 Prompt
请基于以下角色与功能输出 PlantUML 用例图源码：
- 角色：学生、校友、教师
- 学生：浏览职位、申请职位、查看申请进度
- 校友：发布职位、处理申请
- 教师：审核职位、查看统计
要求：图中中文标签简洁，关系清楚。

## 2. 架构图 Prompt
请输出 Mermaid 架构图源码，展示：
- 小程序前端页面层
- 云函数服务层
- 云数据库
- 鉴权与权限控制
要求：体现调用方向与职责边界。

## 3. 状态机图 Prompt
请输出 Mermaid 状态图源码：
- 初始状态 pending
- pending 可转 processing
- processing 可转 accepted/rejected
- accepted/rejected 为终态
要求：符合软件工程论文状态机表达。

## 4. ER 图 Prompt
请输出 Mermaid ER 图源码，实体至少包含：
`users`、`jobs`、`applications`、`notifications`、`favorites`、`userActions`。
要求：关系线尽量准确，便于论文插图。

