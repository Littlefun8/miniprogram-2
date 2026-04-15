# Source of Truth（写作事实基线）

> 本文件用于约束论文内容真实性，避免与实际项目冲突。

## 一、技术栈基线
- 前端：微信小程序原生（WXML/WXSS/JS）。
- UI：TDesign Miniprogram。
- 后端：腾讯云开发（云函数 + 云数据库）。
- 鉴权：`OPENID` + `miniprogram/utils/auth.js`。

## 二、关键实现基线（带证据）
- 小程序启动与云初始化：`miniprogram/app.js`。
- 统一登录管理：`miniprogram/utils/auth.js`。
- 发布职位角色校验与白名单写入：`cloudfunctions/postJob/index.js`。
- 教师审核发布/拒绝与通知：`cloudfunctions/auditJob/index.js`。
- 简历快照与防重复申请：`cloudfunctions/applyJob/index.js`。
- 申请状态机：`cloudfunctions/updateApplicationStatus/index.js`。
- 敏感字段门控：`cloudfunctions/getJobDetail/index.js`。
- 教师统计页调用云函数：`miniprogram/pages/teacher_stats/teacher_stats.js` + `cloudfunctions/getTeacherStats/index.js`。

## 三、业务流程基线
- 主流程：校友发布职位 -> 教师审核 -> 学生申请 -> 校友处理申请。
- 状态流转：`pending -> processing -> accepted/rejected`。
- 申请后解锁敏感字段：仅 `accepted` 返回 `referralCode/contactWechat/jobLink`。

## 四、文档冲突处理规则
- 当 `docs/prd.md` 与代码冲突时，优先级如下：
  1) 代码实现
  2) `docs/handover-2026-04-14.md`
  3) 其他历史文档

## 五、论文写作禁区
- 不得写“Vue3 + Vite 为当前前端主栈”。
- 不得把未实现功能写成“已上线完成”（如职位卡片 Canvas 完整版、背书凭证上传）。
- 不得虚构不存在页面、函数或数据库集合。

