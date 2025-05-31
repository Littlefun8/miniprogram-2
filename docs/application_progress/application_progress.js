// progress.js
Page({
  data: {
    activeTab: 'all',
    sliderLeft: '0',
    sliderWidth: '25%',
    applications: [
      {
        id: '1',
        jobTitle: '前端开发工程师',
        company: '示例科技有限公司',
        location: '北京市朝阳区',
        status: 'pending',
        statusText: '待处理',
        applyDate: '2024-03-20',
        timeline: [
          { step: 'submit', done: true, time: '2024-03-20 10:30' },
          { step: 'review', done: false, time: '' },
          { step: 'interview', done: false, time: '' },
          { step: 'offer', done: false, time: '' }
        ]
      },
      {
        id: '2',
        jobTitle: '后端开发工程师',
        company: '云智科技有限公司',
        location: '上海市浦东新区',
        status: 'processing',
        statusText: '处理中',
        applyDate: '2024-03-18',
        timeline: [
          { step: 'submit', done: true, time: '2024-03-18 14:15' },
          { step: 'review', done: true, time: '2024-03-19 09:45' },
          { step: 'interview', done: false, time: '' },
          { step: 'offer', done: false, time: '' }
        ]
      },
      {
        id: '3',
        jobTitle: '产品经理',
        company: '创新互联网公司',
        location: '深圳市南山区',
        status: 'completed',
        statusText: '已完成',
        applyDate: '2024-03-15',
        timeline: [
          { step: 'submit', done: true, time: '2024-03-15 16:20' },
          { step: 'review', done: true, time: '2024-03-16 11:30' },
          { step: 'interview', done: true, time: '2024-03-18 14:00' },
          { step: 'offer', done: true, time: '2024-03-20 10:00' }
        ]
      }
    ],
    filteredApplications: [],
    isLoading: false,
    noMoreData: false
  },
  
  onLoad() {
    this.setData({
      filteredApplications: this.data.applications
    });
  },
  
  onPullDownRefresh() {
    this.refreshData();
  },
  
  onReachBottom() {
    this.loadMoreData();
  },
  
  // 切换标签
  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab;
    let sliderLeft = '0';
    
    // 计算滑块位置
    if (tab === 'all') {
      sliderLeft = '0';
    } else if (tab === 'pending') {
      sliderLeft = '25%';
    } else if (tab === 'processing') {
      sliderLeft = '50%';
    } else if (tab === 'completed') {
      sliderLeft = '75%';
    }
    
    this.setData({
      activeTab: tab,
      sliderLeft: sliderLeft
    });
    
    this.filterApplications(tab);
  },
  
  // 根据标签筛选申请
  filterApplications(tab) {
    if (tab === 'all') {
      this.setData({
        filteredApplications: this.data.applications
      });
    } else {
      const filtered = this.data.applications.filter(item => item.status === tab);
      this.setData({
        filteredApplications: filtered
      });
    }
  },
  
  // 刷新数据
  refreshData() {
    this.setData({
      isLoading: true
    });
    
    // 模拟请求
    setTimeout(() => {
      this.setData({
        isLoading: false
      });
      
      // 重新筛选数据
      this.filterApplications(this.data.activeTab);
      wx.stopPullDownRefresh();
    }, 1000);
  },
  
  // 加载更多数据
  loadMoreData() {
    if (this.data.noMoreData || this.data.isLoading) return;
    
    this.setData({
      isLoading: true
    });
    
    // 模拟请求
    setTimeout(() => {
      this.setData({
        isLoading: false,
        noMoreData: true // 示例中设为无更多数据
      });
    }, 1000);
  },
  
  // 点击申请项
  onApplicationTap(e) {
    const id = e.currentTarget.dataset.id;
    this.navigateToDetail(id);
  },
  
  // 点击查看详情
  onViewDetailTap(e) {
    const id = e.currentTarget.dataset.id;
    this.navigateToDetail(id);
  },
  
  // 导航到详情页
  navigateToDetail(id) {
    wx.navigateTo({
      url: '/pages/application_detail/index?id=' + id
    });
  },
  
  // 浏览职位
  onBrowseJobsTap() {
    wx.switchTab({
      url: '/pages/jobList/jobList'
    });
  }
}) 