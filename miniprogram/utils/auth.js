/**
 * auth.js - 统一登录鉴权模块
 * 替换所有页面中的 simulateLogin 重复代码
 */

const ROLE_LABELS = { student: '学生', alumni: '校友', teacher: '老师' }
const ROLE_OPTIONS = [
  { userType: 'alumni', label: '校友' },
  { userType: 'teacher', label: '老师' },
  { userType: 'student', label: '学生' }
]

/**
 * 调用 login 云函数，获取/注册用户信息
 * @returns {Promise<Object>} { code, data: { userId, nickName, avatarUrl, userType, ... } }
 */
function login() {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'login',
      success: res => resolve(res.result),
      fail: err => reject(err)
    })
  })
}

/**
 * 调用 setUserRole 云函数设置角色（一次性）
 * @param {string} userType - 'student' | 'alumni' | 'teacher'
 * @returns {Promise<Object>} { code, data: { userType, roleLabel } }
 */
function setUserRole(userType) {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'setUserRole',
      data: { userType },
      success: res => resolve(res.result),
      fail: err => reject(err)
    })
  })
}

/**
 * 读取本地登录状态
 * @returns {boolean}
 */
function isLoggedIn() {
  return !!wx.getStorageSync('isLoggedIn')
}

/**
 * 读取本地用户类型
 * @returns {string} 'student' | 'alumni' | 'teacher' | ''
 */
function getUserType() {
  return wx.getStorageSync('userType') || ''
}

/**
 * 读取本地用户信息
 * @returns {Object}
 */
function getUserInfo() {
  return wx.getStorageSync('userInfo') || {}
}

/**
 * 将登录状态同步写入本地缓存
 * @param {Object} param
 * @param {string} param.userType
 * @param {Object} param.userInfo
 */
function saveToLocal({ userType, userInfo }) {
  wx.setStorageSync('isLoggedIn', true)
  wx.setStorageSync('userType', userType)
  wx.setStorageSync('userInfo', userInfo)
}

/**
 * 清除本地登录状态
 */
function logout() {
  wx.removeStorageSync('isLoggedIn')
  wx.removeStorageSync('userType')
  wx.removeStorageSync('userInfo')
}

/**
 * 将云函数 login 返回的用户数据映射为页面 data 所需结构
 * @param {Object} cloudData - login 云函数返回的 data
 * @returns {Object} { userType, userInfo }
 */
function mapCloudUserToLocal(cloudData) {
  const userType = cloudData.userType || ''
  const role = ROLE_LABELS[userType] || '游客'
  return {
    userType,
    userInfo: {
      avatarUrl: cloudData.avatarUrl || '',
      nickName: cloudData.nickName || (role + '用户'),
      isVerified: cloudData.isVerified || false,
      role: role
    }
  }
}

/**
 * 静默登录：app.js onLaunch 时调用，不弹任何 UI
 * 成功后自动写入本地缓存
 * @returns {Promise<Object>} 用户信息
 */
function silentLogin() {
  return login().then(res => {
    if (res.code === 200) {
      const { userType, userInfo } = mapCloudUserToLocal(res.data)
      saveToLocal({ userType, userInfo })
      return { userType, userInfo }
    }
    return null
  }).catch(err => {
    console.error('silentLogin failed:', err)
    return null
  })
}

/**
 * 交互式登录：弹出 ActionSheet 选择角色，调用云函数设置
 * 替换各页面中的 simulateLogin
 * @param {Function} onSuccess - 登录成功回调，参数 { userType, userInfo }
 */
function interactiveLogin(onSuccess) {
  wx.showActionSheet({
    itemList: ROLE_OPTIONS.map(r => r.label),
    success(res) {
      const chosen = ROLE_OPTIONS[res.tapIndex]
      if (!chosen) return

      wx.showLoading({ title: '登录中', mask: true })

      // 先确保用户已注册
      login().then(loginRes => {
        if (loginRes.code !== 200) {
          wx.hideLoading()
          wx.showToast({ title: '登录失败', icon: 'none' })
          return
        }

        // 如果已有角色，直接使用
        if (loginRes.data.userType) {
          const { userType, userInfo } = mapCloudUserToLocal(loginRes.data)
          saveToLocal({ userType, userInfo })
          wx.hideLoading()
          wx.showToast({ title: '已登录为' + userInfo.role, icon: 'success' })
          if (typeof onSuccess === 'function') onSuccess({ userType, userInfo })
          return
        }

        // 新用户：设置角色
        setUserRole(chosen.userType).then(roleRes => {
          wx.hideLoading()
          if (roleRes.code === 200) {
            const { userType, userInfo } = mapCloudUserToLocal({
              ...loginRes.data,
              userType: chosen.userType
            })
            saveToLocal({ userType, userInfo })
            wx.showToast({ title: '已登录为' + chosen.label, icon: 'success' })
            if (typeof onSuccess === 'function') onSuccess({ userType, userInfo })
          } else {
            wx.showToast({ title: roleRes.message || '设置角色失败', icon: 'none' })
          }
        }).catch(() => {
          wx.hideLoading()
          wx.showToast({ title: '设置角色失败', icon: 'none' })
        })
      }).catch(() => {
        wx.hideLoading()
        wx.showToast({ title: '登录失败', icon: 'none' })
      })
    },
    fail() {
      // 用户取消选择
    }
  })
}

/**
 * 统一的登录提示弹窗
 * @param {Function} onLoginSuccess - 登录成功后回调
 */
function showLoginPrompt(onLoginSuccess) {
  wx.showModal({
    title: '提示',
    content: '您尚未登录，请先登录后使用完整功能',
    confirmText: '去登录',
    cancelText: '取消',
    success: (res) => {
      if (res.confirm) {
        interactiveLogin(onLoginSuccess)
      }
    }
  })
}

module.exports = {
  login,
  setUserRole,
  isLoggedIn,
  getUserType,
  getUserInfo,
  saveToLocal,
  logout,
  mapCloudUserToLocal,
  silentLogin,
  interactiveLogin,
  showLoginPrompt,
  ROLE_LABELS
}
