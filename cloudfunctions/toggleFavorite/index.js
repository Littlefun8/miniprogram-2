// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: 'cloud1-3g3q2srz04d1d705' })
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { jobId } = event

  if (!jobId) {
    return { code: 400, message: '缺少职位ID' }
  }

  try {
    // 查询是否已收藏
    const exist = await db.collection('favorites')
      .where({ userId: openid, jobId })
      .limit(1)
      .get()

    if (exist.data && exist.data.length > 0) {
      // 已收藏 → 取消
      await db.collection('favorites').doc(exist.data[0]._id).remove()
      return { code: 200, data: { isFavorite: false }, message: '已取消收藏' }
    }

    // 未收藏 → 添加
    await db.collection('favorites').add({
      data: {
        userId: openid,
        jobId,
        createTime: db.serverDate()
      }
    })
    return { code: 200, data: { isFavorite: true }, message: '已收藏' }
  } catch (e) {
    return { code: 500, message: '操作失败', error: e }
  }
}
