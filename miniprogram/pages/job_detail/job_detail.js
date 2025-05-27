// job_detail.js
Page({
  data: {
    jobId: '',
    jobDetail: {
      title: '前端开发工程师',
      salary: '15K-25K',
      location: '北京市朝阳区',
      date: '2024-03-20',
      tags: ['React', 'Vue', '小程序'],
      recommenderMessage: '这是一个非常好的前端开发岗位，公司技术氛围浓厚，福利待遇优厚，有兴趣的同学可以联系我详聊。',
      link: 'https://example.com/job/12345',
      publisher: {
        avatar: '',
        name: '姚经理',
        tag: '校友'
      },
      reviewer: {
        avatar: '',
        name: '张教授',
        tag: '老师'
      },
      association: {
        teacher: '张教授 - 计算机科学与技术学院',
        students: [
          {
            name: '李同学',
            info: '李同学 - 2020级计算机科学与技术专业',
            comment: '该学生在我的课堂上表现优秀，有很强的学习能力和团队协作精神。'
          }
        ]
      }
    },
    qrCodeUrl: '',
    isFavorite: false,
    showAssociation: false
  },

  onLoad(options) {
    if (options.id) {
      this.setData({
        jobId: options.id
      });
      this.getJobDetail(options.id);
    }
  },

  // 获取职位详情
  getJobDetail(id) {
    // 实际项目中应该调用API获取职位详情
    // 这里使用模拟数据
    wx.showLoading({
      title: '加载中',
      mask: true
    });

    // 模拟API请求
    setTimeout(() => {
      // 生成二维码（实际项目中应该通过API获取）
      this.generateQrCode();
      
      wx.hideLoading();
    }, 1000);
  },

  // 生成二维码
  generateQrCode() {
    // 实际项目中应该调用API生成二维码
    // 这里使用模拟数据
    const qrCodeUrl = 'https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/qr-code.html';
    
    this.setData({
      qrCodeUrl: qrCodeUrl
    });
  },

  // 复制链接
  copyLink() {
    wx.setClipboardData({
      data: this.data.jobDetail.link,
      success: () => {
        wx.showToast({
          title: '链接已复制',
          icon: 'success'
        });
      }
    });
  },

  // 扫描二维码
  scanQrCode() {
    wx.scanCode({
      success: (res) => {
        console.log('扫码结果：', res);
        // 根据扫码结果处理逻辑
        this.setData({
          showAssociation: true
        });
        
        wx.showToast({
          title: '关联信息已展示',
          icon: 'success'
        });
      },
      fail: () => {
        wx.showToast({
          title: '扫码失败',
          icon: 'none'
        });
      }
    });
  },

  // 保存二维码
  saveQrCode() {
    if (!this.data.qrCodeUrl) {
      wx.showToast({
        title: '二维码不存在',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '保存中',
      mask: true
    });

    // 下载二维码
    wx.downloadFile({
      url: this.data.qrCodeUrl,
      success: (res) => {
        if (res.statusCode === 200) {
          // 保存到相册
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: () => {
              wx.hideLoading();
              wx.showToast({
                title: '已保存到相册',
                icon: 'success'
              });
            },
            fail: () => {
              wx.hideLoading();
              wx.showToast({
                title: '保存失败',
                icon: 'none'
              });
            }
          });
        } else {
          wx.hideLoading();
          wx.showToast({
            title: '下载失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({
          title: '下载失败',
          icon: 'none'
        });
      }
    });
  },

  // 收藏/取消收藏
  toggleFavorite() {
    const isFavorite = !this.data.isFavorite;
    
    this.setData({
      isFavorite: isFavorite
    });

    wx.showToast({
      title: isFavorite ? '已收藏' : '已取消收藏',
      icon: 'success'
    });

    // 实际项目中应该调用API更新收藏状态
  },

  // 申请职位
  applyJob() {
    wx.showModal({
      title: '申请确认',
      content: '确定要申请该职位吗？',
      confirmText: '确定申请',
      success: (res) => {
        if (res.confirm) {
          // 实际项目中应该调用API提交申请
          wx.showLoading({
            title: '提交中',
            mask: true
          });

          // 模拟API请求
          setTimeout(() => {
            wx.hideLoading();
            wx.showToast({
              title: '申请成功',
              icon: 'success'
            });
          }, 1500);
        }
      }
    });
  },

  // 分享
  onShareAppMessage() {
    return {
      title: this.data.jobDetail.title,
      path: '/pages/job/job_detail?id=' + this.data.jobId,
      imageUrl: this.data.qrCodeUrl || ''
    };
  }
}) 