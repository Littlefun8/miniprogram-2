// teacher_stats.js
Page({
  data: {
    overview: {
      totalApplies: 180,
      processed: 140,
      pending: 40,
      passRate: 78
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
    ],
    teacherInfo: {
      name: '张教授',
      avatar: 'https://tdesign.gtimg.com/site/avatar.jpg',
      role: '老师'
    },
    totalApplications: 20,
    totalPassed: 15,
    totalPassRate: 75, // 百分比
    avgMatchScore: 82, // 匹配度分数
    jobStats: [
      {
        jobTitle: '前端开发工程师',
        total: 5,
        passed: 4,
        passRate: 80,
        avgMatch: 85
      },
      {
        jobTitle: '后端工程师',
        total: 10,
        passed: 7,
        passRate: 70,
        avgMatch: 78
      },
      {
        jobTitle: '产品经理',
        total: 5,
        passed: 4,
        passRate: 80,
        avgMatch: 83
      }
    ],
    funnelStages: [
      {
        name: '提交申请',
        count: 120,
        nextCount: 100,
        conversion: 83,
        dropoff: 17,
        avgMatch: 78
      },
      {
        name: '进入审核',
        count: 100,
        nextCount: 70,
        conversion: 70,
        dropoff: 30,
        avgMatch: 82
      },
      {
        name: '审核通过',
        count: 70,
        nextCount: 60,
        conversion: 86,
        dropoff: 14,
        avgMatch: 88
      },
      {
        name: '发放内推码',
        count: 60,
        nextCount: null,
        conversion: null,
        dropoff: null,
        avgMatch: 91
      }
    ],
    explain: '',
    // 岗位列表，0为全部岗位
    jobList: [
      { label: '全部岗位', value: 0 },
      { label: '前端开发工程师', value: 1 },
      { label: '后端开发工程师', value: 2 },
      { label: '产品经理', value: 3 },
      { label: 'UI设计师', value: 4 }
    ],
    // 岗位信息
    jobInfoMap: {
      0: { title: '全部岗位', desc: '所有岗位的汇总统计' },
      1: { title: '前端开发工程师', desc: '负责Web/小程序前端开发' },
      2: { title: '后端开发工程师', desc: '负责服务端开发与维护' },
      3: { title: '产品经理', desc: '负责产品规划与需求分析' },
      4: { title: 'UI设计师', desc: '负责界面与交互设计' }
    },
    // 各岗位及全部岗位的漏斗数据
    jobFunnels: {
      0: [
        { name: '提交申请', count: 180, nextCount: 150, conversion: 83, dropoff: 17, avgMatch: 80 },
        { name: '进入审核', count: 150, nextCount: 110, conversion: 73, dropoff: 27, avgMatch: 82 },
        { name: '审核通过', count: 110, nextCount: 90, conversion: 82, dropoff: 18, avgMatch: 88 },
        { name: '发放内推码', count: 90, nextCount: null, conversion: null, dropoff: null, avgMatch: 91 }
      ],
      1: [
        { name: '提交申请', count: 50, nextCount: 40, conversion: 80, dropoff: 20, avgMatch: 78 },
        { name: '进入审核', count: 40, nextCount: 30, conversion: 75, dropoff: 25, avgMatch: 82 },
        { name: '审核通过', count: 30, nextCount: 25, conversion: 83, dropoff: 17, avgMatch: 88 },
        { name: '发放内推码', count: 25, nextCount: null, conversion: null, dropoff: null, avgMatch: 91 }
      ],
      2: [
        { name: '提交申请', count: 60, nextCount: 50, conversion: 83, dropoff: 17, avgMatch: 80 },
        { name: '进入审核', count: 50, nextCount: 35, conversion: 70, dropoff: 30, avgMatch: 85 },
        { name: '审核通过', count: 35, nextCount: 30, conversion: 86, dropoff: 14, avgMatch: 90 },
        { name: '发放内推码', count: 30, nextCount: null, conversion: null, dropoff: null, avgMatch: 93 }
      ],
      3: [
        { name: '提交申请', count: 40, nextCount: 32, conversion: 80, dropoff: 20, avgMatch: 75 },
        { name: '进入审核', count: 32, nextCount: 25, conversion: 78, dropoff: 22, avgMatch: 80 },
        { name: '审核通过', count: 25, nextCount: 20, conversion: 80, dropoff: 20, avgMatch: 85 },
        { name: '发放内推码', count: 20, nextCount: null, conversion: null, dropoff: null, avgMatch: 88 }
      ],
      4: [
        { name: '提交申请', count: 30, nextCount: 25, conversion: 83, dropoff: 17, avgMatch: 82 },
        { name: '进入审核', count: 25, nextCount: 18, conversion: 72, dropoff: 28, avgMatch: 86 },
        { name: '审核通过', count: 18, nextCount: 15, conversion: 83, dropoff: 17, avgMatch: 90 },
        { name: '发放内推码', count: 15, nextCount: null, conversion: null, dropoff: null, avgMatch: 92 }
      ]
    },
    currentJobId: 0,
    currentFunnel: [],
    currentJobInfo: {}
  },

  onLoad() {
    // 检查用户身份，确保只有老师身份才能访问统计页面
    const userType = wx.getStorageSync('userType');
    const isLoggedIn = wx.getStorageSync('isLoggedIn');
    
    if (!isLoggedIn || userType !== 'teacher') {
      wx.switchTab({
        url: '/pages/application_progress/application_progress'
      });
      return;
    }
    
    // 初始化图表数据（实际项目中应该使用图表组件）
    this.initTrendChart();
    
    // 统计说明
    this.setData({
      explain: '每一步为上一步的子集，转化率=下一阶段人数/本阶段人数，流失率=1-转化率，平均匹配度为进入该阶段申请的关联分数均值，数据为模拟。'
    });
    
    // 默认展示第一个职位的转化漏斗
    this.setData({
      currentFunnel: this.data.jobFunnels[0],
      currentJobInfo: this.data.jobInfoMap[0]
    });
  },

  onShow() {
    const userType = wx.getStorageSync('userType');
    const isLoggedIn = wx.getStorageSync('isLoggedIn');
    
    // 检查用户身份，确保只有老师身份才能访问统计页面
    if (!isLoggedIn || userType !== 'teacher') {
      wx.switchTab({
        url: '/pages/application_progress/application_progress'
      });
      return;
    }
    
    this.setData({
      isLoggedIn: !!isLoggedIn,
      userType: userType || ''
    });
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
  },

  // 下拉选择岗位切换漏斗
  onJobDropdownChange(e) {
    const val = Number(e.detail.value);
    this.setData({ currentJobId: val });
    if (this.data.jobFunnels[val]) {
      this.setData({
        currentFunnel: this.data.jobFunnels[val],
        currentJobInfo: this.data.jobInfoMap[val]
      });
    } else {
      wx.showToast({ title: '无此岗位数据', icon: 'none' });
    }
  }
}) 