Page({
  data: {
    searchValue: '',
    jobList: [
      {
        id: 1,
        title: '前端开发工程师',
        salary: '15k-25k',
        company: '腾讯科技',
        tags: ['React', 'Vue', 'TypeScript'],
        location: '深圳',
        publisher: '校友',
        publishTime: '2024-03-20'
      },
      {
        id: 2,
        title: '后端开发工程师',
        salary: '20k-35k',
        company: '阿里巴巴',
        tags: ['Java', 'Spring Boot', 'MySQL'],
        location: '杭州',
        publisher: '校友',
        publishTime: '2024-03-19'
      },
      {
        id: 3,
        title: '产品经理',
        salary: '18k-30k',
        company: '字节跳动',
        tags: ['产品设计', '用户增长', '数据分析'],
        location: '北京',
        publisher: '校友',
        publishTime: '2024-03-18'
      }
    ]
  },

  onLoad() {
    // 页面加载时获取职位列表
    this.getJobList()
  },

  // 搜索输入变化
  onSearchChange(e) {
    this.setData({
      searchValue: e.detail.value
    })
  },

  // 清除搜索
  onClear() {
    this.setData({
      searchValue: ''
    })
  },

  // 提交搜索
  onSearch() {
    if (!this.data.searchValue) {
      wx.showToast({
        title: '请输入搜索关键词',
        icon: 'none'
      })
      return
    }
    // TODO: 调用搜索API
    console.log('搜索关键词:', this.data.searchValue)
  },

  // 发布职位
  onPublish() {
    wx.navigateTo({
      url: '/pages/publish/publish'
    })
  },

  // 获取职位列表
  getJobList() {
    // TODO: 调用获取职位列表API
    // 这里使用模拟数据
  },

  // 点击职位卡片
  onJobClick(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/job-detail/job-detail?id=${id}`
    })
  }
}) 