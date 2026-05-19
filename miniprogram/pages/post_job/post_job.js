// post_job.js
const auth = require('../../utils/auth.js')

Page({
  data: {
    currentUserAvatar: '',
    userType: '',
    formData: {
      title: '',
      salary: '',
      company: '',
      location: '',
      description: '',
      requirements: '',
      recommenderComment: '',
      jobLink: '',
      referralCode: '',
      contactWechat: '',
      tags: [],
      publisherName: '',
      publisherType: '校友',
      expectedMajors: '',
      minGrade: ''
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

  onLoad() {
    const localUser = auth.getUserInfo() || {}
    const localUserType = auth.getUserType() || ''

    this.setData({
      userType: localUserType,
      currentUserAvatar: localUser.avatarUrl || '',
      'formData.publisherName': localUserType === 'teacher' ? '' : (localUser.nickName || ''),
      'formData.publisherType': '校友'
    })

    // 尝试从云端资料读取公司信息，读取失败不阻塞页面
    wx.cloud.callFunction({
      name: 'getUserProfile',
      data: {},
      success: res => {
        if (res.result && res.result.code === 200) {
          const userInfo = res.result.data && res.result.data.userInfo ? res.result.data.userInfo : {}
          const profile = userInfo.profile || {}
          const alumni = profile.alumni || {}
          const teacher = profile.teacher || {}
          const company = alumni.company || teacher.company || ''

          this.setData({
            currentUserAvatar: userInfo.avatarUrl || this.data.currentUserAvatar,
            'formData.publisherName': this.data.userType === 'teacher'
              ? this.data.formData.publisherName
              : (userInfo.nickName || this.data.formData.publisherName),
            'formData.company': company || this.data.formData.company,
            // 老师可代校友发布，统一展示“校友”
            'formData.publisherType': localUserType === 'teacher' ? '校友' : '校友'
          })
        }
      }
    })
  },

  onTap() {},

  onTitleChange(e) { this.setData({ 'formData.title': e.detail.value }) },
  onSalaryChange(e) { this.setData({ 'formData.salary': e.detail.value }) },
  onCompanyChange(e) { this.setData({ 'formData.company': e.detail.value }) },
  onRecommenderCommentChange(e) { this.setData({ 'formData.recommenderComment': e.detail.value }) },
  onDescriptionChange(e) { this.setData({ 'formData.description': e.detail.value }) },
  onRequirementsChange(e) { this.setData({ 'formData.requirements': e.detail.value }) },
  onJobLinkChange(e) { this.setData({ 'formData.jobLink': e.detail.value }) },
  onReferralCodeChange(e) { this.setData({ 'formData.referralCode': e.detail.value }) },
  onContactWechatChange(e) { this.setData({ 'formData.contactWechat': e.detail.value }) },
  onExpectedMajorsChange(e) { this.setData({ 'formData.expectedMajors': e.detail.value }) },
  onMinGradeChange(e) { this.setData({ 'formData.minGrade': e.detail.value }) },
  onPublisherNameChange(e) { this.setData({ 'formData.publisherName': e.detail.value }) },

  onTagSelect(e) {
    const tagValue = e.currentTarget.dataset.tag
    const tagOptions = [...this.data.tagOptions]
    const index = tagOptions.findIndex(item => item.value === tagValue)

    if (index === -1) return

    if (tagOptions[index].selected) {
      tagOptions[index].selected = false
      const tags = this.data.formData.tags.filter(tag => tag !== tagValue)
      this.setData({ 'formData.tags': tags, tagOptions })
      return
    }

    if (this.data.formData.tags.length >= 5) {
      wx.showToast({ title: '最多选择5个标签', icon: 'none' })
      return
    }

    tagOptions[index].selected = true
    this.setData({
      'formData.tags': [...this.data.formData.tags, tagValue],
      tagOptions
    })
  },

  onCitySelectChange(e) {
    const idx = e.detail.value
    this.setData({
      selectedCityIndex: idx,
      useCustomLocation: idx === 10
    })
  },

  onCustomLocationChange(e) {
    this.setData({ customLocation: e.detail.value })
  },

  onSubmit() {
    const { formData, useCustomLocation, customLocation, cityList, selectedCityIndex } = this.data
    const location = useCustomLocation ? customLocation : cityList[selectedCityIndex]

    if (!formData.title) return this.showError('请输入职位名称')
    if (!formData.salary) return this.showError('请输入薪资范围')
    if (!location) return this.showError('请选择工作地点')
    if (!formData.tags.length) return this.showError('请至少选择一个标签')
    if (!formData.recommenderComment) return this.showError('请填写内推者有话说')
    if (!formData.description) return this.showError('请输入岗位职责')
    if (!formData.requirements) return this.showError('请输入任职要求')
    if (!formData.jobLink) return this.showError('请填写岗位链接或投递方式')
    if (!formData.company) return this.showError('请输入所属公司')
    if (this.data.userType === 'teacher' && !formData.publisherName) {
      return this.showError('老师代发布时请填写发布人姓名')
    }

    wx.showLoading({ title: '提交中' })

    wx.cloud.callFunction({
      name: 'postJob',
      data: {
        title: formData.title,
        salary: formData.salary,
        company: formData.company,
        location,
        tags: formData.tags,
        description: formData.description,
        requirements: formData.requirements,
        recommenderComment: formData.recommenderComment,
        jobLink: formData.jobLink,
        referralCode: formData.referralCode || '',
        contactWechat: formData.contactWechat || '',
        publisherName: formData.publisherName,
        expectedMajors: formData.expectedMajors || '',
        minGrade: formData.minGrade || ''
      },
      success: res => {
        wx.hideLoading()
        if (res.result && res.result.code === 200) {
          wx.showToast({
            title: '职位发布成功，等待审核',
            icon: 'success',
            duration: 1800
          })
          setTimeout(() => wx.navigateBack(), 1800)
        } else {
          wx.showToast({ title: (res.result && res.result.message) || '发布失败', icon: 'none' })
        }
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({ title: '发布失败', icon: 'none' })
      }
    })
  },

  showError(message) {
    wx.showToast({ title: message, icon: 'none' })
  }
})
