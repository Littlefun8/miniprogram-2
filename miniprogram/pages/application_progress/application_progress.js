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
    showLoginDialog: false
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

    setTimeout(() => {
      // 所有申请数据
      const allApplications = [
        {
          id: '1',
          jobTitle: '前端开发工程师',
          company: '腾讯科技',
          location: '深圳',
          status: 'pending',
          statusText: '待处理',
          applyDate: '2024-10-26 10:00',
          timeline: [
            { title: '提交申请', time: '2024-10-26 10:00', done: true },
            { title: '申请审核', time: '', done: false, status: '' },
            { title: '通过/不通过', time: '', done: false, status: '' }
          ],
        },
        {
          id: '2',
          jobTitle: '产品经理',
          company: '阿里巴巴',
          location: '杭州',
          status: 'processing',
          statusText: '处理中',
          applyDate: '2024-10-25 14:30',
          timeline: [
            { title: '提交申请', time: '2024-10-25 14:30', done: true },
            { title: '申请审核', time: '2024-10-26 09:00', done: true, status: '' },
            { title: '通过/不通过', time: '', done: false, status: '' }
          ],
        },
        {
          id: '3',
          jobTitle: '后端工程师',
          company: '字节跳动',
          location: '北京',
          status: 'completed',
          statusText: '已完成',
          applyDate: '2024-10-24 11:15',
          timeline: [
            { title: '提交申请', time: '2024-10-24 11:15', done: true },
            { title: '申请审核', time: '2024-10-25 10:00', done: true, status: '' },
            { title: '通过/不通过', time: '2024-10-26 16:00', done: true, status: 'passed' }
          ],
          referralInfo: '恭喜您获得内推资格！',
          referralCode: 'BYTE2024',
          referralContact: '微信：ByteDancer2022'
        },
        {
          id: '4',
          jobTitle: 'UI设计师',
          company: '美团',
          location: '北京',
          status: 'completed',
          statusText: '已完成',
          applyDate: '2024-10-23 09:00',
          timeline: [
            { title: '提交申请', time: '2024-10-23 09:00', done: true },
            { title: '申请审核', time: '2024-10-24 14:00', done: true, status: '' },
            { title: '通过/不通过', time: '2024-10-25 11:00', done: true, status: 'failed' }
          ],
          referralInfo: '很遗憾，您的申请未通过审核。请继续关注其他内推机会。'
        }
      ];
      let filtered = [];
      if (!this.data.isLoggedIn) {
        // 未登录仅展示后端工程师
        filtered = allApplications.filter(app => app.id === '3');
      } else {
        switch (this.data.activeTab) {
          case 'pending':
            filtered = allApplications.filter(app => app.status === 'pending');
            break;
          case 'processing':
            filtered = allApplications.filter(app => app.status === 'processing');
            break;
          case 'completed':
            filtered = allApplications.filter(app => app.status === 'completed');
            break;
          case 'all':
          default:
            filtered = allApplications.slice();
            const backendIdx = filtered.findIndex(app => app.id === '3');
            if (backendIdx > 0) {
              const backend = filtered.splice(backendIdx, 1)[0];
              filtered.unshift(backend);
            }
            break;
        }
      }
      this.setData({
        applications: filtered,
        isLoading: false,
        noMoreData: true,
      });
    }, 1000);
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
        let role = '';
        if (res.tapIndex === 0) { userType = 'alumni'; role = '校友'; }
        if (res.tapIndex === 1) { userType = 'teacher'; role = '老师'; }
        if (res.tapIndex === 2) { userType = 'student'; role = '学生'; }
        that.setData({
          isLoggedIn: true,
          userType: userType
        });
        wx.setStorageSync('isLoggedIn', true);
        wx.setStorageSync('userType', userType);
        // 同步userInfo.role到本地缓存，供user_profile读取
        let userInfo = wx.getStorageSync('userInfo') || {};
        userInfo.role = role;
        userInfo.nickName = role + '用户';
        userInfo.isVerified = true;
        wx.setStorageSync('userInfo', userInfo);
        wx.showToast({ title: '登录成功', icon: 'success' });
        setTimeout(() => { that.onPullDownRefresh(); if (typeof cb === 'function') cb(); }, 300);
      },
      fail() {
        wx.showToast({ title: '请先登录', icon: 'none' });
      }
    });
  },
});
