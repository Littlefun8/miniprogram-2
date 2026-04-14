# 测试规范

## 当前测试状态

项目正在建立单元测试体系。测试文件位于 `tests/` 目录。

### 测试目录结构

```
tests/
├── cloudfunctions/       # 云函数单元测试
│   ├── applyJob.test.js
│   ├── auditJob.test.js
│   ├── getJobDetail.test.js
│   └── ...               # 每个云函数对应一个测试文件
└── helpers/              # 测试辅助工具
    └── mock-wx-server-sdk.js  # wx-server-sdk 模拟
```

## 测试策略

### 云函数单元测试

由于微信云函数依赖 `wx-server-sdk`，无法直接在本地运行。测试方案：

1. **Mock wx-server-sdk**：创建模拟模块，提供 `database()`、`getWXContext()` 等方法
2. **抽取纯逻辑函数**：将参数校验、状态流转校验等纯逻辑从云函数中提取，直接测试
3. **集成测试**：通过云开发控制台的"云端测试"功能验证完整流程

### Mock 策略

```javascript
// 模拟 wx-server-sdk
const mockDb = {
  collection: sinon.stub().returns({
    where: sinon.stub().returns({
      get: sinon.stub().resolves({ data: [] }),
      count: sinon.stub().resolves({ total: 0 })
    }),
    doc: sinon.stub().returns({
      get: sinon.stub().resolves({ data: {} }),
      update: sinon.stub().resolves({ stats: {} })
    }),
    add: sinon.stub().resolves({ _id: 'mock-id' })
  })
}
```

### 前端页面测试

使用 miniprogram 自动化测试工具（`miniprogram-automator`）：

```javascript
const automator = require('miniprogram-automator')
const miniProgram = await automator.launch()
const page = await miniProgram.reLaunch('/pages/job_list/job_list')
```

> 注意：前端页面测试需要在微信开发者工具环境中运行，不适合 CI 环境。

## 测试覆盖优先级

| 优先级 | 模块 | 说明 | 状态 |
|--------|------|------|------|
| P0 | 云函数核心逻辑 | 申请职位、获取职位详情、审核职位 | 待编写 |
| P0 | 权限校验 | 角色权限、敏感字段过滤、状态流转 | 待编写 |
| P0 | 参数校验 | 必填字段检查、枚举值校验 | 待编写 |
| P1 | 页面交互 | 导航、表单提交、状态切换 | 待编写 |
| P2 | 边界情况 | 空数据、网络错误、并发操作 | 待编写 |

## 运行测试

```bash
# 安装依赖
npm install

# 运行所有测试
npm test

# 运行单个测试文件
npx jest tests/cloudfunctions/applyJob.test.js
```

## 注意事项

- 云函数测试需要 mock `wx-server-sdk`，不要尝试在本地安装真实的 `wx-server-sdk`
- 测试数据应使用独立的 mock 数据，不要依赖真实的云数据库
- 每个测试用例应独立运行，不依赖其他测试的执行结果
