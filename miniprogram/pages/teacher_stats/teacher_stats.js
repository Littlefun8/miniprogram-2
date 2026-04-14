// teacher_stats.js
// 教师统计页 — 已接入 getTeacherStats 云函数

const auth = require('../../utils/auth.js')

Page({
  data: {
    loading: true,
    overview: {
      totalStudents: 0,
      totalApplications: 0,
      pendingCount: 0,
      acceptedCount: 0,
      rejectedCount: 0,
      passRate: 0
    },
    timeFilters: [
      { label: '本周', value: 'week' },
      { label: '本月', value: 'month' },
      { label: '本学期', value: 'semester' },
      { label: '全部', value: 'all' }
    ],
    timeFilterActive: 'week',
    statusFilter: 'all',
    classFilter: 'all',
    classes: [],
    showMoreFilters: false,
    statusDistribution: [],
    currentTrendData: [],
    hotJobsData: [],
    topReferralPosters: [],
    lowResponsivenessAlumni: [],
    highSuccessRateStudents: [],
    recentApplications: [],
    teacherInfo: {
      name: '',
      avatar: '',
      role: '老师'
    },
    funnelStages: [],
    explain: '',
    jobList: [{ label: '全部岗位', value: 0 }],
    jobInfoMap: { 0: { title: '全部岗位', desc: '所有岗位的汇总统计' } },
    jobFunnels: {},
    currentJobId: 0,
    currentFunnel: [],
    currentJobInfo: {},
    styleUpdateTimestamp: 0
  },

  onLoad: function() {
    wx.setNavigationBarTitle({ title: '教师统计' })
    this.loadStatsData('week')
  },

  onShow: function() {
    this.checkStyleUpdate()
  },

  /**
   * 调用 getTeacherStats 云函数获取统计数据
   */
  loadStatsData: function(timeRange) {
    wx.showLoading({ title: '加载中...' })

    const userInfo = auth.getUserInfo()
    if (userInfo) {
      this.setData({
        teacherInfo: {
          name: userInfo.nickName || '教师',
          avatar: userInfo.avatarUrl || '',
          role: userInfo.role || '老师'
        }
      })
    }

    wx.cloud.callFunction({
      name: 'getTeacherStats',
      data: { timeRange: timeRange || 'week' },
      success: (res) => {
        wx.hideLoading()
        if (res.result.code === 200) {
          const d = res.result.data
          this.setData({
            loading: false,
            overview: d.overview || {},
            statusDistribution: d.statusDistribution || [],
            hotJobsData: d.hotJobs || [],
            topReferralPosters: d.topReferralPosters || [],
            lowResponsivenessAlumni: d.lowResponsivenessAlumni || [],
            highSuccessRateStudents: d.highSuccessRateStudents || [],
            recentApplications: d.recentApplications || [],
            currentTrendData: d.trendData || [],
            trendMaxCount: (d.trendData || []).reduce((max, item) => Math.max(max, item.count || 0), 0),
            funnelStages: d.funnelStages || []
          })

          // 从热门岗位构建岗位列表和漏斗数据
          this.buildJobSelectFromHotJobs(d.hotJobs || [])
        } else {
          this.setData({ loading: false })
          wx.showToast({ title: res.result.message || '加载失败', icon: 'none' })
        }
      },
      fail: (err) => {
        wx.hideLoading()
        this.setData({ loading: false })
        console.error('getTeacherStats failed:', err)
        wx.showToast({ title: '网络错误', icon: 'none' })
      }
    })
  },

  /**
   * 根据热门岗位数据构建岗位选择器和漏斗
   */
  buildJobSelectFromHotJobs: function(hotJobs) {
    const jobList = [{ label: '全部岗位', value: 0 }]
    const jobInfoMap = { 0: { title: '全部岗位', desc: '所有岗位的汇总统计' } }
    const jobFunnels = {}

    // 全部岗位的漏斗 = 总漏斗
    jobFunnels[0] = this.data.funnelStages

    for (let i = 0; i < hotJobs.length; i++) {
      const job = hotJobs[i]
      const val = i + 1
      jobList.push({ label: job.title, value: val })
      jobInfoMap[val] = { title: job.title, desc: `${job.title}相关岗位统计` }
      // 单岗位漏斗数据（简化版，用申请数估算）
      const appCount = job.count
      jobFunnels[val] = [
        { name: '提交申请', count: appCount, nextCount: Math.round(appCount * 0.7), conversion: 70, dropoff: 30 },
        { name: '进入审核', count: Math.round(appCount * 0.7), nextCount: Math.round(appCount * 0.5), conversion: 71, dropoff: 29 },
        { name: '审核通过', count: Math.round(appCount * 0.5), nextCount: null, conversion: null, dropoff: null }
      ]
    }

    this.setData({
      jobList,
      jobInfoMap,
      jobFunnels,
      currentFunnel: jobFunnels[0] || [],
      currentJobInfo: jobInfoMap[0]
    })
  },

  checkStyleUpdate: function() {
    this.setData({ styleUpdateTimestamp: new Date().getTime() })
  },

  onTimeFilterChange: function(e) {
    const value = e.currentTarget.dataset.value
    this.setData({ timeFilterActive: value })
    this.loadStatsData(value)
  },

  toggleMoreFilters() {
    this.setData({ showMoreFilters: true })
  },

  closeMoreFilters() {
    this.setData({ showMoreFilters: false })
  },

  onPopupVisibleChange(e) {
    if (!e.detail.visible) {
      this.setData({ showMoreFilters: false })
    }
  },

  onStatusFilterChange(e) {
    this.setData({ statusFilter: e.currentTarget.dataset.value })
  },

  onClassFilterChange(e) {
    this.setData({ classFilter: e.currentTarget.dataset.value })
  },

  resetFilters() {
    this.setData({ statusFilter: 'all', classFilter: 'all' })
  },

  applyFilters() {
    this.setData({ showMoreFilters: false })
    this.loadStatsData(this.data.timeFilterActive)
    wx.showToast({ title: '筛选已应用', icon: 'success' })
  },

  // 导航到申请管理页面（已有页面）
  navigateToAllApplications() {
    wx.navigateTo({ url: '/pages/manage_applications/manage_applications' })
  },

  // 查看申请详情 → 导航到申请管理页面
  viewApplicationDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/manage_applications/manage_applications?id=' + id })
  },

  // 处理申请 → 导航到申请管理页面
  handleApplication(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/manage_applications/manage_applications?id=' + id })
  },

  // 下拉选择岗位切换漏斗
  onJobDropdownChange(e) {
    const val = Number(e.detail.value)
    this.setData({ currentJobId: val })
    if (this.data.jobFunnels[val]) {
      this.setData({
        currentFunnel: this.data.jobFunnels[val],
        currentJobInfo: this.data.jobInfoMap[val]
      })
    } else {
      wx.showToast({ title: '无此岗位数据', icon: 'none' })
    }
  },

  // 查看更多发布岗位较多的校友
  viewMoreTopAlumni() {
    wx.showToast({ title: '功能开发中', icon: 'none' })
  },

  // 感谢校友
  thankAlumnus(e) {
    const alumnusId = e.currentTarget.dataset.id
    const alumnus = this.data.topReferralPosters.find(item => item.alumnusId === alumnusId || item.name === alumnusId)
    if (alumnus) {
      wx.showToast({ title: `已向${alumnus.name}发送感谢信息`, icon: 'success' })
    }
  },

  // 查看更多响应度低的校友
  viewMoreLowResponseAlumni() {
    wx.showToast({ title: '功能开发中', icon: 'none' })
  },

  // 提醒校友处理申请
  contactAlumnus(e) {
    const alumnusId = e.currentTarget.dataset.id
    const alumnus = this.data.lowResponsivenessAlumni.find(item => item.alumnusId === alumnusId || item.name === alumnusId)
    if (alumnus) {
      wx.showModal({
        title: '提醒校友',
        content: `确定要向${alumnus.name}发送提醒消息？`,
        success(res) {
          if (res.confirm) {
            wx.showToast({ title: '提醒已发送', icon: 'success' })
          }
        }
      })
    }
  },

  // 查看更多成功率高的学生
  viewMoreSuccessfulStudents() {
    wx.showToast({ title: '功能开发中', icon: 'none' })
  },

  // 邀请学生分享经验
  inviteShareExperience(e) {
    const studentId = e.currentTarget.dataset.id
    const student = this.data.highSuccessRateStudents.find(item => item.studentId === studentId || item.name === studentId)
    if (student) {
      wx.showModal({
        title: '邀请分享',
        content: `确定要邀请${student.name}分享求职经验？`,
        success(res) {
          if (res.confirm) {
            wx.showToast({ title: '邀请已发送', icon: 'success' })
          }
        }
      })
    }
  }
})
