# 测试规范

## 当前测试状态

项目目前无自动化测试。仅有一个 miniprogram 自动化测试配置：

- `minitest/test.config.json` -- 游客浏览测试用例
- `minitest/游客游览.json` -- 测试数据

## 测试策略（建议）

### 云函数测试

由于微信云函数依赖 `wx-server-sdk`，无法直接在本地 Node.js 环境运行。测试方案：

1. **单元测试**：抽取纯逻辑函数，使用 Jest 测试
2. **集成测试**：通过云开发控制台的"云端测试"功能
3. **手动测试**：在微信开发者工具的云函数调试面板中执行

### 前端页面测试

使用 miniprogram 自动化测试工具（`miniprogram-ci` + miniprogram-automator）：

```javascript
// 示例：测试职位列表页加载
const automator = require('miniprogram-automator')
const miniProgram = await automator.launch()
const page = await miniProgram.reLaunch('/pages/job_list/job_list')
// 断言页面元素
```

### Mock 数据管理

当前所有页面使用内嵌的 mock 数据数组。建议：

1. 将 mock 数据抽取到独立的 `mock/` 目录
2. 每个页面对应一个 mock 文件
3. 通过环境变量或编译条件切换 mock / 真实数据源
4. Mock 数据结构应与 `docs/database-schema.md` 中的设计保持一致

## 测试覆盖优先级

| 优先级 | 模块 | 说明 |
|--------|------|------|
| P0 | 云函数核心逻辑 | 申请职位、获取职位详情 |
| P0 | 权限校验 | 角色权限、敏感字段过滤 |
| P1 | 页面交互 | 导航、表单提交、状态切换 |
| P2 | 边界情况 | 空数据、网络错误、并发操作 |
