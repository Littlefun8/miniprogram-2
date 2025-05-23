// detail.ts
interface JobDetail {
  id: string;
  title: string;
  salary: string;
  company: string;
  companyLogo: string;
  companyDesc: string;
  location: string;
  locationDetail: string;
  latitude: number;
  longitude: number;
  tags: string[];
  description: string;
  requirements: string;
  publishTime: string;
  publisher: string;
  publisherType: string;
}

Component({
  data: {
    jobDetail: {} as JobDetail,
    markers: [] as any[],
    applying: false
  },

  lifetimes: {
    attached() {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const { id } = currentPage.options;
      
      if (id) {
        this.loadJobDetail(id);
      } else {
        wx.showToast({
          title: '参数错误',
          icon: 'error'
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      }
    }
  },

  methods: {
    // 加载职位详情
    async loadJobDetail(id: string) {
      try {
        wx.showLoading({ title: '加载中' });
        
        const res = await wx.cloud.callFunction({
          name: 'getJobDetail',
          data: { id }
        });

        const jobDetail = res.result as JobDetail;
        
        // 设置地图标记
        const markers = [{
          id: 1,
          latitude: jobDetail.latitude,
          longitude: jobDetail.longitude,
          title: jobDetail.company,
          iconPath: '/assets/images/marker.png',
          width: 32,
          height: 32
        }];

        this.setData({
          jobDetail,
          markers
        });
      } catch (error) {
        console.error('加载职位详情失败:', error);
        wx.showToast({
          title: '加载失败，请重试',
          icon: 'none'
        });
      } finally {
        wx.hideLoading();
      }
    },

    // 申请职位
    async onApplyTap() {
      if (this.data.applying) return;
      
      try {
        this.setData({ applying: true });
        
        // 检查用户是否登录
        const { userInfo } = await wx.getStorageSync('userInfo');
        if (!userInfo) {
          wx.showModal({
            title: '提示',
            content: '请先登录后再申请职位',
            confirmText: '去登录',
            success: (res) => {
              if (res.confirm) {
                wx.navigateTo({
                  url: '/pages/login/login'
                });
              }
            }
          });
          return;
        }

        // 调用申请接口
        await wx.cloud.callFunction({
          name: 'applyJob',
          data: {
            jobId: this.data.jobDetail.id
          }
        });

        wx.showToast({
          title: '申请成功',
          icon: 'success'
        });
      } catch (error) {
        console.error('申请职位失败:', error);
        wx.showToast({
          title: '申请失败，请重试',
          icon: 'none'
        });
      } finally {
        this.setData({ applying: false });
      }
    }
  }
}) 