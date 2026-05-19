// application_progress.js
const auth = require('../../utils/auth.js')

Page({
  data: {
    activeTab: 'all',
    tabs: [],
    sliderLeft: 0,
    sliderWidth: 0,
    applications: [],
    isLoading: false,
    noMoreData: false,
    pageNum: 1,
    isLoggedIn: false,
    userType: '',
    userInfo: {},
    isReviewer: false
  },

  onLoad() {
    this.syncAuthState()
    if (this.routeRoleToReviewPage()) return
    this.configureTabs()
    this.setNavigationTitle()
    this.getSystemInfo()
    if (this.data.isLoggedIn) {
      this.loadApplications()
    }
  },

  onShow() {
    this.syncAuthState()
    if (this.routeRoleToReviewPage()) return
    this.configureTabs()
    this.setNavigationTitle()
    if (this.data.isLoggedIn) {
      this.loadApplications()
    }
  },

  routeRoleToReviewPage() {
    if (!this.data.isLoggedIn) return false
    if (this.data.userType === 'teacher' || this.data.userType === 'admin') {
      wx.redirectTo({ url: '/pages/audit_job/audit_job' })
      return true
    }

    if (this.data.userType === 'alumni') {
      wx.redirectTo({ url: '/pages/manage_applications/manage_applications' })
      return true
    }

    return false
  },

  syncAuthState() {
    const userInfo = auth.getUserInfo()
    const userType = auth.getUserType()
    this.setData({
      isLoggedIn: auth.isLoggedIn(),
      userType,
      userInfo,
      isReviewer: false
    })
  },

  setNavigationTitle() {
    wx.setNavigationBarTitle({ title: '申请进度' })
  },

  configureTabs() {
    const tabs = [
      { key: 'all', label: '全部' },
      { key: 'processing', label: '处理中' },
      { key: 'completed', label: '已完成' }
    ]

    const defaultTab = 'all'
    const valid = tabs.some(t => t.key === this.data.activeTab)
    this.setData({
      tabs,
      activeTab: valid ? this.data.activeTab : defaultTab,
      applications: [],
      noMoreData: false,
      pageNum: 1
    })
    this.getSystemInfo()
  },

  getSystemInfo() {
    wx.getSystemInfo({
      success: (res) => {
        const screenWidth = res.windowWidth
        const tabCount = this.data.tabs.length || 1
        const sliderWidth = screenWidth / tabCount
        this.setData({ sliderWidth })
        this.updateSliderPosition(this.data.activeTab)
      }
    })
  },

  updateSliderPosition(tab) {
    const idx = this.data.tabs.findIndex(t => t.key === tab)
    const tabIndex = idx < 0 ? 0 : idx
    this.setData({ sliderLeft: this.data.sliderWidth * tabIndex })
  },

  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({
      activeTab: tab,
      applications: [],
      noMoreData: false,
      pageNum: 1
    })
    this.updateSliderPosition(tab)
    this.loadApplications()
  },

  loadApplications() {
    if (this.data.isLoading || this.data.noMoreData) return
    this.setData({ isLoading: true })

    const queryStatus = this.data.activeTab === 'completed' ? 'all' : this.data.activeTab
    const asPublisher = false
    const ensureDemoCases = this.data.userType === 'student' && this.data.activeTab === 'all' && this.data.pageNum === 1

    wx.cloud.callFunction({
      name: 'getApplications',
      data: {
        status: queryStatus,
        asPublisher,
        ensureDemoCases,
        pageNum: this.data.pageNum,
        pageSize: 10
      },
      success: res => {
        if (res.result.code === 200) {
          let newApps = this.mapApplications(res.result.data || [])

          if (this.data.activeTab === 'completed') {
            newApps = newApps.filter(app => app.status === 'completed')
          }

          const allApps = this.data.pageNum === 1
            ? newApps
            : this.data.applications.concat(newApps)
          this.setData({
            applications: allApps,
            isLoading: false,
            noMoreData: !res.result.hasMore
          })
        } else {
          this.setData({ isLoading: false })
          wx.showToast({ title: '获取进度失败', icon: 'none' })
        }
      },
      fail: () => {
        this.setData({ isLoading: false })
        wx.showToast({ title: '云函数调用失败', icon: 'none' })
      }
    })
  },

  mapApplications(applications) {
    return applications.map(item => this.mapStudentApplication(item))
  },

  mapReviewerApplication(item) {
    const rawStatus = item.status || 'pending'
    const isAccepted = rawStatus === 'accepted'
    const isRejected = rawStatus === 'rejected'
    const isProcessing = rawStatus === 'processing'

    const status = (isAccepted || isRejected) ? 'completed' : rawStatus
    const statusTextMap = {
      pending: '待处理',
      processing: '处理中',
      completed: isAccepted ? '已通过' : (isRejected ? '未通过' : '已完成')
    }

    const applyTime = this.pickTimelineTime(item.timeline, ['pending']) || this.formatTime(item.applyDate)
    const processingTime = this.pickTimelineTime(item.timeline, ['processing']) || (isProcessing || isAccepted || isRejected ? this.formatTime(item.updateTime) : '')
    const finalTime = this.pickTimelineTime(item.timeline, ['accepted', 'rejected']) || (isAccepted || isRejected ? this.formatTime(item.updateTime) : '')

    return {
      id: item._id,
      jobId: item.jobId,
      jobTitle: (item.jobSnapshot && item.jobSnapshot.title) || '职位信息',
      company: (item.jobSnapshot && item.jobSnapshot.company) || '-',
      applicantText: this.maskOpenid(item.userId),
      applyDate: applyTime,
      status,
      statusClass: isRejected ? 'completed-failed' : (isAccepted ? 'completed-success' : ''),
      statusText: statusTextMap[status] || '待处理',
      timeline: [
        { title: '收到申请', time: applyTime || '等待中', state: 'done' },
        { title: '校友处理', time: processingTime || '等待中', state: (isProcessing || isAccepted || isRejected) ? 'done' : 'wait' },
        {
          title: isAccepted ? '已通过' : (isRejected ? '未通过' : '处理结果'),
          time: (isAccepted || isRejected) ? (finalTime || '等待中') : '等待中',
          state: isAccepted ? 'passed' : (isRejected ? 'failed' : 'wait')
        }
      ],
      progress1: true,
      progress2: isAccepted || isRejected,
      progress2State: isAccepted ? 'passed' : (isRejected ? 'failed' : 'wait'),
      canProcess: rawStatus === 'pending',
      canAcceptReject: rawStatus === 'processing',
      remark: item.remark || ''
    }
  },

  mapStudentApplication(item) {
    const rawStatus = item.status || 'pending'
    const isAccepted = rawStatus === 'accepted'
    const isRejected = rawStatus === 'rejected'
    const isProcessing = rawStatus === 'processing'
    const isPending = rawStatus === 'pending'

    const status = (isAccepted || isRejected) ? 'completed' : (isPending || isProcessing ? 'processing' : rawStatus)
    const statusTextMap = {
      pending: '待处理',
      processing: '处理中',
      completed: isAccepted ? '已完成' : (isRejected ? '未通过' : '已完成')
    }

    const applyTime = this.pickTimelineTime(item.timeline, ['pending']) || this.formatTime(item.applyDate)
    const processingTime = this.pickTimelineTime(item.timeline, ['processing']) || (isProcessing || isAccepted || isRejected ? this.formatTime(item.updateTime) : '')
    const finalTime = this.pickTimelineTime(item.timeline, ['accepted', 'rejected']) || (isAccepted || isRejected ? this.formatTime(item.updateTime) : '')

    const timeline = [
      {
        title: '提交申请',
        time: applyTime,
        state: 'done'
      },
      {
        title: '申请审核',
        time: processingTime || '等待中',
        state: (isProcessing || isAccepted || isRejected) ? 'done' : 'wait'
      },
      {
        title: isAccepted ? '已通过' : (isRejected ? '未通过' : '通过/不通过'),
        time: isAccepted || isRejected ? finalTime : '等待中',
        state: isAccepted ? 'passed' : (isRejected ? 'failed' : 'wait')
      }
    ]

    const showReferralInfo = isAccepted
    const referralContact = item.contactWechat || (isAccepted ? '微信：xufan2026' : '')
    const referralCode = item.referralCode || (isAccepted ? 'JUFE2026' : '')
    const referralLink = item.jobLink || ''

    return {
      id: item._id,
      jobId: item.jobId,
      jobTitle: (item.jobSnapshot && item.jobSnapshot.title) || '职位信息',
      company: (item.jobSnapshot && item.jobSnapshot.company) || '-',
      location: item.location || item.jobLocation || '-',
      applyDate: applyTime,
      status,
      statusClass: isRejected ? 'completed-failed' : (isAccepted ? 'completed-success' : ''),
      statusText: statusTextMap[status] || '待处理',
      timeline,
      progress1: true,
      progress2: isAccepted || isRejected,
      progress2State: isAccepted ? 'passed' : (isRejected ? 'failed' : 'wait'),
      showReferralInfo,
      referralInfo: isAccepted ? (item.referralInfo || '恭喜您获得内推资格！') : '',
      referralCode,
      referralContact,
      referralLink,
      remark: item.remark || ''
    }
  },

  maskOpenid(openid) {
    if (!openid || typeof openid !== 'string') return '学生用户'
    if (openid.length <= 8) return openid
    return `${openid.slice(0, 4)}****${openid.slice(-4)}`
  },

  pickTimelineTime(timeline, statusList) {
    if (!Array.isArray(timeline) || timeline.length === 0) return ''
    const match = timeline.find(node => statusList.includes(node.status))
    return match ? this.formatTime(match.time) : ''
  },

  formatTime(raw) {
    if (!raw) return ''
    if (typeof raw === 'string') return raw.replace('T', ' ').slice(0, 16)

    const date = raw instanceof Date ? raw : new Date(raw)
    if (Number.isNaN(date.getTime())) return ''

    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    const hh = String(date.getHours()).padStart(2, '0')
    const mm = String(date.getMinutes()).padStart(2, '0')
    return `${y}-${m}-${d} ${hh}:${mm}`
  },

  onApplicationTap() {},

  onViewDetailTap(e) {
    if (!this.data.isLoggedIn) {
      auth.showLoginPrompt(() => {
        this.syncAuthState()
        this.onViewDetailTap(e)
      })
      return
    }
    const jobId = e.currentTarget.dataset.jobid
    if (!jobId) return
    wx.navigateTo({
      url: `/pages/job_detail/job_detail?id=${jobId}`
    })
  },

  onStartReview(e) {
    const appId = e.currentTarget.dataset.id
    this.updateApplicationStatus(appId, 'processing', '', '已开始处理')
  },

  onAccept(e) {
    const appId = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认通过',
      content: '通过后学生将可查看内推相关信息，是否继续？',
      success: (res) => {
        if (res.confirm) {
          this.updateApplicationStatus(appId, 'accepted', '', '已通过')
        }
      }
    })
  },

  onReject(e) {
    const appId = e.currentTarget.dataset.id
    wx.showModal({
      title: '拒绝申请',
      content: '请输入拒绝原因',
      editable: true,
      placeholderText: '请输入拒绝原因',
      success: (res) => {
        if (!res.confirm) return
        const remark = (res.content || '').trim()
        if (!remark) {
          wx.showToast({ title: '请填写拒绝原因', icon: 'none' })
          return
        }
        this.updateApplicationStatus(appId, 'rejected', remark, '已拒绝')
      }
    })
  },

  updateApplicationStatus(applicationId, status, remark, successText) {
    if (!applicationId) return
    wx.showLoading({ title: '处理中' })
    wx.cloud.callFunction({
      name: 'updateApplicationStatus',
      data: {
        applicationId,
        status,
        remark
      },
      success: (res) => {
        wx.hideLoading()
        if (res.result && res.result.code === 200) {
          wx.showToast({ title: successText, icon: 'success' })
          this.setData({
            applications: [],
            noMoreData: false,
            pageNum: 1
          })
          this.loadApplications()
          return
        }
        wx.showToast({ title: (res.result && res.result.message) || '操作失败', icon: 'none' })
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({ title: '操作失败', icon: 'none' })
      }
    })
  },

  onBrowseJobsTap() {
    wx.switchTab({ url: '/pages/job_list/job_list' })
  },

  showLoginPrompt() {
    auth.showLoginPrompt(() => {
      this.syncAuthState()
      this.configureTabs()
      this.loadApplications()
    })
  },

  copyReferralCode(e) {
    if (!this.data.isLoggedIn) {
      auth.showLoginPrompt(() => {
        this.syncAuthState()
        this.copyReferralCode(e)
      })
      return
    }
    const code = e.currentTarget.dataset.code
    wx.setClipboardData({
      data: code,
      success: () => {
        wx.showToast({ title: '内推码已复制', icon: 'success' })
      }
    })
  },

  copyReferralContact(e) {
    if (!this.data.isLoggedIn) {
      auth.showLoginPrompt(() => {
        this.syncAuthState()
        this.copyReferralContact(e)
      })
      return
    }
    const contact = e.currentTarget.dataset.contact
    wx.setClipboardData({
      data: contact,
      success: () => {
        wx.showToast({ title: '联系方式已复制', icon: 'success' })
      }
    })
  },

  copyReferralLink(e) {
    if (!this.data.isLoggedIn) {
      auth.showLoginPrompt(() => {
        this.syncAuthState()
        this.copyReferralLink(e)
      })
      return
    }
    const link = e.currentTarget.dataset.link
    wx.setClipboardData({
      data: link,
      success: () => {
        wx.showToast({ title: '链接已复制', icon: 'success' })
      }
    })
  },

  onPullDownRefresh() {
    this.setData({
      applications: [],
      noMoreData: false,
      pageNum: 1
    })
    this.loadApplications()
    wx.stopPullDownRefresh()
  }
})
