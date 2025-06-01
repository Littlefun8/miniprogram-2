Page({
  data: {
    activeTab: 'all',
    sliderLeft: 0,
    sliderWidth: 0,
    applications: [],
    isLoading: false,
    noMoreData: false,
  },

  onLoad() {
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

    // 模拟API请求
    setTimeout(() => {
      let newApplications = [];
      
      // 确保ID为3的申请始终排在第一个
      const application3 = {
        id: '3',
        jobTitle: '后端工程师',
        company: '字节跳动',
        location: '北京',
        status: 'completed',
        statusText: '已完成',
        applyDate: '2023-10-24 11:15',
        timeline: [
          { title: '提交申请', time: '2023-10-24 11:15', done: true },
          { title: '申请审核', time: '2023-10-25 10:00', done: true, status: '' },
          { title: '通过/不通过', time: '2023-10-26 16:00', done: true, status: 'passed' }
        ],
        referralInfo: '恭喜您获得内推资格！',
        referralCode: 'BYTE2024',
        referralContact: '微信：ByteDancer2022'
      };
      newApplications.push(application3);

      if (this.data.activeTab === 'all' || this.data.activeTab === 'pending') {
        // 检查是否已经包含了ID为3的申请，避免重复添加
        if (!newApplications.some(app => app.id === '1')) {
          newApplications.push({
            id: '1',
            jobTitle: '前端开发工程师',
            company: '腾讯科技',
            location: '深圳',
            status: 'pending',
            statusText: '待处理',
            applyDate: '2023-10-26 10:00',
            timeline: [
              { title: '提交申请', time: '2023-10-26 10:00', done: true },
              { title: '申请审核', time: '', done: false, status: '' },
              { title: '通过/不通过', time: '', done: false, status: '' }
            ],
          });
        }
      }
      if (this.data.activeTab === 'all' || this.data.activeTab === 'processing') {
        if (!newApplications.some(app => app.id === '2')) {
          newApplications.push({
            id: '2',
            jobTitle: '产品经理',
            company: '阿里巴巴',
            location: '杭州',
            status: 'processing',
            statusText: '处理中',
            applyDate: '2023-10-25 14:30',
            timeline: [
              { title: '提交申请', time: '2023-10-25 14:30', done: true },
              { title: '申请审核', time: '2023-10-26 09:00', done: true, status: '' },
              { title: '通过/不通过', time: '', done: false, status: '' }
            ],
          });
        }
      }
      if (this.data.activeTab === 'all' || this.data.activeTab === 'completed') {
        if (!newApplications.some(app => app.id === '4')) {
          newApplications.push({
            id: '4',
            jobTitle: 'UI设计师',
            company: '美团',
            location: '北京',
            status: 'completed',
            statusText: '已完成',
            applyDate: '2023-10-23 09:00',
            timeline: [
              { title: '提交申请', time: '2023-10-23 09:00', done: true },
              { title: '申请审核', time: '2023-10-24 14:00', done: true, status: '' },
              { title: '通过/不通过', time: '2023-10-25 11:00', done: true, status: 'failed' }
            ],
            referralInfo: '很遗憾，您的申请未通过审核。请继续关注其他内推机会。'
          });
        }
      }

      this.setData({
        applications: [...newApplications, ...this.data.applications.filter(app => app.id !== '3')], // 确保ID为3的在最前面
        isLoading: false,
        noMoreData: true, // For simulation, assume no more data after initial load
      });
    }, 1000);
  },

  onApplicationTap(e) {
    const id = e.currentTarget.dataset.id;
    console.log('Application tapped:', id);
    // navigate to job detail or application detail page
  },

  onViewDetailTap(e) {
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
});
