// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: 'cloud1-3g3q2srz04d1d705' })
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { jobId } = event
  try {
    // 获取职位详情
    const jobRes = await db.collection('jobs').doc(jobId).get()
    if (!jobRes.data) {
      return { code: 404, message: '职位不存在' }
    }
    const job = jobRes.data
    // 这里假设职位详情中已包含推荐人、审核人、association等信息
    // 如需扩展，可在此查询其它集合
    return {
      code: 200,
      data: {
        publisher: job.publisher,
        reviewer: job.reviewer,
        association: job.association || null
      }
    }
  } catch (e) {
    return { code: 500, message: '获取关联信息失败', error: e }
  }
} 