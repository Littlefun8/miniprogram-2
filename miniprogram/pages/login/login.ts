// login.ts
interface UserInfo {
  avatarUrl: string;
  nickName: string;
}

Component({
  data: {
    userInfo: {
      avatarUrl: '',
      nickName: ''
    } as UserInfo,
    userType: '',
    agreed: false,
    loading: false
  },

  methods: {
    // 选择头像
    onChooseAvatar(e: any) {
      const { avatarUrl } = e.detail;
      this.setData({
        'userInfo.avatarUrl': avatarUrl
      });
    },

    // 输入昵称
    onInputChange(e: any) {
      this.setData({
        'userInfo.nickName': e.detail.value
      });
    },

    // 选择用户类型
    onTypeChange(e: any) {
      this.setData({
        userType: e.detail.value
      });
    },

    // 同意协议
    onAgreementChange(e: any) {
      this.setData({
        agreed: e.detail.value
      });
    },

    // 查看用户协议
    onViewAgreement() {
      wx.navigateTo({
        url: '/pages/agreement/agreement'
      });
    },

    // 查看隐私政策
    onViewPrivacy() {
      wx.navigateTo({
        url: '/pages/privacy/privacy'
      });
    },

    // 登录
    async onLogin() {
      if (!this.data.agreed) {
        wx.showToast({
          title: '请先同意用户协议和隐私政策',
          icon: 'none'
        });
        return;
      }

      try {
        this.setData({ loading: true });

        // 调用登录云函数
        const res = await wx.cloud.callFunction({
          name: 'login',
          data: {
            userInfo: this.data.userInfo,
            userType: this.data.userType
          }
        });

        if (res.result.code === 200) {
          // 保存用户信息到本地
          wx.setStorageSync('userInfo', {
            ...this.data.userInfo,
            userType: this.data.userType,
            userId: res.result.data.userId
          });

          wx.showToast({
            title: '登录成功',
            icon: 'success'
          });

          // 返回上一页或首页
          const pages = getCurrentPages();
          if (pages.length > 1) {
            wx.navigateBack();
          } else {
            wx.switchTab({
              url: '/pages/index/index'
            });
          }
        } else {
          throw new Error(res.result.message);
        }
      } catch (error) {
        console.error('登录失败:', error);
        wx.showToast({
          title: '登录失败，请重试',
          icon: 'none'
        });
      } finally {
        this.setData({ loading: false });
      }
    }
  }
}) 