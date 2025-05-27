// post_job.js
Page({
  data: {
    formData: {
      title: '',
      salary: '',
      company: '',
      location: '',
      description: '',
      tags: [],
      link: '',
      recommenderMessage: ''
    },
    customTag: '',
    qrCodeUrl: '',
    tagOptions: [
      { id: 1, name: '前端开发', selected: false },
      { id: 2, name: '后端开发', selected: false },
      { id: 3, name: 'UI设计', selected: false },
      { id: 4, name: '产品经理', selected: false },
      { id: 5, name: '运营', selected: false },
      { id: 6, name: '数据分析', selected: false },
      { id: 7, name: '人工智能', selected: false },
      { id: 8, name: '测试', selected: false },
      { id: 9, name: '运维', selected: false },
      { id: 10, name: '全栈开发', selected: false },
      { id: 11, name: '项目经理', selected: false },
      { id: 12, name: '销售', selected: false }
    ]
  },

  // 表单输入变化处理函数
  onTitleChange(e) {
    this.setData({
      'formData.title': e.detail.value
    });
  },

  onSalaryChange(e) {
    this.setData({
      'formData.salary': e.detail.value
    });
  },

  onCompanyChange(e) {
    this.setData({
      'formData.company': e.detail.value
    });
  },

  onLocationChange(e) {
    this.setData({
      'formData.location': e.detail.value
    });
  },

  onDescriptionChange(e) {
    this.setData({
      'formData.description': e.detail.value
    });
  },

  onLinkChange(e) {
    this.setData({
      'formData.link': e.detail.value
    });
  },

  onRecommenderMessageChange(e) {
    this.setData({
      'formData.recommenderMessage': e.detail.value
    });
  },

  // 标签相关处理函数
  onTagSelect(e) {
    const id = e.currentTarget.dataset.id;
    const tagOptions = this.data.tagOptions;
    const index = tagOptions.findIndex(item => item.id === id);
    
    if (index !== -1) {
      // 如果标签已选中，则取消选中
      if (tagOptions[index].selected) {
        tagOptions[index].selected = false;
        
        // 从已选标签中移除
        const tagName = tagOptions[index].name;
        const tagIndex = this.data.formData.tags.indexOf(tagName);
        if (tagIndex !== -1) {
          const tags = [...this.data.formData.tags];
          tags.splice(tagIndex, 1);
          
          this.setData({
            'formData.tags': tags,
            tagOptions: tagOptions
          });
        }
      } 
      // 如果标签未选中且未达到上限，则选中
      else if (this.data.formData.tags.length < 5) {
        tagOptions[index].selected = true;
        
        this.setData({
          'formData.tags': [...this.data.formData.tags, tagOptions[index].name],
          tagOptions: tagOptions
        });
      } 
      // 如果已达到上限，提示用户
      else {
        wx.showToast({
          title: '最多选择5个标签',
          icon: 'none'
        });
      }
    }
  },

  onCustomTagChange(e) {
    this.setData({
      customTag: e.detail.value
    });
  },

  onAddCustomTag() {
    const { customTag, formData } = this.data;
    
    if (!customTag.trim()) {
      wx.showToast({
        title: '标签不能为空',
        icon: 'none'
      });
      return;
    }
    
    if (formData.tags.length >= 5) {
      wx.showToast({
        title: '最多选择5个标签',
        icon: 'none'
      });
      return;
    }
    
    if (formData.tags.includes(customTag.trim())) {
      wx.showToast({
        title: '标签已存在',
        icon: 'none'
      });
      return;
    }
    
    this.setData({
      'formData.tags': [...formData.tags, customTag.trim()],
      customTag: ''
    });
  },

  onTagClose(e) {
    const index = e.currentTarget.dataset.index;
    const tags = [...this.data.formData.tags];
    const removedTag = tags[index];
    
    // 从已选标签中移除
    tags.splice(index, 1);
    
    // 更新预设标签的选中状态
    const tagOptions = this.data.tagOptions.map(tag => {
      if (tag.name === removedTag) {
        return { ...tag, selected: false };
      }
      return tag;
    });
    
    this.setData({
      'formData.tags': tags,
      tagOptions: tagOptions
    });
  },

  // 二维码相关处理函数
  uploadQrCode() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        
        // 实际项目中应该上传图片到服务器
        // 这里仅做本地展示
        this.setData({
          qrCodeUrl: tempFilePath
        });
      }
    });
  },

  removeQrCode() {
    this.setData({
      qrCodeUrl: ''
    });
  },

  // 表单提交和取消
  onSubmit() {
    const { formData, qrCodeUrl } = this.data;
    
    // 表单验证
    if (!formData.title) {
      this.showError('请输入职位名称');
      return;
    }
    
    if (!formData.salary) {
      this.showError('请输入薪资范围');
      return;
    }
    
    if (!formData.company) {
      this.showError('请输入公司名称');
      return;
    }
    
    if (!formData.location) {
      this.showError('请输入工作地点');
      return;
    }
    
    if (!formData.description) {
      this.showError('请输入职位描述');
      return;
    }
    
    if (formData.tags.length === 0) {
      this.showError('请至少选择一个标签');
      return;
    }
    
    if (!formData.link) {
      this.showError('请输入职位链接');
      return;
    }
    
    if (!qrCodeUrl) {
      this.showError('请上传二维码');
      return;
    }
    
    // 提交表单
    wx.showLoading({
      title: '提交中',
      mask: true
    });
    
    // 实际项目中应该调用API提交表单
    // 这里使用模拟数据
    setTimeout(() => {
      wx.hideLoading();
      
      wx.showToast({
        title: '发布成功',
        icon: 'success',
        duration: 2000,
        success: () => {
          // 延迟返回上一页
          setTimeout(() => {
            wx.navigateBack();
          }, 2000);
        }
      });
    }, 1500);
  },

  onCancel() {
    wx.showModal({
      title: '确认取消',
      content: '是否放弃当前编辑的内容？',
      confirmText: '确认放弃',
      success: (res) => {
        if (res.confirm) {
          wx.navigateBack();
        }
      }
    });
  },

  // 辅助函数
  showError(message) {
    wx.showToast({
      title: message,
      icon: 'error'
    });
  }
}) 