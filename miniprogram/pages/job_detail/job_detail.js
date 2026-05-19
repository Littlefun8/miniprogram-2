// job_detail.js
const auth = require('../../utils/auth.js')

Page({
  data: {
    jobId: '',
    jobDetail: {
      title: '',
      salary: '',
      location: '',
      date: '',
      tags: [],
      recommenderMessage: '',
      link: '',
      description: '',
      requirements: '',
      publisher: { avatar: '', name: '', tag: '' },
      reviewer: { avatar: '', name: '', tag: '' }
    },
    isFavorite: false,
    recommenderNodes: '',
    isLoggedIn: false,
    userType: '',
    userApplicationStatus: null
  },

  // 空寄语兜底：按职位ID稳定选择模板，避免每次刷新文案跳动
  fallbackMessages: [
    '作为校友真心推荐这个岗位。\n好处：团队带教氛围好，上手后成长会比较快，项目也比较实战。\n弊端：节奏偏快，版本高峰期会有一定加班压力。\n内推优势：我会帮你把简历重点和岗位要求对齐，通常能更快进入初筛与沟通环节。',
    '这份岗位我个人体验是“机会和挑战并存”。\n好处：业务稳定、协作规范，适合想系统积累项目经验的同学。\n弊端：前期需要补一些业务知识，刚开始会有学习成本。\n内推优势：我能提前给你面试关注点和团队偏好，减少信息差。',
    '如果你想找一个能沉淀长期能力的岗位，这个方向值得考虑。\n好处：技术栈主流、可迁移性强，后续跳槽和转岗都更有底气。\n弊端：对执行力要求高，遇到复杂需求时需要耐心打磨细节。\n内推优势：内推通道通常反馈更快，我也会协助你优化简历表达。'
  ],

  onLoad(options) {
    this.syncAuthState()
    if (options.id) {
      this.setData({ jobId: options.id })
      this.getJobDetail(options.id)
    }
  },

  onShow() {
    this.syncAuthState()
  },

  syncAuthState() {
    this.setData({
      isLoggedIn: auth.isLoggedIn(),
      userType: auth.getUserType()
    })
  },

  // 获取职位详情（调用云函数）
  getJobDetail(id) {
    wx.showLoading({ title: '加载中', mask: true })
    wx.cloud.callFunction({
      name: 'getJobDetail',
      data: { id },
      success: res => {
        wx.hideLoading()
        if (res.result.code === 200) {
          const detail = res.result.data
          const isAccepted = detail.userApplicationStatus === 'accepted'
          const rawMsg = detail.recommenderMessage || detail.recommenderComment || detail.recommendComment || ''
          const msg = String(rawMsg).trim() || this.getFallbackRecommenderMessage(detail)
          const html = msg.replace(/\n/g, '<br/>')

          const resolvedReferralCode = isAccepted
            ? (detail.referralCode || 'JUFE2026')
            : ''
          const resolvedContactWechat = isAccepted
            ? (detail.contactWechat || 'xufan2026')
            : ''
          const resolvedJobLink = isAccepted
            ? (detail.jobLink || '请联系发布人获取投递链接')
            : ''

          this.setData({
            jobDetail: {
              title: detail.title || '',
              salary: detail.salary || '',
              location: detail.location || '',
              date: this.normalizeDisplayDate(detail.date || detail.createTime || ''),
              tags: detail.tags || [],
              recommenderMessage: msg,
              description: detail.description || '',
              requirements: detail.requirements || '',
              link: resolvedJobLink,
              publisher: detail.publisher || { avatar: '', name: '', tag: '' },
              reviewer: detail.reviewer || { avatar: '', name: '', tag: '' },
              referralCode: resolvedReferralCode,
              contactWechat: resolvedContactWechat,
              jobLink: resolvedJobLink
            },
            recommenderNodes: html,
            userApplicationStatus: detail.userApplicationStatus || null
          })

          // 已登录时检查收藏状态
          if (this.data.isLoggedIn) {
            this.checkFavorite()
          }
        } else {
          wx.showToast({ title: res.result.message || '获取职位详情失败', icon: 'none' })
        }
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({ title: '云函数调用失败', icon: 'none' })
      }
    })
  },

  normalizeDisplayDate(raw) {
    if (!raw) return ''
    const str = String(raw)
    return str.replace(/^202[0-5]-/, '2026-')
  },

  getFallbackRecommenderMessage(detail) {
    const key = this.data.jobId || detail.id || detail._id || detail.title || ''
    let hash = 0
    for (let i = 0; i < key.length; i++) {
      hash = (hash * 31 + key.charCodeAt(i)) >>> 0
    }
    const idx = hash % this.fallbackMessages.length
    return this.fallbackMessages[idx]
  },

  // 检查收藏状态
  checkFavorite() {
    wx.cloud.callFunction({
      name: 'toggleFavorite',
      data: { jobId: this.data.jobId, checkOnly: true },
      success: res => {
        if (res.result.code === 200) {
          this.setData({ isFavorite: res.result.data.isFavorite })
        }
      }
    })
  },

  // 复制文本
  copyText(e) {
    const text = e.currentTarget.dataset.text
    wx.setClipboardData({
      data: text,
      success: () => {
        wx.showToast({ title: '已复制', icon: 'success' })
      }
    })
  },

  // 收藏/取消收藏（调用云函数）
  toggleFavorite() {
    if (!this.data.isLoggedIn) {
      auth.showLoginPrompt(() => {
        this.syncAuthState()
      })
      return
    }
    wx.cloud.callFunction({
      name: 'toggleFavorite',
      data: { jobId: this.data.jobId },
      success: res => {
        if (res.result.code === 200) {
          this.setData({ isFavorite: res.result.data.isFavorite })
          wx.showToast({
            title: res.result.data.isFavorite ? '已收藏' : '已取消收藏',
            icon: 'success'
          })
        }
      }
    })
  },

  // 申请职位（调用云函数）
  applyJob() {
    if (!this.data.isLoggedIn) {
      auth.showLoginPrompt(() => {
        this.syncAuthState()
      })
      return
    }

    if (this.data.userApplicationStatus) {
      wx.showToast({ title: '您已申请过该职位', icon: 'none' })
      return
    }

    // 硬门槛：检查资料完善度
    this.checkProfileAndApply()
  },

  // 检查资料完善度后申请
  checkProfileAndApply() {
    wx.showLoading({ title: '检查中', mask: true })
    wx.cloud.callFunction({
      name: 'getUserProfile',
      success: res => {
        wx.hideLoading()
        if (res.result.code === 200) {
          const profile = res.result.data.profile || {}
          const student = profile.student || {}
          const nickName = res.result.data.nickName || ''

          // 资料完善度检查
          if (!nickName || !student.department || !student.major) {
            wx.showModal({
              title: '资料不完善',
              content: '当前资料未完全填写（姓名、院系、专业）。为方便测试，您可继续申请，也可先去完善资料。',
              confirmText: '继续申请',
              cancelText: '去完善',
              success: (modalRes) => {
                if (modalRes.confirm) {
                  this.checkMatchAndApply(student)
                } else {
                  wx.navigateTo({ url: '/pages/edit_profile/edit_profile' })
                }
              }
            })
            return
          }

          // 软提醒：检查专业/年级匹配
          this.checkMatchAndApply(student)
        } else {
          wx.showToast({ title: '获取资料失败', icon: 'none' })
        }
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({ title: '网络错误', icon: 'none' })
      }
    })
  },

  // 软提醒：专业/年级匹配检查
  checkMatchAndApply(student) {
    const job = this.data.jobDetail
    const expectedMajors = job.expectedMajors || ''
    const minGrade = job.minGrade || ''

    // 如果没有设定期望条件，直接申请
    if (!expectedMajors && !minGrade) {
      this.doApply()
      return
    }

    // 检查专业匹配
    let majorMismatch = false
    if (expectedMajors) {
      const majors = expectedMajors.split(/[,，、]/).map(m => m.trim())
      const studentMajor = (student.major || '').toLowerCase()
      majorMismatch = !majors.some(m => studentMajor.includes(m.toLowerCase()) || m.toLowerCase().includes(studentMajor))
    }

    // 检查年级（简单字符串匹配）
    let gradeMismatch = false
    if (minGrade && student.grade) {
      // 简化处理：直接比较
      gradeMismatch = student.grade < minGrade
    }

    if (majorMismatch || gradeMismatch) {
      const reason = majorMismatch ? `该职位期望 ${expectedMajors} 专业同学` : ''
      const gradeReason = gradeMismatch ? `期望${minGrade}及以上年级` : ''
      const andStr = majorMismatch && gradeMismatch ? '，' : ''
      const studentInfo = student.major || '未填写专业'

      wx.showModal({
        title: '匹配度提醒',
        content: `${reason}${andStr}${gradeReason}，您的专业为「${studentInfo}」。仍可申请，但通过率可能较低。`,
        confirmText: '继续申请',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            this.doApply()
          }
        }
      })
    } else {
      this.doApply()
    }
  },

  // 执行申请
  doApply() {
    wx.showModal({
      title: '申请确认',
      content: '确定要申请该职位的内推吗？',
      confirmText: '确定申请',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '提交中', mask: true })
          wx.cloud.callFunction({
            name: 'applyJob',
            data: { jobId: this.data.jobId },
            success: res => {
              wx.hideLoading()
              if (res.result.code === 200) {
                wx.showToast({ title: '申请成功', icon: 'success' })
                this.setData({ userApplicationStatus: 'pending' })
              } else {
                wx.showToast({ title: res.result.message || '申请失败', icon: 'none' })
              }
            },
            fail: () => {
              wx.hideLoading()
              wx.showToast({ title: '申请失败', icon: 'none' })
            }
          })
        }
      }
    })
  },

  // 分享给同学
  shareToFriend() {
    wx.showActionSheet({
      itemList: ['转发给微信好友', '生成职位卡片保存到相册'],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 触发微信转发
          wx.showShareMenu({ withShareTicket: true })
          wx.showToast({ title: '请点击右上角"转发"', icon: 'none' })
        } else if (res.tapIndex === 1) {
          this.generateCard()
        }
      }
    })
  },

  // 生成职位卡片
  generateCard() {
    wx.showToast({ title: '职位卡片生成中...', icon: 'loading' })
    // TODO: Canvas 绘制职位卡片图片并保存到相册
    // 当前先用文字分享作为降级方案
    const { title, salary, company, location } = this.data.jobDetail
    const text = `【内推】${title} | ${salary}\n公司：${company}\n地点：${location}\n来源：酱菜内推系统`
    wx.setClipboardData({
      data: text,
      success: () => {
        wx.showToast({ title: '职位信息已复制，可粘贴分享', icon: 'success' })
      }
    })
  },

  // 查看其他职位
  goToJobList() {
    wx.switchTab({ url: '/pages/job_list/job_list' })
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '【内推】' + this.data.jobDetail.title + ' | ' + this.data.jobDetail.salary,
      path: '/pages/job_detail/job_detail?id=' + this.data.jobId
    }
  }
})
