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
      recommenderMessage: '好处：\n进来能把扫地机这个品类从头到尾摸透，后续跳槽转其他智能硬件方向会很顺;\n项目类型多、机会多，能够迅速成长;\n但也真诚说下劝退项：\n工作强度很大;项目较多;压力较大',
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
    showAssociation: false,
    showScreenshotInfo: false,
    screenshotUser: { name: '贾明', id: '2202203321' },
    screenshotInfo: { time: '' },
    recommenderNodes: ''
  },

  onLoad(options) {
    if (options.id) {
      this.setData({
        jobId: options.id
      });
      this.getJobDetail(options.id);
    }
    // 处理内推者想说内容为 rich-text nodes
    const msg = this.data.jobDetail.recommenderMessage;
    const html = msg.replace(/\n/g, '<br/>');
    this.setData({ recommenderNodes: html });
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

  // 扫描二维码按钮直接展开关联信息并后台记录
  expandAssociation() {
    this.setData({ showAssociation: true });
    setTimeout(() => {
      wx.createSelectorQuery().select('.container').boundingClientRect(rect => {
        if (rect) {
          wx.pageScrollTo({
            scrollTop: rect.height,
            duration: 300
          });
        }
      }).exec();
    }, 100);
    // 调用后台API记录操作
    wx.request({
      url: 'https://your-backend-api/record',
      method: 'POST',
      data: {
        userId: this.data.screenshotUser.id || '未填写',
        jobId: this.data.jobId,
        action: 'expandAssociation',
        time: new Date().toISOString()
      }
    });
    wx.showToast({ title: '关联信息已展示', icon: 'success' });
  },

  // 一键保存按钮逻辑，直接读取操作者信息
  saveAllInfo() {
    const that = this;
    const { name, id } = this.data.screenshotUser;
    const now = new Date();
    const time = `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    const jobId = this.data.jobId;
    that.setData({
      screenshotUser: { name, id },
      screenshotInfo: { time, jobId },
      showScreenshotInfo: true
    });
    setTimeout(() => {
      wx.createSelectorQuery().select('.container').boundingClientRect(rect => {
        if (rect) {
          wx.pageScrollTo({
            scrollTop: rect.height,
            duration: 300
          });
        }
      }).exec();
    }, 100);
    // 延迟确保渲染完成
    setTimeout(() => {
      wx.createSelectorQuery().select('.container').boundingClientRect(rect => {
        wx.createSelectorQuery().select('.container').node().exec(res2 => {
          // 这里只做模拟
          wx.showToast({ title: '已保存至相册', icon: 'success' });
          // 调用后台API记录操作
          wx.request({
            url: 'https://your-backend-api/record',
            method: 'POST',
            data: {
              userId: id,
              jobId: jobId,
              action: 'saveAllInfo',
              time
            }
          });
        });
      }).exec();
    }, 500);
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