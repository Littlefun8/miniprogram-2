// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: 'cloud1-3g3q2srz04d1d705' })
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { nickName, avatarUrl, profile } = event

  try {
    const userRes = await db.collection('users')
      .where({ _openid: openid })
      .limit(1)
      .get()

    if (!userRes.data || userRes.data.length === 0) {
      return { code: 404, message: '用户不存在' }
    }

    const userId = userRes.data[0]._id
    const updateData = { updateTime: db.serverDate() }

    // 只更新传了值的字段
    if (nickName !== undefined) updateData.nickName = nickName
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl
    if (profile !== undefined) updateData.profile = profile

    await db.collection('users').doc(userId).update({ data: updateData })

    return { code: 200, message: '资料更新成功' }
  } catch (e) {
    return { code: 500, message: '更新失败', error: e }
  }
}
