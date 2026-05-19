// verify/index.js
Page({
  data: {
    userType: '',
    isVerified: false,
    verifyTips: '当前版本提供身份认证入口，认证流程由管理员统一处理。'
  },

  onLoad() {
    const userType = wx.getStorageSync('userType') || ''
    const userInfo = wx.getStorageSync('userInfo') || {}
    this.setData({
      userType,
      isVerified: !!userInfo.isVerified
    })
  },

  onSubmitVerify() {
    wx.showModal({
      title: '提交成功',
      content: '认证申请已提交，请等待管理员审核。',
      showCancel: false
    })
  }
})


