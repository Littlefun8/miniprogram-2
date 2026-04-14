# 教师统计页接入云函数 — 实施文档

> **日期**：2026-04-13 ~ 2026-04-14
> **参与者**：用户 + Claude Code
> **基于分支**：`feature/job-detail-redesign`

## 背景问题

`teacher_stats` 页面是项目中唯一仍使用硬编码 mock 数据的页面。页面包含 7 个统计模块（概览、状态分布、趋势、热门岗位、校友排行、学生排行、最近申请），全部使用 `Math.random()` 和硬编码数组生成假数据。教师用户看到的是完全虚假的统计信息。

## 设计决策记录

### D1: 云函数设计 — 全量聚合 vs 分接口

**选择**：单一 `getTeacherStats` 云函数，一次性返回所有统计数据

**理由**：
- 教师统计页各模块数据高度关联，分开请求会增加延迟和代码复杂度
- 云函数内可复用已查询的数据（如 applications 数组用于多个计算）
- 单次调用避免并发问题

**影响**：云函数代码较长（390 行），但逻辑清晰、分段注释

### D2: 趋势数据时间范围

**选择**：支持 4 种时间粒度 — week/month/semester/all

**理由**：与前端已有的 4 个筛选按钮（本周/本月/本学期/全部）一一对应

### D3: 前端字段名修正

**选择**：修改 wxml 模板适配云函数返回的数据结构，而非在云函数中适配旧字段名

**理由**：旧字段名来自 mock 数据（如 `totalApplies`），不够语义化；云函数使用更清晰的命名（如 `totalApplications`）

## 实施内容

### 任务 1：新建 getTeacherStats 云函数

**涉及文件**：
- `cloudfunctions/getTeacherStats/index.js`（新建，390 行）
- `cloudfunctions/getTeacherStats/package.json`（新建）

**改动要点**：
- 教师身份校验（teacher/admin）
- 并行查询 users/jobs/applications 基础数据
- 计算 7 个统计模块：
  1. `overview` — 学生总数、申请总数、各状态计数、通过率
  2. `statusDistribution` — 4 种状态的分布百分比
  3. `hotJobs` — 按申请数排序的岗位排行
  4. `topReferralPosters` — 发布职位最多的校友
  5. `lowResponsivenessAlumni` — 有待处理申请的校友
  6. `highSuccessRateStudents` — 申请成功率最高的学生
  7. `recentApplications` — 最近 10 条申请记录
  8. `trendData` — 按时间粒度聚合的趋势数据
  9. `funnelStages` — 申请漏斗（提交→审核→通过）

### 任务 2：改造 teacher_stats.js 前端

**涉及文件**：`miniprogram/pages/teacher_stats/teacher_stats.js`

**改动要点**：
- 移除全部硬编码 mock 数据（~640 行删减到 ~280 行）
- 新增 `loadStatsData(timeRange)` 调用云函数
- 新增 `buildJobSelectFromHotJobs()` 构建岗位选择器
- 修正导航到已有页面（`manage_applications`）替代不存在的页面

### 任务 3：修复 wxml/wxss 数据绑定

**涉及文件**：
- `miniprogram/pages/teacher_stats/teacher_stats.wxml`
- `miniprogram/pages/teacher_stats/teacher_stats.wxss`

**改动要点**：
- 修正 overview 字段名（totalApplies→totalApplications 等）
- 修正 wx:key（alumnusId/studentId→name）
- 移除不存在的字段引用（graduationYear/lastActiveOnReferral）
- 趋势条宽度改为动态计算
- 状态样式 approved→accepted，新增 processing

### 任务 4：建立测试框架

**涉及文件**：
- `tests/helpers/mock-wx-server-sdk.js`（新建）
- `tests/cloudfunctions/getTeacherStats.test.js`（新建）
- `tests/cloudfunctions/validation.test.js`（新建）

### 任务 5：更新文档体系

**涉及文件**：
- `.claude/CLAUDE.md` — 云函数 17→18，teacher_stats 标记已完成
- `.claude/rules/cloud-functions.md` — 新增 getTeacherStats 到清单
- `docs/architecture-issues.md` — P1-1、P2-1 标记为已解决

## 注意事项

### 云函数局限性

1. **分页问题**：`db.collection('applications').get()` 默认最多返回 20 条记录。当申请量增长后需要分页查询或使用聚合。当前种子数据仅 6 条，暂无问题。
2. **性能**：单次调用查询了 4 个集合并做多次遍历，数据量大时可能超时（云函数默认 20s 限制）。

### 前端遗留

1. `viewMoreTopAlumni()`、`viewMoreLowResponseAlumni()`、`viewMoreSuccessfulStudents()` 三个"查看更多"按钮仍是 stub
2. `thankAlumnus()`、`contactAlumnus()`、`inviteShareExperience()` 为模拟功能，实际未发消息
3. 筛选弹出层中的"申请状态"和"班级"筛选未真正过滤数据

---

**文档版本**：v1.0
**最后更新**：2026-04-14
**变更说明**：初始版本
