// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: 'cloud1-3g3q2srz04d1d705' })
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const userId = wxContext.OPENID
  const { status } = event
  try {
    let query = { userId }
    if (status && status !== 'all') {
      query.status = status
    }
    const res = await db.collection('applications').where(query).orderBy('applyDate', 'desc').get()
    return {
      code: 200,
      data: res.data
    }
  } catch (e) {
    return { code: 500, message: '获取申请进度失败', error: e }
  }
} 