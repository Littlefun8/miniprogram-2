// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: 'cloud1-3g3q2srz04d1d705' })
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  try {
    // 按 OPENID 查询用户
    const userRes = await db.collection('users')
      .where({ _openid: openid })
      .limit(1)
      .get()

    if (userRes.data && userRes.data.length > 0) {
      // 已有记录，返回完整信息
      const user = userRes.data[0]
      return {
        code: 200,
        data: {
          userId: user._id,
          _openid: user._openid,
          nickName: user.nickName || '',
          avatarUrl: user.avatarUrl || '',
          userType: user.userType || '',
          isVerified: user.isVerified || false,
          profile: user.profile || {},
          createTime: user.createTime
        },
        message: '登录成功'
      }
    }

    // 新用户，自动注册
    const now = db.serverDate()
    const newUser = {
      _openid: openid,
      nickName: '',
      avatarUrl: '',
      userType: '',
      isVerified: false,
      profile: {},
      createTime: now,
      updateTime: now
    }

    const addRes = await db.collection('users').add({ data: newUser })

    return {
      code: 200,
      data: {
        userId: addRes._id,
        _openid: openid,
        nickName: '',
        avatarUrl: '',
        userType: '',
        isVerified: false,
        profile: {},
        createTime: now
      },
      message: '注册成功'
    }
  } catch (e) {
    return { code: 500, message: '登录失败', error: e }
  }
}
