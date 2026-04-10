# 架构问题与改进建议

> 本文档记录项目当前存在的架构问题、改进建议和优先级。所有问题基于对实际代码的分析发现。

---

## P0 -- 阻塞性问题

这些问题会阻止项目进入可运行状态，需优先解决。

### P0-1: 前端全部使用 Mock 数据，云函数未接入

**现状**：所有 6 个页面的 JS 文件都使用硬编码的本地数组作为数据源，没有任何一个页面调用了云函数或直接操作云数据库。

**影响**：项目无法连接真实数据，所有功能仅存在于 UI 层面。

**建议**：
1. 将 mock 数据抽取到 `miniprogram/mock/` 目录
2. 创建统一的数据服务层（`miniprogram/services/`）
3. 通过编译条件或环境变量切换 mock/真实数据源
4. 逐页接入云函数调用

**涉及文件**：所有 `miniprogram/pages/*/` 下的 JS 文件

---

### P0-2: 云函数字段读取与写入不一致

**现状**：

| 云函数 | 问题 | 后果 |
|--------|------|------|
| `getJobDetail/index.js:43` | 读取 `publisher.type` | 实际字段是 `userType`，返回 `undefined` |
| `getJobDetail/index.js:45` | 读取 `company.logo` | `initData` 从未写入该字段，返回 `undefined` |

**影响**：职位详情页的发布人类型和公司 Logo 无法展示。

**建议**：统一字段命名，将 `getJobDetail` 中的 `publisher.type` 改为 `publisher.userType`，并在 `initData` 中增加 `companies` 的 `logo` 字段。

**涉及文件**：
- `cloudfunctions/getJobDetail/index.js`
- `cloudfunctions/initData/index.js`

---

### P0-3: 缺少云开发初始化

**现状**：`miniprogram/app.js` 中未调用 `wx.cloud.init()`，`app.ts` 中也没有。这意味着即使前端代码调用了 `wx.cloud.database()`，也无法正常工作。

**建议**：在 `app.js` 的 `onLaunch` 中添加：

```javascript
wx.cloud.init({
  env: 'your-env-id',  // 替换为实际环境 ID
  traceUser: true
})
```

**涉及文件**：`miniprogram/app.js`

---

### P0-4: 登录系统为模拟实现

**现状**：用户通过 `wx.showActionSheet()` 选择角色（校友/教师/学生），选择后直接写入 `wx.Storage`。任何用户可伪装任何角色，无后端校验。

**影响**：无法区分真实用户身份，权限控制形同虚设。

**建议**：
1. 前端调用 `login` 云函数获取 OPENID
2. 云函数根据 OPENID 查询 `users` 集合获取真实角色
3. 前端根据云函数返回的角色信息设置本地状态
4. 移除 ActionSheet 角色选择逻辑

**涉及文件**：`miniprogram/pages/user_profile/user_profile.js`，`miniprogram/pages/job_list/job_list.js`，以及所有调用登录逻辑的页面

---

### P0-5: 云函数与前端 Mock 数据结构不一致

**现状**：云函数使用的字段名和结构与前端 mock 数据不同，即使接入也无法直接使用。

**关键差异**：

| 概念 | 云函数返回 | 前端 Mock 期望 |
|------|-----------|---------------|
| 职位 ID | `_id` | `id` |
| 公司信息 | 需关联查询 `company.name` | 扁平字段 `company` (String) |
| 发布日期 | `publishTime` | `date` |
| 发布人 | `publisherId` (需关联查询) | `{ name, tag }` 对象 |
| 申请状态 | `'pending'` | `'pending'/'processing'/'completed'` |

**建议**：参照 [docs/database-schema.md](database-schema.md) 的「目标统一 Schema」，统一两端的数据结构。在云函数返回数据时进行格式转换，或在云函数中使用 `companySnapshot` 冗余存储关联数据。

**涉及文件**：所有云函数 + 所有页面 JS

---

## P1 -- 功能缺失

