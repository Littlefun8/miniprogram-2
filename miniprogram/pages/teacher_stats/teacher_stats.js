// teacher_stats.js
Page({
  data: {
    overview: {
      totalStudents: 245,
      totalApplies: 186,
      pendingApplies: 32,
      passRate: 74
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
    classes: [
      { label: '计算机2001班', value: 'cs2001' },
      { label: '计算机2002班', value: 'cs2002' },
      { label: '软件工程2001班', value: 'se2001' },
      { label: '软件工程2002班', value: 'se2002' }
    ],
    showMoreFilters: false,
    popularJobs: [
      { id: 1, title: '前端开发工程师', company: '示例科技有限公司', applicants: 28 },
      { id: 2, title: '后端开发工程师', company: '云智科技有限公司', applicants: 22 },
      { id: 3, title: '产品经理', company: '创新互联网公司', applicants: 19 },
      { id: 4, title: 'UI设计师', company: '视觉创意设计公司', applicants: 15 },
      { id: 5, title: '数据分析师', company: '数据智能公司', applicants: 12 }
    ],
    recentApplications: [
      {
        id: 1,
        studentName: '张三',
        studentAvatar: '',
        studentClass: '计算机2001班',
        jobTitle: '前端开发工程师',
        company: '示例科技有限公司',
        status: 'pending',
        statusText: '待处理',
        applyTime: '2024-03-20 10:30'
      },
      {
        id: 2,
        studentName: '李四',
        studentAvatar: '',
        studentClass: '软件工程2001班',
        jobTitle: '后端开发工程师',
        company: '云智科技有限公司',
        status: 'approved',
        statusText: '已通过',
        applyTime: '2024-03-19 14:15'
      },
      {
        id: 3,
        studentName: '王五',
        studentAvatar: '',
        studentClass: '计算机2002班',
        jobTitle: '产品经理',
        company: '创新互联网公司',
        status: 'rejected',
        statusText: '已拒绝',
        applyTime: '2024-03-18 16:20'
      }
    ]
  },

  onLoad() {
    // 初始化图表数据（实际项目中应该使用图表组件）
    this.initTrendChart();
  },

  // 初始化趋势图表（示例）
  initTrendChart() {
    // 实际项目中应该使用图表组件，例如ec-canvas
    // 这里只是示例代码
    const trendChartOption = {
      // 图表配置
    };
    
    this.setData({
      trendChartOption: trendChartOption
    });
  },

  // 时间筛选切换
  onTimeFilterChange(e) {
    const value = e.currentTarget.dataset.value;
    
    this.setData({
      timeFilterActive: value
    });
    
    // 根据选择的时间范围更新图表数据
    this.updateTrendChart(value);
  },

  // 更新趋势图表（示例）
  updateTrendChart(timeRange) {
    // 实际项目中应该根据时间范围获取数据并更新图表
    console.log('更新图表，时间范围：', timeRange);
  },

  // 显示更多筛选弹出层
  toggleMoreFilters() {
    this.setData({
      showMoreFilters: true
    });
  },

  // 关闭更多筛选弹出层
  closeMoreFilters() {
    this.setData({
      showMoreFilters: false
    });
  },

  // 弹出层可见性变化处理
  onPopupVisibleChange(e) {
    if (!e.detail.visible) {
      this.setData({
        showMoreFilters: false
      });
    }
  },

  // 状态筛选变化
  onStatusFilterChange(e) {
    const value = e.currentTarget.dataset.value;
    
    this.setData({
      statusFilter: value
    });
  },

  // 班级筛选变化
  onClassFilterChange(e) {
    const value = e.currentTarget.dataset.value;
    
    this.setData({
      classFilter: value
    });
  },

  // 重置筛选条件
  resetFilters() {
    this.setData({
      statusFilter: 'all',
      classFilter: 'all'
    });
  },

  // 应用筛选条件
  applyFilters() {
    const { statusFilter, classFilter } = this.data;
    
    // 实际项目中应该根据筛选条件获取数据
    console.log('应用筛选条件：', { status: statusFilter, class: classFilter });
    
    // 关闭弹出层
    this.closeMoreFilters();
  },

  // 导航到所有申请页面
  navigateToAllApplications() {
    wx.navigateTo({
      url: '/pages/all_applications/index'
    });
  },

  // 查看申请详情
  viewApplicationDetail(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.navigateTo({
      url: '/pages/application_detail/index?id=' + id
    });
  },

  // 处理申请
  handleApplication(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.navigateTo({
      url: '/pages/handle_application/index?id=' + id
    });
  }
}) 