// audit_job.js - 教师审核待审职位
const auth = require('../../utils/auth.js')

Page({
  data: {
    pendingJobs: [],
    isLoading: false,
    noMoreData: false,
    userType: ''
  },

  onLoad() {
    if (auth.getUserType() !== 'teacher') {
      wx.showModal({
        title: '提示',
        content: '仅教师可访问审核页面',
        showCancel: false,
        success: () => wx.navigateBack()
      })
      return
    }
    this.loadPendingJobs()
  },

  onPullDownRefresh() {
    this.setData({ pendingJobs: [], noMoreData: false })
    this.loadPendingJobs()
    wx.stopPullDownRefresh()
  },

  // 获取待审核职位
  loadPendingJobs() {
    if (this.data.isLoading) return
    this.setData({ isLoading: true })

    wx.cloud.callFunction({
      name: 'getJobList',
      data: { pageNum: 1, pageSize: 50, status: 'pending' },
      success: res => {
        if (res.result.code === 200) {
          this.setData({
            pendingJobs: res.result.data,
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

  // 审核通过
  onApprove(e) {
    const jobId = e.currentTarget.dataset.id
    const title = e.currentTarget.dataset.title
    wx.showModal({
      title: '确认通过',
      content: `确定通过「${title}」的审核吗？`,
      success: res => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中' })
          wx.cloud.callFunction({
            name: 'auditJob',
            data: { jobId, action: 'approve' },
            success: res => {
              wx.hideLoading()
              if (res.result.code === 200) {
                wx.showToast({ title: '审核通过', icon: 'success' })
                this.setData({ pendingJobs: [], noMoreData: false })
                this.loadPendingJobs()
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

  // 审核拒绝
  onReject(e) {
    const jobId = e.currentTarget.dataset.id
    const title = e.currentTarget.dataset.title
    const that = this

    wx.showModal({
      title: '拒绝审核',
      content: `请输入拒绝「${title}」的原因`,
      editable: true,
      placeholderText: '请输入拒绝原因',
      success: res => {
        if (res.confirm && res.content) {
          wx.showLoading({ title: '处理中' })
          wx.cloud.callFunction({
            name: 'auditJob',
            data: { jobId, action: 'reject', rejectReason: res.content },
            success: res => {
              wx.hideLoading()
              if (res.result.code === 200) {
                wx.showToast({ title: '已拒绝', icon: 'success' })
                that.setData({ pendingJobs: [], noMoreData: false })
                that.loadPendingJobs()
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

  // 查看职位详情
  onJobTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/job_detail/job_detail?id=' + id })
  }
})
