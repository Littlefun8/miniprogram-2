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
    // 获取职位详情
    const jobRes = await db.collection('jobs').doc(jobId).get()
    if (!jobRes.data) {
      return { code: 404, message: '职位不存在' }
    }
    const job = jobRes.data

    // 获取用户信息以确定角色
    let userType = ''
    if (openid) {
      const userRes = await db.collection('users')
        .where({ _openid: openid })
        .limit(1)
        .get()
      if (userRes.data && userRes.data.length > 0) {
        userType = userRes.data[0].userType
      }
    }

    // 根据角色过滤关联信息
    let association = job.association || null
    if (association && association.students) {
      if (userType === 'student') {
        // 学生只能看到自己的信息（暂不实现具体过滤，返回全部）
        // 后续需根据真实用户名匹配
      }
    }

    return {
      code: 200,
      data: {
        publisher: job.publisher,
        reviewer: job.reviewer,
        association: association
      }
    }
  } catch (e) {
    return { code: 500, message: '获取关联信息失败', error: e }
  }
} 