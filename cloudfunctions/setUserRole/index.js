// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: 'cloud1-3g3q2srz04d1d705' })
const db = cloud.database()

const VALID_ROLES = ['student', 'alumni', 'teacher']
const ROLE_LABELS = { student: '学生', alumni: '校友', teacher: '老师' }

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { userType } = event

  // 参数校验
  if (!userType) {
    return { code: 400, message: '缺少 userType 参数' }
  }
  if (!VALID_ROLES.includes(userType)) {
    return { code: 400, message: `非法角色类型：${userType}` }
  }

  try {
    // 查询用户记录
    const userRes = await db.collection('users')
      .where({ _openid: openid })
      .limit(1)
      .get()

    if (!userRes.data || userRes.data.length === 0) {
      return { code: 404, message: '用户不存在，请先调用 login' }
    }

    const user = userRes.data[0]

    // 如果已有角色，不允许更改
    if (user.userType && user.userType !== '') {
      return { code: 409, message: `角色已设置为${ROLE_LABELS[user.userType] || user.userType}，不可更改` }
    }

    // 设置角色
    await db.collection('users').doc(user._id).update({
      data: {
        userType: userType,
        nickName: ROLE_LABELS[userType] + '用户',
        isVerified: false,
        updateTime: db.serverDate()
      }
    })

    return {
      code: 200,
      data: {
        userType: userType,
        roleLabel: ROLE_LABELS[userType]
      },
      message: `角色设置成功：${ROLE_LABELS[userType]}`
    }
  } catch (e) {
    return { code: 500, message: '设置角色失败', error: e }
  }
}
