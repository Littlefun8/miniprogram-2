// profile.js
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
    isLoggedIn: false
  },

  onLoad() {
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
    // 实际项目中应该调用API获取用户统计数据
    // 这里使用模拟数据
    const stats = {
      postsCount: 5,
      appliesCount: 8,
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
    
    wx.navigateTo({
      url: '/pages/my_posts/index'
    });
  },

  // 导航到我的申请页面
  onNavigateToMyApplies() {
    if (!this.data.isLoggedIn) {
      this.showLoginPrompt();
      return;
    }
    
    wx.navigateTo({
      url: '/pages/application_progress/application_progress'
    });
  },

  // 导航到我的收藏页面
  onNavigateToMyFavorites() {
    if (!this.data.isLoggedIn) {
      this.showLoginPrompt();
      return;
    }
    
    wx.navigateTo({
      url: '/pages/favorites/index'
    });
  },

  // 导航到设置页面
  onNavigateToSettings() {
    wx.navigateTo({
      url: '/pages/settings/index'
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
    
    wx.navigateTo({
      url: '/pages/login/index'
    });
  },

  // 登录对话框取消
  onLoginDialogCancel() {
    this.setData({
      showLoginDialog: false
    });
  }
}) 