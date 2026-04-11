// user_profile.js
const auth = require('../../utils/auth.js')

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
    this.syncAuthState()
    if (this.data.isLoggedIn) {
      this.getUserStats()
    }
  },

  onShow() {
    this.syncAuthState()
    if (this.data.isLoggedIn) {
      this.getUserStats()
    }
  },

  syncAuthState() {
    const userInfo = auth.getUserInfo()
    const userType = auth.getUserType()
    this.setData({
      isLoggedIn: auth.isLoggedIn(),
      userInfo,
      userType
    })
  },

  // 获取用户统计数据（调用云函数）
  getUserStats() {
    wx.cloud.callFunction({
      name: 'getUserProfile',
      data: {},
      success: res => {
        if (res.result.code === 200) {
          const { userInfo, publishedJobs, applications } = res.result.data
          if (userInfo) {
            this.setData({
              userInfo: {
                avatarUrl: userInfo.avatarUrl || this.data.userInfo.avatarUrl,
                nickName: userInfo.nickName || this.data.userInfo.nickName,
                isVerified: userInfo.isVerified || false,
                role: auth.ROLE_LABELS[userInfo.userType] || this.data.userInfo.role
              },
              stats: {
                postsCount: publishedJobs ? publishedJobs.length : 0,
                appliesCount: applications ? applications.length : 0,
                favoritesCount: 0
              }
            })
          }
        }
      },
      fail: () => {
        wx.showToast({ title: '获取用户信息失败', icon: 'none' })
      }
    })
  },

  // 编辑头像
  onEditAvatarTap() {
    if (!this.data.isLoggedIn) {
      this.showLoginDialog()
      return
    }
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath
        this.setData({ 'userInfo.avatarUrl': tempFilePath })
        wx.setStorageSync('userInfo', this.data.userInfo)
        wx.showToast({ title: '头像更新成功', icon: 'success' })
      }
    })
  },

  // 导航到身份认证页面
  onNavigateToVerify() {
    if (!this.data.isLoggedIn) {
      this.showLoginDialog()
      return
    }
    wx.navigateTo({ url: '/pages/verify/index' })
  },

  // 导航到我的发布页面（校友/老师 → 申请管理，老师也可 → 审核页面）
  onNavigateToMyPosts() {
    if (!this.data.isLoggedIn) {
      this.showLoginDialog()
      return
    }
    if (this.data.userType === 'teacher') {
      wx.navigateTo({ url: '/pages/audit_job/audit_job' })
    } else {
      wx.navigateTo({ url: '/pages/manage_applications/manage_applications' })
    }
  },

  // 导航到我的申请页面
  onNavigateToMyApplies() {
    if (!this.data.isLoggedIn) {
      this.showLoginDialog()
      return
    }
    wx.navigateTo({ url: '/pages/application_progress/application_progress' })
  },

  // 导航到我的收藏页面
  onNavigateToMyFavorites() {
    if (!this.data.isLoggedIn) {
      this.showLoginDialog()
      return
    }
    wx.showModal({
      title: '提示',
      content: '收藏列表功能开发中，敬请期待！',
      showCancel: false
    })
  },

  // 导航到通知页面
  onNavigateToNotifications() {
    if (!this.data.isLoggedIn) {
      this.showLoginDialog()
      return
    }
    wx.navigateTo({ url: '/pages/notifications/notifications' })
  },

  // 导航到设置页面
  onNavigateToSettings() {
    wx.navigateTo({ url: '/pages/edit_profile/edit_profile' })
  },

  // 导航到帮助与反馈页面
  onNavigateToHelp() {
    wx.navigateTo({ url: '/pages/help/help' })
  },

  // 导航到关于我们页面
  onNavigateToAbout() {
    wx.navigateTo({ url: '/pages/about/about' })
  },

  // 显示登录对话框
  showLoginDialog() {
    this.setData({ showLoginDialog: true })
  },

  // 登录对话框确认
  onLoginDialogConfirm() {
    this.setData({ showLoginDialog: false })
    auth.interactiveLogin(({ userType, userInfo }) => {
      this.setData({ isLoggedIn: true, userType, userInfo })
      this.getUserStats()
    })
  },

  // 登录对话框取消
  onLoginDialogCancel() {
    this.setData({ showLoginDialog: false })
  },

  // 退出登录
  onLogoutTap() {
    auth.logout()
    wx.showToast({ title: '已退出登录', icon: 'success' })
    setTimeout(() => {
      wx.reLaunch({ url: '/pages/user_profile/user_profile' })
    }, 500)
  },

  // 点击用户信息区域（未登录时触发登录）
  onUserInfoTap() {
    if (this.data.isLoggedIn) return
    auth.interactiveLogin(({ userType, userInfo }) => {
      this.setData({ isLoggedIn: true, userType, userInfo })
      this.getUserStats()
    })
  },

  // 职位统计
  onNavigateToTeacherStats() {
    if (!this.data.isLoggedIn) {
      this.showLoginDialog()
      return
    }
    wx.navigateTo({ url: '/pages/teacher_stats/teacher_stats' })
  }
})
