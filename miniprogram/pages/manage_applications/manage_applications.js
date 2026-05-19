// manage_applications.js - 校友查看收到的申请并处理
const auth = require('../../utils/auth.js')

Page({
  data: {
    applications: [],
    isLoading: false,
    noMoreData: false,
    expandedApplicationId: ''
  },

  onLoad() {
    if (wx.hideHomeButton) wx.hideHomeButton()
    if (!auth.isLoggedIn()) {
      auth.showLoginPrompt(() => {
        this.loadApplications()
      })
      return
    }

    const userType = auth.getUserType()
    if (userType !== 'alumni') {
      wx.showModal({
        title: '提示',
        content: '仅校友可访问申请审核页面',
        showCancel: false,
        success: () => wx.switchTab({ url: '/pages/user_profile/user_profile' })
      })
      return
    }
    this.loadApplications()
  },

  onShow() {
    if (wx.hideHomeButton) wx.hideHomeButton()
  },

  onPullDownRefresh() {
    this.setData({ applications: [], noMoreData: false })
    this.loadApplications()
    wx.stopPullDownRefresh()
  },

  // 加载收到的申请
  loadApplications() {
    if (this.data.isLoading) return
    this.setData({ isLoading: true })

    wx.cloud.callFunction({
      name: 'getApplications',
      data: {
        status: 'all',
        asPublisher: true,
        pageNum: 1,
        pageSize: 20
      },
      success: res => {
        if (res.result.code === 200) {
          const actionable = (res.result.data || [])
            .filter(item => item.status === 'pending' || item.status === 'processing')
            .map(item => this.normalizeApplication(item))

          this.setData({
            applications: actionable,
            isLoading: false,
            noMoreData: actionable.length === 0
          })
        } else {
          this.setData({ isLoading: false })
        }
      },
      fail: () => {
        this.setData({ isLoading: false })
        wx.showToast({ title: '加载失败', icon: 'none' })
      }
    })
  },

  normalizeApplication(item) {
    const profile = item.applicantProfile || {}
    const resume = item.resumeSnapshot || {}

    const applicantName = item.applicantName || resume.name || resume.realName || this.maskOpenid(item.userId)

    return {
      ...item,
      applicantName,
      applicantSchool: profile.school || resume.school || resume.university || '',
      applicantMajor: profile.major || resume.major || '',
      applicantGrade: profile.grade || resume.grade || '',
      applicantPhone: resume.phone || resume.mobile || '',
      applicantEmail: resume.email || '',
      applicantBio: profile.bio || resume.bio || resume.introduction || ''
    }
  },

  maskOpenid(openid) {
    if (!openid || typeof openid !== 'string') return '未命名申请人'
    if (openid.length <= 8) return openid
    return `${openid.slice(0, 4)}****${openid.slice(-4)}`
  },

  onToggleApplicantDetail(e) {
    const appId = e.currentTarget.dataset.id
    this.setData({
      expandedApplicationId: this.data.expandedApplicationId === appId ? '' : appId
    })
  },

  // 开始处理申请
  onProcess(e) {
    const app = e.currentTarget.dataset.app
    wx.cloud.callFunction({
      name: 'updateApplicationStatus',
      data: {
        applicationId: app._id,
        status: 'processing'
      },
      success: res => {
        if (res.result.code === 200) {
          wx.showToast({ title: '已开始处理', icon: 'success' })
          this.setData({ applications: [], noMoreData: false })
          this.loadApplications()
        } else {
          wx.showToast({ title: res.result.message, icon: 'none' })
        }
      },
      fail: () => {
        wx.showToast({ title: '操作失败', icon: 'none' })
      }
    })
  },

  // 通过申请
  onAccept(e) {
    const app = e.currentTarget.dataset.app
    wx.showModal({
      title: '确认通过',
      content: `确定通过该申请吗？通过后学生将看到内推码和联系方式。`,
      success: res => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中' })
          wx.cloud.callFunction({
            name: 'updateApplicationStatus',
            data: { applicationId: app._id, status: 'accepted' },
            success: res => {
              wx.hideLoading()
              if (res.result.code === 200) {
                wx.showToast({ title: '已通过', icon: 'success' })
                this.setData({ applications: [], noMoreData: false })
                this.loadApplications()
              } else {
                wx.showToast({ title: res.result.message, icon: 'none' })
              }
            },
            fail: () => {
              wx.hideLoading()
              wx.showToast({ title: '操作失败', icon: 'none' })
            }
          })
        }
      }
    })
  },

  // 拒绝申请
  onReject(e) {
    const app = e.currentTarget.dataset.app
    const that = this
    wx.showModal({
      title: '拒绝申请',
      content: '请输入拒绝原因',
      editable: true,
      placeholderText: '请输入拒绝原因',
      success: res => {
        if (res.confirm && res.content) {
          wx.showLoading({ title: '处理中' })
          wx.cloud.callFunction({
            name: 'updateApplicationStatus',
            data: {
              applicationId: app._id,
              status: 'rejected',
              remark: res.content
            },
            success: res => {
              wx.hideLoading()
              if (res.result.code === 200) {
                wx.showToast({ title: '已拒绝', icon: 'success' })
                that.setData({ applications: [], noMoreData: false })
                that.loadApplications()
              } else {
                wx.showToast({ title: res.result.message, icon: 'none' })
              }
            },
            fail: () => {
              wx.hideLoading()
              wx.showToast({ title: '操作失败', icon: 'none' })
            }
          })
        } else if (res.confirm && !res.content) {
          wx.showToast({ title: '请填写拒绝原因', icon: 'none' })
        }
      }
    })
  },

  // 查看申请详情（跳转职位详情）
  onViewJob(e) {
    const jobId = e.currentTarget.dataset.jobid
    if (jobId) {
      wx.navigateTo({ url: '/pages/job_detail/job_detail?id=' + jobId })
    }
  }
})
