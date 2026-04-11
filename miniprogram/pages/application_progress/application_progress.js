// application_progress.js
const auth = require('../../utils/auth.js')

Page({
  data: {
    activeTab: 'all',
    sliderLeft: 0,
    sliderWidth: 0,
    applications: [],
    isLoading: false,
    noMoreData: false,
    pageNum: 1,
    isLoggedIn: false,
    userType: '',
    userInfo: {}
  },

  onLoad() {
    this.syncAuthState()
    this.getSystemInfo()
    if (this.data.isLoggedIn) {
      this.loadApplications()
    }
  },

  onShow() {
    this.syncAuthState()
    if (this.data.isLoggedIn) {
      this.loadApplications()
    }
  },

  syncAuthState() {
    const userInfo = auth.getUserInfo()
    this.setData({
      isLoggedIn: auth.isLoggedIn(),
      userType: auth.getUserType(),
      userInfo
    })
  },

  getSystemInfo() {
    wx.getSystemInfo({
      success: (res) => {
        const screenWidth = res.windowWidth
        const tabCount = 4
        const sliderWidth = screenWidth / tabCount
        this.setData({ sliderWidth })
        this.updateSliderPosition(this.data.activeTab)
      }
    })
  },

  updateSliderPosition(tab) {
    const tabIndex = { all: 0, pending: 1, processing: 2, completed: 3 }[tab]
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

    wx.cloud.callFunction({
      name: 'getApplications',
      data: {
        status: this.data.activeTab,
        pageNum: this.data.pageNum,
        pageSize: 10
      },
      success: res => {
        if (res.result.code === 200) {
          const newApps = res.result.data
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

  onApplicationTap(e) {
    const id = e.currentTarget.dataset.id
    console.log('Application tapped:', id)
  },

  onViewDetailTap(e) {
    if (!this.data.isLoggedIn) {
      auth.showLoginPrompt(() => {
        this.syncAuthState()
        this.onViewDetailTap(e)
      })
      return
    }
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/job_detail/job_detail?id=${id}`
    })
  },

  onBrowseJobsTap() {
    wx.switchTab({ url: '/pages/job_list/job_list' })
  },

  // 复制内推码
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

  // 复制校友联系方式
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
