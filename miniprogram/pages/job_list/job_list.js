// job_list.js
const auth = require('../../utils/auth.js')

Page({
  data: {
    searchValue: '',
    activeFilter: 'recommend',
    cityFilterVisible: false,
    jobTypeFilterVisible: false,
    selectedCity: '全部',
    selectedJobType: '全部',
    cityList: ['全部', '北京', '上海', '广州', '深圳', '杭州', '南京', '成都', '武汉', '西安'],
    jobTypeList: ['全部', '前端开发', '后端开发', '产品经理', '设计师', '测试工程师', '运维工程师', '数据分析师', '人工智能', '算法工程师'],
    isLoading: false,
    noMoreData: false,
    pageNum: 1,
    jobList: [],
    userType: '',
    isLoggedIn: false
  },

  onLoad() {
    this.syncAuthState()
    this.getJobList()
  },

  onPullDownRefresh() {
    this.refreshJobList()
  },

  onReachBottom() {
    this.loadMoreJobs()
  },

  // 同步本地登录状态
  syncAuthState() {
    this.setData({
      isLoggedIn: auth.isLoggedIn(),
      userType: auth.getUserType()
    })
  },

  // 获取职位列表（调用云函数）
  getJobList() {
    this.setData({ isLoading: true })
    wx.cloud.callFunction({
      name: 'getJobList',
      data: {
        pageNum: this.data.pageNum,
        pageSize: 20,
        keyword: this.data.searchValue,
        city: this.data.selectedCity,
        jobType: this.data.selectedJobType,
        sortBy: this.data.activeFilter === 'newest' ? 'newest' : 'recommend'
      },
      success: res => {
        if (res.result.code === 200) {
          const newJobs = res.result.data
          const allJobs = this.data.pageNum === 1 ? newJobs : this.data.jobList.concat(newJobs)
          this.setData({
            jobList: allJobs,
            isLoading: false,
            noMoreData: !res.result.hasMore
          })
        } else {
          this.setData({ isLoading: false })
          wx.showToast({ title: '获取职位失败', icon: 'none' })
        }
      },
      fail: () => {
        this.setData({ isLoading: false })
        wx.showToast({ title: '云函数调用失败', icon: 'none' })
      }
    })
  },

  refreshJobList() {
    this.setData({
      jobList: [],
      noMoreData: false,
      pageNum: 1
    })
    this.getJobList()
    wx.stopPullDownRefresh()
  },

  loadMoreJobs() {
    if (this.data.noMoreData || this.data.isLoading) return
    this.setData({ pageNum: this.data.pageNum + 1 })
    this.getJobList()
  },

  // 搜索
  onSearchChange(e) {
    this.setData({ searchValue: e.detail.value })
  },

  onSearchClear() {
    this.setData({ searchValue: '' })
    this.refreshJobList()
  },

  onSearchSubmit() {
    this.refreshJobList()
  },

  // 筛选
  onFilterTap(e) {
    const type = e.currentTarget.dataset.type
    this.setData({ activeFilter: type })
    this.refreshJobList()
  },

  onCityFilterTap() {
    this.setData({ cityFilterVisible: true })
  },

  onCityFilterClose() {
    this.setData({ cityFilterVisible: false })
  },

  onCitySelect(e) {
    const city = e.currentTarget.dataset.city
    this.setData({
      selectedCity: city,
      cityFilterVisible: false
    })
    this.refreshJobList()
  },

  onJobTypeFilterTap() {
    this.setData({ jobTypeFilterVisible: true })
  },

  onJobTypeFilterClose() {
    this.setData({ jobTypeFilterVisible: false })
  },

  onJobTypeSelect(e) {
    const jobType = e.currentTarget.dataset.jobType
    this.setData({
      selectedJobType: jobType,
      jobTypeFilterVisible: false
    })
    this.refreshJobList()
  },

  // 添加职位
  onAddJobTap() {
    if (!this.data.isLoggedIn) {
      auth.showLoginPrompt(() => {
        this.syncAuthState()
      })
      return
    }
    if (this.data.userType === 'alumni' || this.data.userType === 'teacher') {
      wx.navigateTo({ url: '/pages/post_job/post_job' })
    } else if (this.data.userType === 'student') {
      wx.showModal({
        title: '提示',
        content: '学生身份无法发布岗位，请切换为校友或老师后再试。',
        showCancel: false
      })
    }
  },

  onJobItemTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/job_detail/job_detail?id=' + id })
  },

  onJobDetailTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/job_detail/job_detail?id=' + id })
  },

  onScanQrcodeTap() {
    if (!this.data.isLoggedIn) {
      auth.showLoginPrompt(() => {
        this.syncAuthState()
      })
      return
    }
    wx.scanCode({
      onlyFromCamera: false,
      scanType: ['qrCode', 'barCode'],
      success: (res) => {
        wx.showModal({
          title: '扫码结果',
          content: res.result,
          showCancel: false
        })
      },
      fail: () => {
        wx.showToast({ title: '扫码失败', icon: 'none' })
      }
    })
  },

  onShow() {
    this.syncAuthState()
  }
})
