// job_list.js
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
    jobList: [
      {
        id: '1',
        title: '前端开发工程师',
        salary: '15K-25K',
        company: '示例科技有限公司',
        location: '北京市朝阳区',
        date: '2024-03-20',
        tags: ['React', 'Vue', '小程序'],
        publisher: {
          name: '姚经理',
          tag: '校友'
        },
        reviewer: {
          name: '张教授',
          tag: '老师'
        }
      },
      {
        id: '2',
        title: '后端开发工程师',
        salary: '20K-35K',
        company: '云智科技有限公司',
        location: '上海市浦东新区',
        date: '2024-03-18',
        tags: ['Java', 'Spring Boot', '微服务'],
        publisher: {
          name: '技术总监',
          tag: '校友'
        },
        reviewer: {
          name: '李教授',
          tag: '老师'
        }
      },
      {
        id: '3',
        title: '产品经理',
        salary: '18K-30K',
        company: '创新互联网公司',
        location: '深圳市南山区',
        date: '2024-03-15',
        tags: ['用户增长', '数据分析', '产品设计'],
        publisher: {
          name: '李经理',
          tag: '校友'
        },
        reviewer: {
          name: '王教授',
          tag: '老师'
        }
      }
    ]
  },

  onLoad() {
    this.getJobList();
  },

  onPullDownRefresh() {
    this.refreshJobList();
  },

  onReachBottom() {
    this.loadMoreJobs();
  },

  // 获取职位列表
  getJobList() {
    this.setData({
      isLoading: true
    });

    // 模拟接口请求
    setTimeout(() => {
      this.setData({
        isLoading: false
      });

      // 示例数据已在data中初始化
      // 实际项目中应通过API获取数据
    }, 1000);
  },

  // 下拉刷新重新加载数据
  refreshJobList() {
    this.setData({
      jobList: [],
      noMoreData: false
    });

    this.getJobList();
    wx.stopPullDownRefresh();
  },

  // 上拉加载更多
  loadMoreJobs() {
    if (this.data.noMoreData || this.data.isLoading) return;

    this.setData({
      isLoading: true
    });

    // 模拟加载更多数据
    setTimeout(() => {
      // 这里只是示例，实际项目应该根据API返回结果判断是否还有更多数据
      this.setData({
        isLoading: false,
        noMoreData: true // 示例中设为无更多数据
      });
    }, 1000);
  },

  // 搜索相关方法
  onSearchChange(e) {
    this.setData({
      searchValue: e.detail.value
    });
  },

  onSearchClear() {
    this.setData({
      searchValue: ''
    });
    this.refreshJobList();
  },

  onSearchSubmit() {
    // 搜索提交
    wx.showToast({
      title: '搜索: ' + this.data.searchValue,
      icon: 'none'
    });
    // 实际项目中应调用搜索API
  },

  // 筛选相关方法
  onFilterTap(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      activeFilter: type
    });
    
    // 根据筛选条件获取数据
    this.refreshJobList();
  },

  onCityFilterTap() {
    this.setData({
      cityFilterVisible: true
    });
  },

  onCityFilterClose() {
    this.setData({
      cityFilterVisible: false
    });
  },

  onCitySelect(e) {
    const city = e.currentTarget.dataset.city;
    this.setData({
      selectedCity: city,
      cityFilterVisible: false
    });
    
    // 根据城市筛选条件获取数据
    this.refreshJobList();
  },

  onJobTypeFilterTap() {
    this.setData({
      jobTypeFilterVisible: true
    });
  },

  onJobTypeFilterClose() {
    this.setData({
      jobTypeFilterVisible: false
    });
  },

  onJobTypeSelect(e) {
    const jobType = e.currentTarget.dataset.jobType;
    this.setData({
      selectedJobType: jobType,
      jobTypeFilterVisible: false
    });
    
    // 根据岗位类型筛选条件获取数据
    this.refreshJobList();
  },

  // 添加职位
  onAddJobTap() {
    wx.navigateTo({
      url: '/pages/post_job/post_job'
    });
  },

  // 点击职位项
  onJobItemTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/job/job_detail?id=' + id
    });
  },

  // 点击详情按钮
  onJobDetailTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/job/job_detail?id=' + id
    });
  }
}) 