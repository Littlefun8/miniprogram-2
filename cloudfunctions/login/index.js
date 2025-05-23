// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { userInfo, userType } = event
  const wxContext = cloud.getWXContext()
  const userId = wxContext.OPENID

  try {
    // 检查用户是否已存在
    const user = await db.collection('users')
      .doc(userId)
      .get()
      .then(res => res.data)
      .catch(() => null)

    if (user) {
      // 更新用户信息
      await db.collection('users').doc(userId).update({
        data: {
          ...userInfo,
          userType,
          updateTime: db.serverDate()
        }
      })
    } else {
      // 创建新用户
      await db.collection('users').add({
        data: {
          _id: userId,
          ...userInfo,
          userType,
          createTime: db.serverDate(),
          updateTime: db.serverDate()
        }
      })
    }

    return {
      code: 200,
      data: {
        userId
      }
    }
  } catch (error) {
    console.error('登录失败:', error)
    return {
      code: 500,
      message: '服务器错误'
    }
  }
} 