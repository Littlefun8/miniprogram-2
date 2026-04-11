// edit_profile.js - 用户资料编辑
const auth = require('../../utils/auth.js')

Page({
  data: {
    nickName: '',
    userType: '',
    roleLabel: '',
    profile: {},
    isSubmitting: false
  },

  onLoad() {
    const userType = auth.getUserType()
    const userInfo = auth.getUserInfo()
    const ROLE_LABELS = { student: '学生', alumni: '校友', teacher: '老师' }

    this.setData({
      nickName: userInfo.nickName || '',
      userType,
      roleLabel: ROLE_LABELS[userType] || '',
      profile: userInfo
    })
  },

  onNickNameChange(e) {
    this.setData({ nickName: e.detail.value })
  },

  // 学生特有字段
  onStudentNumberChange(e) {
    this.setData({ 'profile.studentNumber': e.detail.value })
  },
  onClassChange(e) {
    this.setData({ 'profile.class': e.detail.value })
  },
  onMajorChange(e) {
    this.setData({ 'profile.major': e.detail.value })
  },

  // 校友特有字段
  onGradYearChange(e) {
    this.setData({ 'profile.gradYear': e.detail.value })
  },
  onJobTitleChange(e) {
    this.setData({ 'profile.jobTitle': e.detail.value })
  },

  // 教师特有字段
  onDeptChange(e) {
    this.setData({ 'profile.dept': e.detail.value })
  },
  onTeacherTitleChange(e) {
    this.setData({ 'profile.teacherTitle': e.detail.value })
  },

  onSubmit() {
    if (this.data.isSubmitting) return
    if (!this.data.nickName.trim()) {
      wx.showToast({ title: '请输入昵称', icon: 'none' })
      return
    }

    this.setData({ isSubmitting: true })
    wx.showLoading({ title: '保存中' })

    const profile = {}
    // 根据角色收集对应字段
    if (this.data.userType === 'student') {
      profile.student = {
        studentNumber: this.data.profile.studentNumber || '',
        class: this.data.profile.class || '',
        major: this.data.profile.major || ''
      }
    } else if (this.data.userType === 'alumni') {
      profile.alumni = {
        gradYear: this.data.profile.gradYear || '',
        jobTitle: this.data.profile.jobTitle || ''
      }
    } else if (this.data.userType === 'teacher') {
      profile.teacher = {
        dept: this.data.profile.dept || '',
        title: this.data.profile.teacherTitle || ''
      }
    }

    wx.cloud.callFunction({
      name: 'updateProfile',
      data: {
        nickName: this.data.nickName,
        profile
      },
      success: res => {
        wx.hideLoading()
        this.setData({ isSubmitting: false })
        if (res.result.code === 200) {
          // 同步本地缓存
          let userInfo = auth.getUserInfo()
          userInfo.nickName = this.data.nickName
          auth.saveToLocal({ userType: this.data.userType, userInfo })
          wx.showToast({ title: '保存成功', icon: 'success' })
          setTimeout(() => wx.navigateBack(), 1000)
        } else {
          wx.showToast({ title: res.result.message || '保存失败', icon: 'none' })
        }
      },
      fail: () => {
        wx.hideLoading()
        this.setData({ isSubmitting: false })
        wx.showToast({ title: '保存失败', icon: 'none' })
      }
    })
  }
})
