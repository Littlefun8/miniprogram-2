Page({
  data: {
    activeTab: 'all',
    sliderLeft: 0,
    sliderWidth: 0,
    applications: [],
    isLoading: false,
    noMoreData: false,
    isLoggedIn: false,
    userType: '',
    showLoginDialog: false,
    userInfo: {}
  },

  onLoad() {
    // 同步身份
    const isLoggedIn = wx.getStorageSync('isLoggedIn');
    const userType = wx.getStorageSync('userType');
    this.setData({
      isLoggedIn: !!isLoggedIn,
      userType: userType || ''
    });
    this.getSystemInfo();
    this.loadApplications();
  },

  onShow() {
    const userType = wx.getStorageSync('userType');
    const isLoggedIn = wx.getStorageSync('isLoggedIn');
    let userInfo = wx.getStorageSync('userInfo') || {};
    if (userType === 'alumni') userInfo.role = '校友';
    if (userType === 'teacher') userInfo.role = '老师';
    if (userType === 'student') userInfo.role = '学生';
    this.setData({
      isLoggedIn: !!isLoggedIn,
      userType: userType || '',
      userInfo: userInfo
    });
    // 若已登录，刷新进度列表
    if (this.data.isLoggedIn) {
      this.refreshProgressList && this.refreshProgressList();
    }
  },

  getSystemInfo() {
    wx.getSystemInfo({
      success: (res) => {
        const screenWidth = res.windowWidth;
        const tabCount = 4; // Assuming 4 tabs
        const sliderWidth = screenWidth / tabCount;
        this.setData({
          sliderWidth: sliderWidth,
        });
        this.updateSliderPosition(this.data.activeTab);
      },
    });
  },

  updateSliderPosition(tab) {
    const tabIndex = {
      all: 0,
      pending: 1,
      processing: 2,
      completed: 3,
    }[tab];
    const sliderLeft = this.data.sliderWidth * tabIndex;
    this.setData({
      sliderLeft: sliderLeft,
    });
  },

  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      activeTab: tab,
      applications: [], // Clear existing applications when tab changes
      noMoreData: false,
    });
    this.updateSliderPosition(tab);
    this.loadApplications();
  },

  loadApplications() {
    if (this.data.isLoading || this.data.noMoreData) return;

    this.setData({
      isLoading: true,
    });

    // 调用云函数获取申请进度
    wx.cloud.callFunction({
      name: 'getApplications',
      data: { status: this.data.activeTab },
      success: res => {
        if (res.result.code === 200) {
          this.setData({
            applications: res.result.data,
            isLoading: false,
            noMoreData: !res.result.data || res.result.data.length === 0
          });
        } else {
          this.setData({ isLoading: false });
          wx.showToast({ title: '获取进度失败', icon: 'none' });
        }
      },
      fail: err => {
        this.setData({ isLoading: false });
        wx.showToast({ title: '云函数调用失败', icon: 'none' });
      }
    });
  },

  onApplicationTap(e) {
    const id = e.currentTarget.dataset.id;
    console.log('Application tapped:', id);
    // navigate to job detail or application detail page
  },

  onViewDetailTap(e) {
    if (!this.data.isLoggedIn) {
      this.showLoginPrompt(() => this.onViewDetailTap(e));
      return;
    }
    const id = e.currentTarget.dataset.id;
    console.log('View detail tapped for application:', id);
    // navigate to job detail or application detail page
    wx.navigateTo({
      url: `/pages/job_detail/job_detail?id=${id}`,
    });
  },

  onBrowseJobsTap() {
    console.log('Browse jobs tapped');
    // navigate to job listing page
    wx.switchTab({
      url: '/pages/job/job',
    });
  },

  // 复制内推码
  copyReferralCode(e) {
    if (!this.data.isLoggedIn) {
      this.showLoginPrompt(() => this.copyReferralCode(e));
      return;
    }
    const code = e.currentTarget.dataset.code;
    wx.setClipboardData({
      data: code,
      success: () => {
        wx.showToast({
          title: '内推码已复制',
          icon: 'success'
        });
      }
    });
  },

  // 复制校友联系方式
  copyReferralContact(e) {
    if (!this.data.isLoggedIn) {
      this.showLoginPrompt(() => this.copyReferralContact(e));
      return;
    }
    const contact = e.currentTarget.dataset.contact;
    wx.setClipboardData({
      data: contact,
      success: () => {
        wx.showToast({
          title: '联系方式已复制',
          icon: 'success'
        });
      }
    });
  },

  // 登录提示，支持回调
  showLoginPrompt(cb) {
    wx.showModal({
      title: '提示',
      content: '您尚未登录，请先登录后使用完整功能',
      confirmText: '去登录',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.simulateLogin(cb);
        }
      }
    });
  },

  // 下拉刷新操作
  onPullDownRefresh() {
    this.setData({
      applications: [],
      noMoreData: false
    });
    this.loadApplications();
    wx.stopPullDownRefresh();
  },

  simulateLogin(cb) {
    const that = this;
    wx.showActionSheet({
      itemList: ['校友', '老师', '学生'],
      success(res) {
        let userType = '';
        if (res.tapIndex === 0) userType = 'alumni';
        if (res.tapIndex === 1) userType = 'teacher';
        if (res.tapIndex === 2) userType = 'student';
        that.setData({
          isLoggedIn: true,
          userType: userType
        });
        wx.setStorageSync('isLoggedIn', true);
        wx.setStorageSync('userType', userType);
        wx.showToast({ title: '登录成功', icon: 'success' });
        setTimeout(() => { that.onPullDownRefresh(); if (typeof cb === 'function') cb(); }, 300);
      },
      fail() {
        wx.showToast({ title: '请先登录', icon: 'none' });
      }
    });
  },
});
