// manage_applications.js - 校友查看收到的申请并处理
const auth = require('../../utils/auth.js')

Page({
  data: {
    activeTab: 'pending',
    tabs: [
      { key: 'pending', label: '待处理' },
      { key: 'processing', label: '处理中' },
      { key: 'accepted', label: '已通过' },
      { key: 'rejected', label: '已拒绝' }
    ],
    applications: [],
    isLoading: false,
    noMoreData: false
  },

  onLoad() {
    this.loadApplications()
  },

  onPullDownRefresh() {
    this.setData({ applications: [], noMoreData: false })
    this.loadApplications()
    wx.stopPullDownRefresh()
  },

  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ activeTab: tab, applications: [], noMoreData: false })
    this.loadApplications()
  },

  // 加载收到的申请
  loadApplications() {
    if (this.data.isLoading) return
    this.setData({ isLoading: true })

    // 使用 getApplications 但按 publisherId 过滤
    // 后续可新建专门的云函数
    wx.cloud.callFunction({
      name: 'getApplications',
      data: {
        status: this.data.activeTab,
        pageNum: 1,
        pageSize: 20
      },
      success: res => {
        if (res.result.code === 200) {
          this.setData({
            applications: res.result.data,
            isLoading: false,
            noMoreData: res.result.data.length === 0
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