这些功能在 PRD 中有明确定义，但代码中未实现。

### P1-1: 简历快照机制

**PRD 要求**：学生申请职位时，深拷贝当前简历到申请记录中。

**现状**：`applyJob` 云函数仅创建 `jobId`/`userId`/`status` 三个字段，无简历快照。

**建议**：在 `applyJob` 中查询 `users.profile.resume` 并 JSON 深拷贝到 `applications.resumeSnapshot`。

---

### P1-2: 敏感字段过滤

**PRD 要求**：`referralCode` 和 `contactWechat` 仅对申请通过的申请者展示。

**现状**：
- `jobs` 集合中不存在这两个字段
- `getJobDetail` 云函数不做任何字段过滤
- 前端 mock 中在"已完成"申请中展示 mock 的内推码

**建议**：
1. 在 `jobs` 集合中增加 `referralCode` 和 `contactWechat` 字段
2. `getJobDetail` 云函数中查询申请状态，条件返回敏感字段
3. 前端根据返回数据展示

---

### P1-3: 背书审核流程

**PRD 要求**：校友发布职位时上传背书凭证，教师审核后职位变为"招聘中"。

**现状**：
- `jobs` 集合无 `status`、`endorsementProof`、`endorserInfo` 字段
- 无审核云函数
- 前端无审核页面

**建议**：
1. 在 `jobs` 集合中增加背书相关字段
2. 实现 `auditJob` 云函数
3. 在教师界面增加审核入口

---

### P1-4: 行为埋点

**PRD 要求**：记录用户浏览、申请、分享行为，用于数据分析。

**现状**：未实现。无 `behavior_logs` 集合，无 `logBehavior` 云函数。

---

### P1-5: 教师统计页数据接入

**现状**：`teacher_stats` 页面包含大量统计模块（概览、趋势、排名等），全部使用硬编码数据。需要通过聚合查询从 `jobs` 和 `applications` 集合中计算真实数据。

---

## P2 -- 代码质量

这些问题不影响功能但影响可维护性。

### P2-1: quickstartFunctions 空目录

`cloudfunctions/quickstartFunctions/` 是微信云开发模板的残留，应删除。

### P2-2: 注释掉的旧代码

`job_list.js` 中有注释掉的代码引用了不存在的路径 `/pages/job/job_detail`，应清理。

### P2-3: app.js 与 app.ts 共存

两个文件功能类似但不完全相同（`app.ts` 有 `wx.login()` 调用，`app.js` 没有），职责不清。应确定使用哪一个并删除另一个。

### P2-4: Mock 数据散落管理

Mock 数据硬编码在各页面的 `data` 对象中，难以统一管理和维护。建议抽取到 `miniprogram/mock/` 目录。

### P2-5: package.json 名称

`package.json` 中 `name` 字段为 `miniprogram-ts-quickstart`，应改为项目实际名称。

### P2-6: ECharts 引入但未充分使用

`echarts-for-weixin` 已引入，但 `teacher_stats` 页面使用纯 HTML 表格展示数据，未使用 ECharts 图表。可考虑后续用 ECharts 替代表格。

---

## 改进路线建议

按优先级排序的推荐实施顺序：

1. **修复 P0-3**（云开发初始化）-- 最小改动，最大收益
2. **修复 P0-2**（字段一致性）-- 修复云函数中的字段读取错误
3. **重构 P0-5**（数据结构统一）-- 参照目标 schema 统一云函数和前端
4. **实现 P0-1**（数据接入）-- 创建数据服务层，逐页接入云函数
5. **实现 P0-4**（真实登录）-- 接入 `login` 云函数
6. **实现 P1-3**（背书审核）-- 完成核心业务流程
7. **实现 P1-2**（敏感字段过滤）-- 安全相关
8. **实现 P1-1**（简历快照）-- 业务完整性
9. **清理 P2 问题**-- 代码质量

---

**文档版本**：v1.0
**创建日期**：2026-04-10
**维护说明**：发现问题或完成修复后请更新本文档
