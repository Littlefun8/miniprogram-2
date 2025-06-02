// user_profile.js
Page({
  data: {
    userInfo: {
      avatarUrl: '',
      nickName: '',
      isVerified: false,
      role: '游客'
    },
    stats: {
      postsCount: 0,
      appliesCount: 0,
      favoritesCount: 0
    },
    showLoginDialog: false,
    isLoggedIn: false,
    userType: ''
  },

  onLoad() {
    // 同步身份
    const userType = wx.getStorageSync('userType');
    const isLoggedIn = wx.getStorageSync('isLoggedIn');
    let userInfo = wx.getStorageSync('userInfo') || {};
    if (userType === 'alumni') userInfo.role = '校友';
    if (userType === 'teacher') userInfo.role = '老师';
    if (userType === 'student') userInfo.role = '学生';
    this.setData({
      isLoggedIn: !!isLoggedIn,
      userInfo: userInfo,
      userType: userType || ''
    });
    this.checkLoginStatus();
  },

  onShow() {
    // 每次显示页面时重新获取用户信息和统计数据
    if (this.data.isLoggedIn) {
      this.getUserInfo();
      this.getUserStats();
    }
  },

  // 检查登录状态
  checkLoginStatus() {
    // 获取本地存储的用户信息
    const userInfo = wx.getStorageSync('userInfo');
    
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        isLoggedIn: true
      });
      
      // 获取用户统计数据
      this.getUserStats();
    } else {
      this.setData({
        isLoggedIn: false,
        userInfo: {
          avatarUrl: '',
          nickName: '未登录',
          isVerified: false,
          role: '游客'
        },
        stats: {
          postsCount: 0,
          appliesCount: 0,
          favoritesCount: 0
        }
      });
    }
  },

  // 获取用户信息
  getUserInfo() {
    // 实际项目中应该调用API获取用户信息
    // 这里使用模拟数据
    const userInfo = {
      avatarUrl: 'https://example.com/avatar.jpg',
      nickName: '张三',
      isVerified: true,
      role: '校友'
    };
    
    this.setData({
      userInfo: userInfo
    });
    
    // 保存到本地存储
    wx.setStorageSync('userInfo', userInfo);
  },

  // 获取用户统计数据
  getUserStats() {
    // 优先读取本地缓存的appliesCount
    let appliesCount = wx.getStorageSync('appliesCount');
    if (appliesCount === '' || appliesCount === undefined || appliesCount === null) {
      appliesCount = 8; // 默认模拟数据
    }
    const stats = {
      postsCount: 5,
      appliesCount: Number(appliesCount),
      favoritesCount: 12
    };
    this.setData({
      stats: stats
    });
  },

  // 编辑头像
  onEditAvatarTap() {
    if (!this.data.isLoggedIn) {
      this.showLoginPrompt();
      return;
    }
    
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        
        // 实际项目中应该上传头像到服务器
        // 这里仅做本地展示
        this.setData({
          'userInfo.avatarUrl': tempFilePath
        });
        
        // 更新本地存储
        wx.setStorageSync('userInfo', this.data.userInfo);
        
        wx.showToast({
          title: '头像更新成功',
          icon: 'success'
        });
      }
    });
  },

  // 导航到身份认证页面
  onNavigateToVerify() {
    if (!this.data.isLoggedIn) {
      this.showLoginPrompt();
      return;
    }
    
    wx.navigateTo({
      url: '/pages/verify/index'
    });
  },

  // 导航到我的发布页面
  onNavigateToMyPosts() {
    if (!this.data.isLoggedIn) {
      this.showLoginPrompt();
      return;
    }
    wx.showModal({
      title: '提示',
      content: '功能开发中，敬请期待！',
      showCancel: false
    });
  },

  // 导航到我的申请页面
  onNavigateToMyApplies() {
    if (!this.data.isLoggedIn) {
      this.showLoginPrompt();
      return;
    }
    wx.showModal({
      title: '提示',
      content: '功能开发中，敬请期待！',
      showCancel: false
    });
  },

  // 导航到我的收藏页面
  onNavigateToMyFavorites() {
    if (!this.data.isLoggedIn) {
      this.showLoginPrompt();
      return;
    }
    wx.showModal({
      title: '提示',
      content: '功能开发中，敬请期待！',
      showCancel: false
    });
  },

  // 导航到设置页面
  onNavigateToSettings() {
    wx.showModal({
      title: '提示',
      content: '功能开发中，敬请期待！',
      showCancel: false
    });
  },

  // 导航到帮助与反馈页面
  onNavigateToHelp() {
    wx.navigateTo({
      url: '/pages/help/index'
    });
  },

  // 导航到关于我们页面
  onNavigateToAbout() {
    wx.navigateTo({
      url: '/pages/about/index'
    });
  },

  // 显示登录提示
  showLoginPrompt() {
    this.setData({
      showLoginDialog: true
    });
  },

  // 登录对话框确认
  onLoginDialogConfirm() {
    this.setData({
      showLoginDialog: false
    });
    // 弹出模拟登录身份选择
    const that = this;
    wx.showActionSheet({
      itemList: ['校友', '老师', '学生'],
      success(res) {
        let userType = '';
        let role = '';
        if (res.tapIndex === 0) { userType = 'alumni'; role = '校友'; }
        if (res.tapIndex === 1) { userType = 'teacher'; role = '老师'; }
        if (res.tapIndex === 2) { userType = 'student'; role = '学生'; }
        let userInfo = that.data.userInfo || {};
        userInfo.role = role;
        userInfo.nickName = role + '用户';
        userInfo.isVerified = true;
        that.setData({
          isLoggedIn: true,
          userType: userType,
          userInfo: userInfo
        });
        wx.setStorageSync('userType', userType);
        wx.setStorageSync('isLoggedIn', true);
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

  // 登录对话框取消
  onLoginDialogCancel() {
    this.setData({
      showLoginDialog: false
    });
  },

  // 退出登录
  onLogoutTap() {
    wx.clearStorageSync();
    wx.showToast({ title: '已退出登录', icon: 'success' });
    setTimeout(() => { wx.reLaunch({ url: '/pages/user_profile/user_profile' }); }, 500);
  },

  onUserInfoTap() {
    if (this.data.isLoggedIn) return;
    // 模拟登录，选择身份
    const that = this;
    wx.showActionSheet({
      itemList: ['校友', '老师', '学生'],
      success(res) {
        let userType = '';
        let role = '';
        if (res.tapIndex === 0) { userType = 'alumni'; role = '校友'; }
        if (res.tapIndex === 1) { userType = 'teacher'; role = '老师'; }
        if (res.tapIndex === 2) { userType = 'student'; role = '学生'; }
        let userInfo = that.data.userInfo || {};
        userInfo.role = role;
        userInfo.nickName = role + '用户';
        userInfo.isVerified = true;
        that.setData({
          isLoggedIn: true,
          userType: userType,
          userInfo: userInfo
        });
        wx.setStorageSync('userType', userType);
        wx.setStorageSync('isLoggedIn', true);
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
}) 