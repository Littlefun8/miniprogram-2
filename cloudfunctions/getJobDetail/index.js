// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: 'cloud1-3g3q2srz04d1d705' })
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { id } = event

  if (!id) {
    return { code: 400, message: '缺少职位ID' }
  }

  try {
    // 获取职位详情
    const jobRes = await db.collection('jobs').doc(id).get()
    if (!jobRes.data) {
      return { code: 404, message: '职位不存在' }
    }
    const jobDetail = jobRes.data

    // 查询当前用户对该职位的申请状态
    let userApplicationStatus = null
    if (openid) {
      const appRes = await db.collection('applications')
        .where({ jobId: id, userId: openid })
        .limit(1)
        .get()
      if (appRes.data && appRes.data.length > 0) {
        userApplicationStatus = appRes.data[0].status
      }
    }

    // 敏感字段过滤：仅当申请被接受时返回内推码和联系方式
    const SENSITIVE_FIELDS = ['referralCode', 'contactWechat']
    if (userApplicationStatus !== 'accepted') {
      for (const field of SENSITIVE_FIELDS) {
        delete jobDetail[field]
      }
    }

    jobDetail.id = jobDetail._id
    delete jobDetail._id
    jobDetail.userApplicationStatus = userApplicationStatus

    return {
      code: 200,
      data: jobDetail
    }
  } catch (e) {
    return { code: 500, message: '获取职位详情失败', error: e }
  }
} 