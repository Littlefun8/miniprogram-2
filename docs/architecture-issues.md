# 架构问题与改进建议

> 本文档记录项目当前存在的架构问题、改进建议和优先级。所有问题基于对实际代码的分析发现。
>
> **维护说明**：发现新问题或完成修复后请更新本文档，将已解决的问题标记为 ~~删除线~~。

---

## 已解决的问题

~~### P0-1: 前端全部使用 Mock 数据，云函数未接入~~

**已解决**（2026-04-13）：除 `teacher_stats` 页面外，所有页面已接入云函数。

~~### P0-2: 云函数字段读取与写入不一致~~

**已解决**：`getJobDetail` 已修正为读取正确的字段名。

~~### P0-3: 缺少云开发初始化~~

**已解决**：`app.js` 的 `onLaunch` 中已有 `wx.cloud.init({ env: 'cloud1-3g3q2srz04d1d705' })`。

~~### P0-4: 登录系统为模拟实现~~

**已解决**：使用 `login` 云函数（OPENID 鉴权）+ `setUserRole` 云函数（不可更改）+ `utils/auth.js` 统一管理。

~~### P0-5: 云函数与前端 Mock 数据结构不一致~~

**已解决**：前端全部接入云函数，云函数返回的数据结构与前端使用的结构已对齐。

~~### P1-1: 简历快照机制~~

**已解决**：`applyJob` 云函数从 `users.profile.student.resume` 深拷贝 `resumeSnapshot`。

~~### P1-2: 敏感字段过滤~~

**已解决**：`getJobDetail` 云函数根据申请状态过滤 `referralCode`、`contactWechat`、`jobLink`。

~~### P1-3: 背书审核流程~~

**已解决**：`auditJob` 云函数 + `audit_job` 前端页面 + `manage_applications` 前端页面。

~~### P1-4: 行为埋点~~

**已解决**：`recordUserAction` 云函数 + `userActions` 集合。

~~### P2-1: quickstartFunctions 空目录~~

**已解决**：已删除。

---

## P1 -- 功能缺失（当前活跃）

### P1-1: 教师统计页数据未接入 ⚠️ 当前最高优先级

**现状**：`teacher_stats` 页面包含大量统计模块（概览、趋势、排名等），全部使用硬编码 mock 数据。页面中有 `Math.random()` 生成的模拟数据。

**影响**：教师看到的是虚假数据，无法了解真实的平台运营情况。

**建议**：新建 `getTeacherStats` 云函数，通过聚合查询从 `jobs` 和 `applications` 集合中计算真实数据。

**涉及文件**：
- `cloudfunctions/getTeacherStats/index.js`（新建）
- `miniprogram/pages/teacher_stats/teacher_stats.js`（改造）

### P1-2: 职位卡片 Canvas 绘制

**现状**：`job_detail.js:299` 有 TODO 注释，分享功能当前为文字复制降级方案。

**建议**：使用 Canvas 绘制职位信息卡片图片，保存到相册。

### P1-3: 通知已读标记

**现状**：`notifications` 页面直接使用 `wx.cloud.database()` 更新已读状态，未走云函数。

**建议**：创建 `markNotificationsRead` 云函数或使用前端直接操作配合 Security Rules。

---

## P2 -- 代码质量

### P2-1: 教师统计页导航到不存在的页面

**现状**：`teacher_stats.js` 中有 3 个导航调用指向不存在的页面：
- `/pages/all_applications/index`（line 578）
- `/pages/application_detail/index`（line 588）
- `/pages/handle_application/index`（line 597）

**建议**：改为导航到已有的 `manage_applications` 页面，或创建新页面。

### P2-2: user_profile 导航到不存在的 verify 页面

**现状**：`user_profile.js:102` 导航到 `/pages/verify/index`，该页面不存在。

**建议**：创建身份认证页面，或暂时移除该导航入口。

### P2-3: 收藏列表页未实现

**现状**：`user_profile.js:133` 点击"我的收藏"弹窗提示"功能开发中"。

**建议**：创建收藏列表页面或复用 `job_list` 页面加筛选条件。

### P2-4: 教师统计页三个"查看更多"按钮为 stub

**现状**：
- `viewMoreTopAlumni()`（line 617）— "功能开发中"
- `viewMoreLowResponseAlumni()`（line 637）— "功能开发中"
- `viewMoreSuccessfulStudents()`（line 666）— "功能开发中"

### P2-5: ECharts 引入但未充分使用

**现状**：`echarts-for-weixin` 已引入，但 `teacher_stats` 页面使用纯 CSS 表格展示数据。

**建议**：接入真实数据后，用 ECharts 替代表格展示趋势图和分布图。

---

## 改进路线建议

按优先级排序的推荐实施顺序：

1. **P1-1**（教师统计接入云函数）— 最后一个使用 mock 数据的页面
2. **P1-2**（职位卡片 Canvas）— 提升分享体验
3. **P2-1~P2-4**（代码质量修复）— 修复导航到不存在页面的问题
4. **P2-5**（ECharts 图表）— 视觉提升

---

**文档版本**：v2.0
**最后更新**：2026-04-13
**变更说明**：将已解决的问题移至"已解决"区域，更新当前活跃问题清单，反映职位详情改版后的最新状态
