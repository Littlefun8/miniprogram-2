// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: 'cloud1-3g3q2srz04d1d705' })
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { status, pageNum = 1, pageSize = 10 } = event
  const skip = (pageNum - 1) * pageSize
  const limit = Math.min(pageSize, 20)

  try {
    let query = { userId: openid }
    if (status && status !== 'all') {
      query.status = status
    }

    // 查询总数
    const countRes = await db.collection('applications').where(query).count()
    const total = countRes.total

    const res = await db.collection('applications')
      .where(query)
      .orderBy('applyDate', 'desc')
      .skip(skip)
      .limit(limit)
      .get()

    return {
      code: 200,
      data: res.data,
      total,
      hasMore: skip + limit < total
    }
  } catch (e) {
    return { code: 500, message: '获取申请进度失败', error: e }
  }
} 