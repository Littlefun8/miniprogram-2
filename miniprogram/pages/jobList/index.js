Page({
  data: {
    jobList: [],
    pageNum: 1,
    pageSize: 10,
    total: 0,
    keyword: '',
    loading: false,
    hasMore: true
  },

  onLoad() {
    this.loadJobList()
  },

  // 加载职位列表
  async loadJobList(isRefresh = false) {
    if (this.data.loading) return
    
    try {
      this.setData({ loading: true })
      
      const { pageNum, pageSize, keyword } = this.data
      const res = await wx.cloud.callFunction({
        name: 'getJobList',
        data: {
          pageNum: isRefresh ? 1 : pageNum,
          pageSize,
          keyword
        }
      })

      if (res.result.code === 200) {
        const { list, total } = res.result.data
        this.setData({
          jobList: isRefresh ? list : [...this.data.jobList, ...list],
          total,
          pageNum: isRefresh ? 1 : pageNum + 1,
          hasMore: (isRefresh ? list : [...this.data.jobList, ...list]).length < total
        })
      } else {
        wx.showToast({
          title: res.result.message || '加载失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('加载职位列表失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 下拉刷新
  async onPullDownRefresh() {
    await this.loadJobList(true)
    wx.stopPullDownRefresh()
  },

  // 上拉加载更多
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadJobList()
    }
  },

  // 搜索
  onSearch(e) {
    this.setData({
      keyword: e.detail.value,
      jobList: [],
      pageNum: 1,
      hasMore: true
    }, () => {
      this.loadJobList(true)
    })
  },

  // 跳转到职位详情
  goToDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/jobDetail/index?id=${id}`
    })
  }
}) 