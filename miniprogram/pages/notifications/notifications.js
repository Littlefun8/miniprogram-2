// notifications.js - 通知列表
const auth = require('../../utils/auth.js')

const TYPE_META = {
  job_audit: { text: '职位审核', theme: 'primary' },
  application_status: { text: '申请进度', theme: 'warning' },
  new_application: { text: '新申请', theme: 'success' },
  system: { text: '系统消息', theme: 'default' }
}

Page({
  data: {
    notifications: [],
    isLoading: false,
    noMoreData: false,
    unreadCount: 0,
    pageNum: 1,
    pageSize: 10,
    hasTriedSeed: false
  },

  onLoad() {
    this.resetAndLoad()
  },

  onPullDownRefresh() {
    this.resetAndLoad()
    wx.stopPullDownRefresh()
  },

  onReachBottom() {
    this.loadNotifications()
  },

  resetAndLoad() {
    this.setData({ notifications: [], noMoreData: false, pageNum: 1 })
    this.loadNotifications()
  },

  loadNotifications() {
    if (this.data.isLoading || this.data.noMoreData) return
    this.setData({ isLoading: true })

    wx.cloud.callFunction({
      name: 'getNotifications',
      data: {
        pageNum: this.data.pageNum,
        pageSize: this.data.pageSize
      },
      success: res => {
        if (res.result.code === 200) {
          const list = (res.result.data || []).map(item => this.normalizeNotification(item))

          // 首次为空时尝试自动补齐演示通知，便于展示截图
          if (this.data.pageNum === 1 && list.length === 0 && !this.data.hasTriedSeed) {
            this.seedNotificationDemoThenReload()
            return
          }

          const mergedList = this.data.pageNum === 1
            ? list
            : this.data.notifications.concat(list)
          this.setData({
            notifications: mergedList,
            isLoading: false,
            noMoreData: !res.result.hasMore,
            unreadCount: res.result.unreadCount || 0,
            pageNum: this.data.pageNum + 1
          })
        } else {
          this.setData({ isLoading: false })
          wx.showToast({ title: res.result.message || '加载失败', icon: 'none' })
        }
      },
      fail: () => {
        this.setData({ isLoading: false })
        wx.showToast({ title: '加载失败', icon: 'none' })
      }
    })
  },

  normalizeNotification(item) {
    const typeMeta = TYPE_META[item.type] || TYPE_META.system
    const isRead = !!item.isRead
    return {
      ...item,
      title: item.title || '系统通知',
      content: item.content || '暂无通知内容',
      isRead,
      typeText: typeMeta.text,
      typeTheme: typeMeta.theme,
      statusText: isRead ? '已读' : '未读',
      displayTime: this.formatTime(item.createTime),
      canJump: !!item.relatedId,
      jumpText: item.relatedId ? '查看相关内容' : '仅查看详情'
    }
  },

  seedNotificationDemoThenReload() {
    const role = auth.getUserType()
    if (role !== 'teacher' && role !== 'admin' && role !== 'alumni') {
      this.setData({ isLoading: false, noMoreData: true })
      return
    }

    this.setData({ hasTriedSeed: true })
    wx.cloud.callFunction({
      name: 'seedDemoData',
      data: {},
      complete: () => {
        this.setData({ notifications: [], noMoreData: false, pageNum: 1, isLoading: false })
        this.loadNotifications()
      }
    })
  },

  formatTime(raw) {
    if (!raw) return ''
    if (typeof raw === 'string') return raw.replace('T', ' ').slice(0, 16)

    const date = raw instanceof Date ? raw : new Date(raw)
    if (Number.isNaN(date.getTime())) return ''

    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    const hh = String(date.getHours()).padStart(2, '0')
    const mm = String(date.getMinutes()).padStart(2, '0')
    return `${y}-${m}-${d} ${hh}:${mm}`
  },

  markNotificationRead(notificationId) {
    const db = wx.cloud.database()
    return db.collection('notifications').doc(notificationId).update({
      data: { isRead: true }
    })
  },

  onNotificationTap(e) {
    const notification = e.currentTarget.dataset.item
    if (!notification) return

    const showDetail = () => {
      wx.showModal({
        title: notification.title || '通知详情',
        content: notification.content || '暂无详情',
        confirmText: notification.relatedId ? '查看相关内容' : '关闭',
        cancelText: notification.relatedId ? '取消' : '关闭',
        success: (modalRes) => {
          if (modalRes.confirm && notification.relatedId) {
            this.navigateByNotification(notification)
          }
        }
      })
    }

    if (!notification.isRead) {
      this.markNotificationRead(notification._id)
        .then(() => {
          const idx = this.data.notifications.findIndex(n => n._id === notification._id)
          if (idx !== -1) {
            this.setData({
              [`notifications[${idx}].isRead`]: true,
              [`notifications[${idx}].statusText`]: '已读',
              unreadCount: Math.max(0, this.data.unreadCount - 1)
            })
          }
          showDetail()
        })
        .catch(() => {
          showDetail()
        })
      return
    }

    showDetail()
  },

  onNotificationJump(e) {
    const notification = e.currentTarget.dataset.item
    if (!notification || !notification.relatedId) {
      wx.showToast({ title: '暂无可跳转内容', icon: 'none' })
      return
    }

    const jump = () => this.navigateByNotification(notification)

    if (notification.isRead) {
      jump()
      return
    }

    this.markNotificationRead(notification._id)
      .then(() => {
        const idx = this.data.notifications.findIndex(n => n._id === notification._id)
        if (idx !== -1) {
          this.setData({
            [`notifications[${idx}].isRead`]: true,
            [`notifications[${idx}].statusText`]: '已读',
            unreadCount: Math.max(0, this.data.unreadCount - 1)
          })
        }
      })
      .finally(jump)
  },

  navigateByNotification(notification) {
    if (!notification.relatedId) return

    if (notification.type === 'job_audit') {
      wx.navigateTo({ url: `/pages/job_detail/job_detail?id=${notification.relatedId}` })
      return
    }

    if (notification.type === 'application_status' || notification.type === 'new_application') {
      wx.switchTab({ url: '/pages/application_progress/application_progress' })
      return
    }

    wx.showToast({ title: '暂无可跳转内容', icon: 'none' })
  },

  onMarkAllRead() {
    const unreadItems = this.data.notifications.filter(n => !n.isRead)
    if (unreadItems.length === 0) {
      wx.showToast({ title: '没有未读通知', icon: 'none' })
      return
    }

    const promises = unreadItems.map(n => this.markNotificationRead(n._id))
    Promise.all(promises).then(() => {
      wx.showToast({ title: '已全部标为已读', icon: 'success' })
      this.setData({
        notifications: this.data.notifications.map(n => ({
          ...n,
          isRead: true,
          statusText: '已读'
        })),
        unreadCount: 0
      })
    })
  }
})
