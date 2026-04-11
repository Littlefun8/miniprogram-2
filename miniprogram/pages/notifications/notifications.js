// notifications.js - 通知列表
const auth = require('../../utils/auth.js')

Page({
  data: {
    notifications: [],
    isLoading: false,
    noMoreData: false,
    unreadCount: 0
  },

  onLoad() {
    this.loadNotifications()
  },

  onPullDownRefresh() {
    this.setData({ notifications: [], noMoreData: false })
    this.loadNotifications()
    wx.stopPullDownRefresh()
  },

  loadNotifications() {
    if (this.data.isLoading) return
    this.setData({ isLoading: true })

    wx.cloud.callFunction({
      name: 'getNotifications',
      data: { pageNum: 1, pageSize: 20 },
      success: res => {
        if (res.result.code === 200) {
          this.setData({
            notifications: res.result.data,
            isLoading: false,
            noMoreData: !res.result.hasMore,
            unreadCount: res.result.unreadCount || 0
          })
        } else {
          this.setData({ isLoading: false })
        }
      },
      fail: () => {
        this.setData({ isLoading: false })
        wx.showToast({ title: '加载失败', icon: 'none' })
      }
    })
  },

  // 点击通知
  onNotificationTap(e) {
    const notification = e.currentTarget.dataset.item
    if (!notification) return

    // 标记已读
    if (!notification.isRead) {
      const db = wx.cloud.database()
      db.collection('notifications').doc(notification._id).update({
        data: { isRead: true }
      })
      // 本地更新状态
      const idx = this.data.notifications.findIndex(n => n._id === notification._id)
      if (idx !== -1) {
        this.setData({
          [`notifications[${idx}].isRead`]: true,
          unreadCount: Math.max(0, this.data.unreadCount - 1)
        })
      }
    }

    // 根据通知类型跳转
    if (notification.relatedId) {
      if (notification.type === 'job_audit') {
        wx.navigateTo({ url: '/pages/job_detail/job_detail?id=' + notification.relatedId })
      } else if (notification.type === 'application_status') {
        wx.navigateTo({ url: '/pages/job_detail/job_detail?id=' + notification.relatedId })
      }
    }
  },

  // 全部标为已读
  onMarkAllRead() {
    const db = wx.cloud.database()
    const promises = this.data.notifications
      .filter(n => !n.isRead)
      .map(n => db.collection('notifications').doc(n._id).update({ data: { isRead: true } }))

    if (promises.length === 0) {
      wx.showToast({ title: '没有未读通知', icon: 'none' })
      return
    }

    Promise.all(promises).then(() => {
      wx.showToast({ title: '已全部标为已读', icon: 'success' })
      this.setData({
        notifications: this.data.notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0
      })
    })
  }
})
