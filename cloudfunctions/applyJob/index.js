// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: 'cloud1-3g3q2srz04d1d705' })
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { jobId, endorsementData } = event

  if (!jobId) {
    return { code: 400, message: '缺少职位ID' }
  }

  try {
    // 检查职位是否存在且可申请
    const jobRes = await db.collection('jobs').doc(jobId).get()
    const job = jobRes.data
    if (!job) {
      return { code: 404, message: '职位不存在' }
    }
    if (job.status !== 'published') {
      return { code: 409, message: '该职位当前不可申请' }
    }

    // 防重复申请
    const exist = await db.collection('applications')
      .where({ jobId, userId: openid })
      .limit(1)
      .get()
    if (exist.data && exist.data.length > 0) {
      return { code: 409, message: '您已申请过该职位' }
    }

    // 创建申请记录（不再使用 ...rest 防止前端注入任意字段）
    const application = {
      jobId,
      userId: openid,
      publisherId: job.publisherId || (job.publisher && job.publisher.openid) || '',
      status: 'pending',
      applyDate: db.serverDate(),
      updateTime: db.serverDate()
    }

    // 可选：背书数据
    if (endorsementData) {
      application.endorsementData = endorsementData
    }

    // 创建简历快照（从 users 集合读取）
    const userRes = await db.collection('users')
      .where({ _openid: openid })
      .limit(1)
      .get()
    if (userRes.data && userRes.data.length > 0) {
      const profile = userRes.data[0]
      if (profile.profile && profile.profile.student && profile.profile.student.resume) {
        application.resumeSnapshot = JSON.parse(JSON.stringify(profile.profile.student.resume))
      }
    }

    // 创建职位快照
    application.jobSnapshot = {
      title: job.title,
      company: job.company,
      salary: job.salary
    }

    // 初始化时间线
    application.timeline = [{
      status: 'pending',
      time: db.serverDate(),
      desc: '提交申请'
    }]

    await db.collection('applications').add({ data: application })

    // 自增职位申请数
    await db.collection('jobs').doc(jobId).update({
      data: { applicationCount: db.command.inc(1) }
    })

    return { code: 200, message: '申请成功' }
  } catch (e) {
    return { code: 500, message: '申请失败', error: e }
  }
} 