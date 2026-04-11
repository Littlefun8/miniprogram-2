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
      publisher: { avatar: '', name: '', tag: '' },
      reviewer: { avatar: '', name: '', tag: '' },
      association: { teacher: '', students: [] }
    },
    filteredStudents: [],
    qrCodeUrl: '',
    isFavorite: false,
    showAssociation: false,
    showScreenshotInfo: false,
    screenshotUser: { name: '', id: '' },
    screenshotInfo: { time: '' },
    recommenderNodes: '',
    isLoggedIn: false,
    userType: '',
    userApplicationStatus: null
  },

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
    const userInfo = auth.getUserInfo()
    this.setData({
      isLoggedIn: auth.isLoggedIn(),
      userType: auth.getUserType(),
      'screenshotUser.name': userInfo.nickName || ''
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
          // 处理内推者想说内容为 rich-text nodes
          const msg = detail.recommenderMessage || detail.recommenderComment || ''
          const html = msg.replace(/\n/g, '<br/>')

          const jobId = id || '1'
          const displayJobId = 'JOB-' + String(jobId).padStart(4, '0')

          this.setData({
            jobDetail: {
              title: detail.title || '',
              salary: detail.salary || '',
              location: detail.location || '',
              date: detail.date || detail.createTime || '',
              tags: detail.tags || [],
              recommenderMessage: msg,
              link: detail.jobLink || '',
              publisher: detail.publisher || { avatar: '', name: '', tag: '' },
              reviewer: detail.reviewer || { avatar: '', name: '', tag: '' },
              association: detail.association || { teacher: '', students: [] },
              referralCode: detail.referralCode || '',
              contactWechat: detail.contactWechat || ''
            },
            recommenderNodes: html,
            userApplicationStatus: detail.userApplicationStatus || null,
            screenshotInfo: Object.assign({}, this.data.screenshotInfo, { jobId: displayJobId })
          })
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

  // 复制链接
  copyLink() {
    wx.setClipboardData({
      data: this.data.jobDetail.link,
      success: () => {
        wx.showToast({ title: '链接已复制', icon: 'success' })
      }
    })
  },

  // 展开关联信息
  expandAssociation() {
    if (!this.data.isLoggedIn) {
      auth.showLoginPrompt(() => {
        this.syncAuthState()
        this.expandAssociation()
      })
      return
    }

    this.filterStudentsByUserType()

    this.setData({ showAssociation: true })
    setTimeout(() => {
      wx.createSelectorQuery().select('.container').boundingClientRect(rect => {
        if (rect) {
          wx.pageScrollTo({ scrollTop: rect.height, duration: 300 })
        }
      }).exec()
    }, 100)

    wx.cloud.callFunction({
      name: 'recordUserAction',
      data: { jobId: this.data.jobId, actionType: 'expandAssociation' }
    })
    wx.showToast({ title: '关联信息已展示', icon: 'success' })
  },

  // 根据用户身份过滤学生信息
  filterStudentsByUserType() {
    const userType = this.data.userType
    const currentUserName = this.data.screenshotUser.name
    let filteredStudents = []
    const students = this.data.jobDetail.association.students || []

    if (userType === 'alumni' || userType === 'teacher') {
      filteredStudents = students
    } else if (userType === 'student') {
      filteredStudents = students.filter(s => s.name === currentUserName)
    }
    this.setData({ filteredStudents })
  },

  // 一键保存
  saveAllInfo() {
    if (!this.data.isLoggedIn) {
      auth.showLoginPrompt(() => {
        this.syncAuthState()
        this.saveAllInfo()
      })
      return
    }
    const { name, id } = this.data.screenshotUser
    const now = new Date()
    const time = `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
    const jobId = this.data.jobId || '1'
    const displayJobId = 'JOB-' + String(jobId).padStart(4, '0')

    this.setData({
      screenshotUser: { name, id },
      screenshotInfo: { time, jobId: displayJobId },
      showScreenshotInfo: true
    })

    setTimeout(() => {
      wx.createSelectorQuery().select('.container').boundingClientRect(rect => {
        if (rect) {
          wx.pageScrollTo({ scrollTop: rect.height, duration: 300 })
        }
      }).exec()
    }, 100)

    setTimeout(() => {
      wx.showToast({ title: '已保存至相册', icon: 'success' })
      wx.cloud.callFunction({
        name: 'recordUserAction',
        data: { jobId, actionType: 'saveAllInfo' }
      })
    }, 500)
  },

  // 判断是否已登录
  checkLoginState() {
    return auth.isLoggedIn()
  },

  // 收藏/取消收藏
  toggleFavorite() {
    const isFavorite = !this.data.isFavorite
    this.setData({ isFavorite })
    wx.showToast({
      title: isFavorite ? '已收藏' : '已取消收藏',
      icon: 'success'
    })
  },

  // 申请职位（调用云函数）
  applyJob() {
    if (!this.checkLoginState()) {
      auth.showLoginPrompt(() => {
        this.syncAuthState()
        this.applyJob()
      })
      return
    }

    // 如果已申请过
    if (this.data.userApplicationStatus) {
      wx.showToast({ title: '您已申请过该职位', icon: 'none' })
      return
    }

    wx.showModal({
      title: '申请确认',
      content: '确定要申请该职位吗？',
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

  // 分享
  onShareAppMessage() {
    return {
      title: this.data.jobDetail.title,
      path: '/pages/job_detail/job_detail?id=' + this.data.jobId,
      imageUrl: this.data.qrCodeUrl || ''
    }
  }
})
