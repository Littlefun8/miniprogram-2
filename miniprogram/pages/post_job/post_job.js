// post_job.js
Page({
  data: {
    formData: {
      title: '',
      salary: '',
      company: '',
      location: '',
      recommenderComment: '',
      jobLink: '',
      tags: [],
      publisherName: '',
      publisherType: '校友',
      reviewerName: '待审核'
    },
    tagOptions: [
      { label: 'React', value: 'React', selected: false },
      { label: 'Vue', value: 'Vue', selected: false },
      { label: 'Angular', value: 'Angular', selected: false },
      { label: '小程序', value: '小程序', selected: false },
      { label: 'Flutter', value: 'Flutter', selected: false },
      { label: 'Java', value: 'Java', selected: false },
      { label: 'Python', value: 'Python', selected: false },
      { label: 'GO', value: 'GO', selected: false },
      { label: '云计算', value: '云计算', selected: false },
      { label: '大数据', value: '大数据', selected: false },
      { label: '人工智能', value: '人工智能', selected: false },
      { label: '区块链', value: '区块链', selected: false }
    ],
    isPublisherDropdownOpen: false,
    cityList: ['北京', '上海', '广州', '深圳', '杭州', '南京', '成都', '武汉', '西安', '线上', '自定义'],
    cityOptions: [
      { label: '北京', value: 0 },
      { label: '上海', value: 1 },
      { label: '广州', value: 2 },
      { label: '深圳', value: 3 },
      { label: '杭州', value: 4 },
      { label: '南京', value: 5 },
      { label: '成都', value: 6 },
      { label: '武汉', value: 7 },
      { label: '西安', value: 8 },
      { label: '线上', value: 9 },
      { label: '自定义', value: 10 }
    ],
    selectedCityIndex: 0,
    customLocation: '',
    useCustomLocation: false
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

  onRecommenderCommentChange(e) {
    this.setData({
      'formData.recommenderComment': e.detail.value
    });
  },

  onJobLinkChange(e) {
    this.setData({
      'formData.jobLink': e.detail.value
    });
  },

  onPublisherNameChange(e) {
    this.setData({
      'formData.publisherName': e.detail.value
    });
  },

  // 自定义下拉选择器处理函数
  togglePublisherDropdown() {
    this.setData({
      isPublisherDropdownOpen: !this.data.isPublisherDropdownOpen
    });
  },

  onPublisherTypeSelect(e) {
    const value = e.currentTarget.dataset.value;
    this.setData({
      'formData.publisherType': value,
      isPublisherDropdownOpen: false
    });
  },

  // 点击页面其他区域关闭下拉框
  onTap() {
    if (this.data.isPublisherDropdownOpen) {
      this.setData({
        isPublisherDropdownOpen: false
      });
    }
  },

  // 标签选择处理函数
  onTagSelect(e) {
    const tagValue = e.currentTarget.dataset.tag;
    const tagOptions = [...this.data.tagOptions];
    const index = tagOptions.findIndex(item => item.value === tagValue);
    
    if (index !== -1) {
      // 如果标签已选中，则取消选中
      if (tagOptions[index].selected) {
        tagOptions[index].selected = false;
        
        // 从已选标签中移除
        const tags = this.data.formData.tags.filter(tag => tag !== tagValue);
        
        this.setData({
          'formData.tags': tags,
          tagOptions
        });
      } 
      // 如果标签未选中且未达到上限，则选中
      else if (this.data.formData.tags.length < 5) {
        tagOptions[index].selected = true;
        
        this.setData({
          'formData.tags': [...this.data.formData.tags, tagValue],
          tagOptions
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

  onCitySelectChange(e) {
    const idx = e.detail.value;
    this.setData({
      selectedCityIndex: idx,
      useCustomLocation: idx === 10 // 10为"自定义"
    });
  },

  onCustomLocationChange(e) {
    this.setData({
      customLocation: e.detail.value
    });
  },

  // 表单提交
  onSubmit() {
    const { formData, useCustomLocation, customLocation, cityList, selectedCityIndex } = this.data;
    const location = useCustomLocation ? customLocation : cityList[selectedCityIndex];
    
    // 表单验证
    if (!formData.title) {
      this.showError('请输入职位名称');
      return;
    }
    
    if (!formData.salary) {
      this.showError('请输入薪资范围');
      return;
    }
    
    if (!location) {
      this.showError('请选择工作地点');
      return;
    }
    
    if (formData.tags.length === 0) {
      this.showError('请至少选择一个标签');
      return;
    }
    
    if (!formData.recommenderComment) {
      this.showError('请输入内推者想说的内容');
      return;
    }
    
    if (!formData.jobLink) {
      this.showError('请输入岗位详情链接');
      return;
    }
    
    if (!formData.company) {
      this.showError('请输入所属公司');
      return;
    }
    
    if (!formData.publisherName) {
      this.showError('请输入发布人姓名');
      return;
    }
    
    // 提交表单
    wx.showLoading({
      title: '提交中',
    });
    
    // 模拟提交
    setTimeout(() => {
      wx.hideLoading();
      
      // 提交成功后的处理
      wx.showToast({
        title: '职位发布成功',
        icon: 'success',
        duration: 2000,
        success: () => {
          // 延迟导航，确保提示显示完成
          setTimeout(() => {
            wx.navigateBack();
          }, 2000);
        }
      });
    }, 1500);
  },
  
  // 错误提示
  showError(message) {
    wx.showToast({
      title: message,
      icon: 'error',
      duration: 2000
    });
  }
}); 
