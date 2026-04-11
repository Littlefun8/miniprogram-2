// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: 'cloud1-3g3q2srz04d1d705' })
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { pageNum = 1, pageSize = 10 } = event
  const skip = (pageNum - 1) * pageSize
  const limit = Math.min(pageSize, 20)

  try {
    const countRes = await db.collection('notifications')
      .where({ userId: openid })
      .count()

    const res = await db.collection('notifications')
      .where({ userId: openid })
      .orderBy('createTime', 'desc')
      .skip(skip)
      .limit(limit)
      .get()

    // 统计未读数
    const unreadRes = await db.collection('notifications')
      .where({ userId: openid, isRead: false })
      .count()

    return {
      code: 200,
      data: res.data,
      total: countRes.total,
      unreadCount: unreadRes.total,
      hasMore: skip + limit < countRes.total
    }
  } catch (e) {
    return { code: 500, message: '获取通知失败', error: e }
  }
}
