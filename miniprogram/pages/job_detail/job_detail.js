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
        teacher: '老师陈国，软件学院讲师，近年授课课程包括《计算机网络》《软件工程》《需求工程》等。',
        students: [
          {
            name: '贾明',
            info: '学生贾明，软件工程223班，2023-2024学年《软件工程》课程成绩92分，平均加权成绩86分。',
            comment: '熟悉Java编程，踏实。'
          },
          {
            name: '刘晓',
            info: '学生刘晓，商务英语223班，无相关成绩，平均加权成绩95分。',
            comment: '辅修学生，好学。'
          }
        ]
      }
    },
    filteredStudents: [], // 存储根据用户身份过滤后的学生信息
    qrCodeUrl: '',
    isFavorite: false,
    showAssociation: false,
    showScreenshotInfo: false,
    screenshotUser: { name: '贾明', id: '2202203321' },
    screenshotInfo: { time: '' },
    recommenderNodes: '',
    isLoggedIn: false,
    userType: ''
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
    // 页面加载即显示职位ID，模拟唯一ID格式
    let jobId = options.id || this.data.jobId || '1';
    let displayJobId = 'JOB-' + jobId.padStart(4, '0');
    this.setData({
      screenshotInfo: Object.assign({}, this.data.screenshotInfo, { jobId: displayJobId })
    });
  },

  onShow() {
    const userType = wx.getStorageSync('userType');
    const isLoggedIn = wx.getStorageSync('isLoggedIn');
    this.setData({
      isLoggedIn: !!isLoggedIn,
      userType: userType || ''
    });
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

  // 展开关联信息
  expandAssociation() {
    if (!this.isLoggedIn()) {
      this.showLoginPrompt(() => this.expandAssociation());
      return;
    }
    
    // 根据用户身份过滤学生信息
    this.filterStudentsByUserType();
    
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
    
    // 调用后台API记录操作（统计展开关联信息行为）
    /*
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
    */
    wx.cloud.callFunction({
      name: 'recordUserAction',
      data: {
        jobId: this.data.jobId,
        action: 'expandAssociation',
        time: new Date().toISOString()
      }
    });
    wx.showToast({ title: '关联信息已展示', icon: 'success' });
  },
  
  // 根据用户身份过滤学生信息
  filterStudentsByUserType() {
    const userType = this.data.userType;
    const currentUserName = this.data.screenshotUser.name;
    let filteredStudents = [];
    
    if (userType === 'alumni' || userType === 'teacher') {
      // 校友和老师可以看到所有学生信息
      filteredStudents = this.data.jobDetail.association.students;
    } else if (userType === 'student') {
      // 学生只能看到自己的信息
      filteredStudents = this.data.jobDetail.association.students.filter(
        student => student.name === currentUserName
      );
    }
    
    this.setData({ filteredStudents: filteredStudents });
  },

  // 一键保存按钮逻辑，直接读取操作者信息，并进行后台统计
  saveAllInfo() {
    if (!this.isLoggedIn()) {
      this.showLoginPrompt(() => this.saveAllInfo());
      return;
    }
    const that = this;
    const { name, id } = this.data.screenshotUser;
    const now = new Date();
    const time = `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    const jobId = this.data.jobId || '1';
    let displayJobId = 'JOB-' + String(jobId).padStart(4, '0');
    that.setData({
      screenshotUser: { name, id },
      screenshotInfo: { time, jobId: displayJobId },
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
          wx.showToast({ title: '已保存至相册', icon: 'success' });
          // 调用后台API记录操作（统计一键保存行为）
          /*
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
          */
          wx.cloud.callFunction({
            name: 'recordUserAction',
            data: {
              jobId: jobId,
              action: 'saveAllInfo',
              time
            }
          });
        });
      }).exec();
    }, 500);
  },

  // 登录提示弹窗，点击"去登录"后弹出模拟登录身份选择
  showLoginPrompt(cb) {
    wx.showModal({
      title: '提示',
      content: '您尚未登录，请先登录后使用完整功能',
      confirmText: '去登录',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.simulateLogin(cb);
        }
      }
    });
  },

  // 判断是否已登录
  isLoggedIn() {
    return wx.getStorageSync('isLoggedIn');
  },

  // 模拟登录
  simulateLogin(cb) {
    wx.showActionSheet({
      itemList: ['校友', '老师', '学生'],
      success(res) {
        let userType = '';
        let role = '';
        if (res.tapIndex === 0) { userType = 'alumni'; role = '校友'; }
        if (res.tapIndex === 1) { userType = 'teacher'; role = '老师'; }
        if (res.tapIndex === 2) { userType = 'student'; role = '学生'; }
        let userInfo = wx.getStorageSync('userInfo') || {};
        userInfo.role = role;
        userInfo.nickName = role + '用户';
        userInfo.isVerified = true;
        wx.setStorageSync('userType', userType);
        wx.setStorageSync('isLoggedIn', true);
        wx.setStorageSync('userInfo', userInfo);
        wx.showToast({
          title: '已登录为' + role,
          icon: 'success'
        });
        if (typeof cb === 'function') setTimeout(cb, 300);
      },
      fail() {
        wx.showToast({ title: '请先登录', icon: 'none' });
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
    if (!this.isLoggedIn()) {
      this.showLoginPrompt(() => this.applyJob());
      return;
    }
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