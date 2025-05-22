Page({
  data: {
    userInfo: {}
  },

  onLoad() {
    // 获取用户信息
    this.getUserInfo()
  },

  getUserInfo() {
    // TODO: 调用获取用户信息API
    // 这里使用模拟数据
    this.setData({
      userInfo: {
        avatarUrl: '',
        nickName: '校友用户'
      }
    })
  },

  onMyPostsTap() {
    wx.navigateTo({
      url: '/pages/my-posts/my-posts'
    })
  },

  onMyApplicationsTap() {
    wx.navigateTo({
      url: '/pages/my-applications/my-applications'
    })
  },

  onFavoritesTap() {
    wx.navigateTo({
      url: '/pages/favorites/favorites'
    })
  },

  onSettingsTap() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    })
  }
}) 