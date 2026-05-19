// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: 'cloud1-3g3q2srz04d1d705' })
const db = cloud.database()

// 云函数入口函数
exports.main = async () => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  try {
    // 获取用户基本信息
    const userRes = await db.collection('users').where({ _openid: openid }).limit(1).get()
    const userInfo = userRes.data[0] || {}
    // 获取用户发布的职位（最多20条）
    const jobsRes = await db.collection('jobs')
      .where({ publisherId: openid })
      .orderBy('createTime', 'desc')
      .limit(20)
      .get()
    // 获取用户申请的职位（最多20条）
    const applicationsRes = await db.collection('applications')
      .where({ userId: openid })
      .orderBy('applyDate', 'desc')
      .limit(20)
      .get()
    // 教师/管理员/校友的审核计数
    let demoPostsCount = 0
    let reviewCount = 0
    if (userInfo.userType === 'teacher' || userInfo.userType === 'admin') {
      const demoPostsRes = await db.collection('jobs').where({ publisherId: openid, demoTag: 'seed_demo', demoOwner: openid }).count()
      demoPostsCount = demoPostsRes.total || 0

      const demoPendingRes = await db.collection('jobs').where({ demoTag: 'seed_review_pending', demoOwner: openid }).count()
      if ((demoPendingRes.total || 0) > 0) {
        reviewCount = demoPendingRes.total || 0
      } else {
        const pendingRes = await db.collection('jobs').where({ status: 'pending' }).count()
        reviewCount = pendingRes.total || 0
      }
    } else if (userInfo.userType === 'alumni') {
      const reviewRes = await db.collection('applications').where({ publisherId: openid }).count()
      reviewCount = reviewRes.total || 0
    }

    return {
      code: 200,
      data: {
        userInfo,
        publishedJobs: jobsRes.data,
        applications: applicationsRes.data,
        demoPostsCount,
        reviewCount
      }
    }
  } catch (e) {
    return { code: 500, message: '获取用户信息失败', error: e }
  }
} 