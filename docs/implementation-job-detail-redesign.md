# 职位详情页改版 & 交互优化 — 实施文档

> 日期：2026-04-13
> 讨论参与者：用户 + Claude
> 基于：`feature/seed-data-and-improvements` 分支

## 背景问题

1. **职位详情页交互链路不合理**：外部二维码指向百度招聘（与本平台无关）；"展开关联"按钮实为显示教师评价/成绩但入口文字写"扫描二维码"；截图水印功能用途不明
2. **内推流程不清晰**：学生不清楚申请后能看到什么，缺乏"解锁"的动力
3. **海投问题**：学生可能无差别申请所有职位，浪费校友审核精力
4. **筛选体验**：选中城市/岗位后按钮文字不变，用户不知道当前筛选状态

## 设计决策记录

### D1: 内推模式
- **决策**：同时支持"内推码/链接"和"直推简历"两种模式
- **影响**：职位详情页需要同时展示内推码、内推链接、校友联系方式

### D2: 教师评价/成绩归属
- **决策**：从职位详情页移除，移至学生个人主页（完整展示）+ 校友申请管理页（查看申请时展示）
- **理由**：教师评价和成绩是关于具体学生的，不是关于职位的

### D3: 一键保存/分享
- **决策**：保留并升级为双通道——微信小程序分享 + 生成图片卡片
- **理由**：学生有分享职位给同学的真实需求

### D4: 申请门槛
- **决策**：组合方案（硬门槛 + 软提醒），不限制申请数量
- **硬门槛**：资料完善度不足时禁止申请，引导去编辑资料页
- **软门槛**：校友发布时可设置期望专业/年级，学生不匹配时弹出警告但允许继续

---

## 实施内容

### 任务 1：职位详情页改版

**涉及文件：**
- `miniprogram/pages/job_detail/job_detail.wxml` — 页面结构重写
- `miniprogram/pages/job_detail/job_detail.js` — 状态驱动逻辑
- `miniprogram/pages/job_detail/job_detail.wxss` — 样式更新

**改动要点：**

1. **删除模块**
   - 删除外部二维码区域（`qrcode-section`）
   - 删除"展开关联"按钮（`expandAssociation`）
   - 删除"一键保存"按钮（`saveAllInfo`）
   - 删除截图水印区域（`screenshot-info`）
   - 删除关联信息区域（`association-section`）

2. **新增模块**
   - 岗位描述区（description + requirements）
   - 内推通道区（状态驱动，4 种状态）

3. **内推通道区域设计**
   ```
   未登录：  模糊锁定 + 点击"申请"→ 登录提示
   未申请：  锁定状态（灰色遮罩 + 🔒 图标）
            底部：[❤ 收藏] [申请内推]
   待审核：  ⏳ "申请审核中"
            底部：[❤ 收藏] [审核中...（禁用）]
   已通过：  🎉 解锁内推码 + 内推链接 + 校友微信（各带复制按钮）
            底部：[❤ 收藏] [📤 分享给同学]
   已拒绝：  ❌ "申请未通过"
            底部：[❤ 收藏] [查看其他职位]
   ```

4. **分享功能**
   - 微信分享：调用 `onShareAppMessage`（已有）
   - 图片卡片：使用 Canvas 或 `wx.canvasToTempFilePath` 生成职位信息卡片，保存到相册

### 任务 2：职位列表筛选优化

**涉及文件：**
- `miniprogram/pages/job_list/job_list.wxml` — 筛选按钮文字绑定
- `miniprogram/pages/job_list/job_list.js` — 数据联动

**改动要点：**
- 城市按钮文字：默认"城市"，选中后显示城市名（如"北京"），选"全部"恢复"城市"
- 岗位按钮文字：默认"岗位"，选中后显示岗位名（如"前端开发"），选"全部"恢复"岗位"

### 任务 3：申请门槛

**涉及文件：**
- `miniprogram/pages/job_detail/job_detail.js` — 申请前检查逻辑
- `cloudfunctions/applyJob/index.js` — 服务端校验资料完善度
- `miniprogram/pages/post_job/post_job.wxml` — 新增期望专业/年级表单
- `miniprogram/pages/post_job/post_job.js` — 新增字段
- `cloudfunctions/postJob/index.js` — 存储新字段

**改动要点：**

3a. 资料完善度硬门槛
- 定义"完善"标准：nickName 非空 + profile.student.department 非空 + profile.student.major 非空
- 前端申请时先调用 getUserProfile 检查，不完善则弹窗引导去编辑资料
- 后端 applyJob 也做同样校验，双重保障

3b. 校友期望条件软提醒
- postJob 表单新增可选字段：`expectedMajors`（期望专业，多选）、`minGrade`（最低年级）
- 学生申请时，前端对比自己的专业/年级与岗位期望条件
- 不匹配时弹出提醒："该职位期望 XX 专业同学，您的专业为 YY，仍可申请但通过率可能较低"
- 学生确认后可继续申请

### 任务 4：getJobDetail 云函数适配

**涉及文件：**
- `cloudfunctions/getJobDetail/index.js` — 返回申请状态和敏感字段

**改动要点：**
- 根据 OPENID 查询当前用户对该职位的申请状态
- 申请状态为 `accepted` 时才返回 `referralCode`、`contactWechat`、`jobLink`
- 其他状态时这些字段返回空值或 null

---

## 实施顺序

1. 任务 4（云函数适配）— 后端先行，保证数据接口正确
2. 任务 1（职位详情页改版）— 核心页面改造
3. 任务 2（筛选优化）— 小改动
4. 任务 3（申请门槛）— 依赖任务 1 完成

## 注意事项

- 改版后的页面需要保持 TDesign 组件库的使用风格
- 所有新文案使用中文
- 敏感字段保护仅在后端 getJobDetail 中实现，前端不额外做判断
- initJobs 种子数据已包含 description、requirements、recommenderComment 字段，无需修改
