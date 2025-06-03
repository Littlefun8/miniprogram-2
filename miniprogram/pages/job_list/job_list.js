// job_list.js
// 本地模拟职位数据，后续可替换为云开发API
// function getMockJobList() { ... }

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
    jobList: [], // 当前显示的职位
    allJobs: [],  // 缓存所有职位数据
    userType: '', // 'alumni' | 'teacher' | 'student' | ''
    isLoggedIn: false
  },

  onLoad() {
    this.getJobList();
    // 自动同步身份到user_profile
    const userType = wx.getStorageSync('userType');
    const isLoggedIn = wx.getStorageSync('isLoggedIn');
    if (userType) this.setData({ userType });
    if (isLoggedIn) this.setData({ isLoggedIn });
  },

  onPullDownRefresh() {
    this.refreshJobList();
  },

  onReachBottom() {
    this.loadMoreJobs();
  },

  // 获取职位列表（调用云开发API）
  getJobList() {
    this.setData({ isLoading: true });
    wx.cloud.callFunction({
      name: 'getJobList',
      data: { pageNum: 1, pageSize: 20 },
      success: res => {
        if (res.result.code === 200) {
          const jobs = res.result.data;
          this.setData({
            allJobs: jobs,
            jobList: this.filterAndSortJobs(
              jobs,
              this.data.activeFilter,
              this.data.selectedCity,
              this.data.selectedJobType
            ),
            isLoading: false,
            noMoreData: jobs.length === 0
          });
        } else {
          this.setData({ isLoading: false });
          wx.showToast({ title: '获取职位失败', icon: 'none' });
        }
      },
      fail: err => {
        this.setData({ isLoading: false });
        wx.showToast({ title: '云函数调用失败', icon: 'none' });
      }
    });
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
      activeFilter: type,
      jobList: this.filterAndSortJobs(
        this.data.allJobs,
        type,
        this.data.selectedCity,
        this.data.selectedJobType
      )
    });
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
      cityFilterVisible: false,
      jobList: this.filterAndSortJobs(
        this.data.allJobs,
        this.data.activeFilter,
        city,
        this.data.selectedJobType
      )
    });
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
      jobTypeFilterVisible: false,
      jobList: this.filterAndSortJobs(
        this.data.allJobs,
        this.data.activeFilter,
        this.data.selectedCity,
        jobType
      )
    });
  },

  // 添加职位
  onAddJobTap() {
    if (!this.data.isLoggedIn) {
      this.simulateLogin();
      return;
    }
    if (this.data.userType === 'alumni' || this.data.userType === 'teacher') {
      // 校友和老师可以发布岗位
    wx.navigateTo({
      url: '/pages/post_job/post_job'
    });
    } else if (this.data.userType === 'student') {
      wx.showModal({
        title: '提示',
        content: '学生身份无法发布岗位，请切换为校友或老师后再试。',
        showCancel: false
      });
    }
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
      // url: '/pages/job/job_detail?id=' + id
      url: '/pages/job_detail/job_detail'
    });
  },

  onScanQrcodeTap() {
    if (!this.data.isLoggedIn) {
      this.simulateLogin();
      return;
    }
    // 所有身份都可以扫码
    wx.scanCode({
      onlyFromCamera: false,
      scanType: ['qrCode', 'barCode'],
      success: (res) => {
        wx.showModal({
          title: '扫码结果',
          content: res.result,
          showCancel: false
        });
      },
      fail: () => {
        wx.showToast({
          title: '扫码失败',
          icon: 'none'
        });
      }
    });
  },

  filterAndSortJobs(jobs, filterType, city, jobType) {
    let filtered = jobs;
    if (city && city !== '全部') {
      filtered = filtered.filter(item => item.location.includes(city));
    }
    if (jobType && jobType !== '全部') {
      filtered = filtered.filter(item => item.title.includes(jobType));
    }
    if (filterType === 'newest') {
      return filtered.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    // 推荐：按喜欢数量降序
    return filtered.slice().sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
  },

  simulateLogin() {
    const that = this;
    wx.showActionSheet({
      itemList: ['校友', '老师', '学生'],
      success(res) {
        let userType = '';
        let role = '';
        if (res.tapIndex === 0) { userType = 'alumni'; role = '校友'; }
        if (res.tapIndex === 1) { userType = 'teacher'; role = '老师'; }
        if (res.tapIndex === 2) { userType = 'student'; role = '学生'; }
        that.setData({
          isLoggedIn: true,
          userType: userType
        });
        // 同步到本地缓存，供user_profile页面读取
        wx.setStorageSync('userType', userType);
        wx.setStorageSync('isLoggedIn', true);
        // 同步userInfo.role
        let userInfo = wx.getStorageSync('userInfo') || {};
        userInfo.role = role;
        wx.setStorageSync('userInfo', userInfo);
        wx.showToast({
          title: '已登录为' + role,
          icon: 'success'
        });
      },
      fail() {
        wx.showToast({ title: '请先登录', icon: 'none' });
      }
    });
  },

  onShow() {
    const userType = wx.getStorageSync('userType');
    const isLoggedIn = wx.getStorageSync('isLoggedIn');
    this.setData({
      isLoggedIn: !!isLoggedIn,
      userType: userType || ''
    });
  }
}) 