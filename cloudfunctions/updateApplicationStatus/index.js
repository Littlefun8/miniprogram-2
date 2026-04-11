// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: 'cloud1-3g3q2srz04d1d705' })
const db = cloud.database()

const VALID_STATUS_TRANSITIONS = {
  pending: ['processing'],
  processing: ['accepted', 'rejected']
}

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { applicationId, status, remark } = event

  // 参数校验
  if (!applicationId || !status) {
    return { code: 400, message: '缺少必要参数' }
  }
  const validStatuses = ['processing', 'accepted', 'rejected']
  if (!validStatuses.includes(status)) {
    return { code: 400, message: '非法的目标状态' }
  }

  try {
    // 查询申请记录
    const appRes = await db.collection('applications').doc(applicationId).get()
    const application = appRes.data
    if (!application) {
      return { code: 404, message: '申请记录不存在' }
    }

    // 查询对应职位，验证调用者是职位发布者
    const jobRes = await db.collection('jobs').doc(application.jobId).get()
    const job = jobRes.data
    if (!job) {
      return { code: 404, message: '关联职位不存在' }
    }
    if (job.publisherId !== openid) {
      return { code: 403, message: '无权操作：仅职位发布者可更新申请状态' }
    }

    // 校验状态流转合法性
    const currentStatus = application.status
    const allowed = VALID_STATUS_TRANSITIONS[currentStatus]
    if (!allowed || !allowed.includes(status)) {
      return { code: 409, message: `非法状态流转：${currentStatus} → ${status}` }
    }

    await db.collection('applications').doc(applicationId).update({
      data: {
        status,
        remark: remark || '',
        updateTime: db.serverDate()
      }
    })
    return { code: 200, message: '状态更新成功' }
  } catch (e) {
    return { code: 500, message: '状态更新失败', error: e }
  }
} 