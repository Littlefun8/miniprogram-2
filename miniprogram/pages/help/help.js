// help.js
Page({
  data: {
    faqs: [
      { q: '如何发布职位？', a: '校友或老师登录后，在首页点击发布按钮，填写职位信息并提交。提交后需等待教师审核通过后才会公开展示。', open: false },
      { q: '如何申请职位？', a: '在职位列表或详情页点击申请按钮即可。申请后可在"进度"Tab 查看申请状态。通过后可查看内推码和联系方式。', open: false },
      { q: '如何审核职位？', a: '教师登录后，在"我的"页面点击"我的发布"进入审核页面，可对待审核职位进行通过或拒绝操作。', open: false },
      { q: '角色可以更改吗？', a: '角色一旦选择不可更改。请在首次登录时谨慎选择身份（校友/老师/学生）。', open: false },
      { q: '内推码如何使用？', a: '申请通过后，在职位详情页或申请进度页可查看内推码和校友联系方式。点击可一键复制。', open: false }
    ]
  },

  onToggle(e) {
    const idx = e.currentTarget.dataset.idx
    this.setData({ [`faqs[${idx}].open`]: !this.data.faqs[idx].open })
  }
})
