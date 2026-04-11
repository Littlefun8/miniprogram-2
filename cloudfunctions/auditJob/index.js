// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: 'cloud1-3g3q2srz04d1d705' })
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { jobId, action, rejectReason } = event

  // 参数校验
  if (!jobId || !action) {
    return { code: 400, message: '缺少必要参数（jobId, action）' }
  }
  if (!['approve', 'reject'].includes(action)) {
    return { code: 400, message: '非法操作类型' }
  }

  try {
    // 角色校验：仅教师可审核
    const userRes = await db.collection('users')
      .where({ _openid: openid })
      .limit(1)
      .get()
    const user = userRes.data && userRes.data[0]
    if (!user) {
      return { code: 401, message: '用户未注册' }
    }
    if (user.userType !== 'teacher') {
      return { code: 403, message: '仅教师可审核职位' }
    }

    // 查询职位
    const jobRes = await db.collection('jobs').doc(jobId).get()
    const job = jobRes.data
    if (!job) {
      return { code: 404, message: '职位不存在' }
    }
    if (job.status !== 'pending') {
      return { code: 409, message: `职位当前状态为 ${job.status}，不可审核` }
    }

    const now = db.serverDate()

    if (action === 'approve') {
      // 审核通过
      await db.collection('jobs').doc(jobId).update({
        data: {
          status: 'published',
          endorserInfo: {
            teacherId: openid,
            teacherName: user.nickName || '教师用户',
            teacherAvatar: user.avatarUrl || '',
            dept: (user.profile && user.profile.teacher && user.profile.teacher.dept) || '',
            auditedAt: now
          },
          publishTime: now,
          updateTime: now
        }
      })

      // 通知发布者
      await db.collection('notifications').add({
        data: {
          userId: job.publisherId || (job.publisher && job.publisher.openid) || '',
          type: 'job_audit',
          title: '职位审核通过',
          content: `您发布的职位「${job.title}」已通过教师审核，现已发布。`,
          isRead: false,
          relatedId: jobId,
          createTime: now
        }
      })

      return { code: 200, message: '审核通过，职位已发布' }
    }

    // 审核拒绝
    if (!rejectReason) {
      return { code: 400, message: '拒绝审核需提供原因' }
    }

    await db.collection('jobs').doc(jobId).update({
      data: {
        status: 'rejected',
        rejectReason: rejectReason,
        updateTime: now
      }
    })

    // 通知发布者
    await db.collection('notifications').add({
      data: {
        userId: job.publisherId || (job.publisher && job.publisher.openid) || '',
        type: 'job_audit',
        title: '职位审核未通过',
        content: `您发布的职位「${job.title}」未通过审核。原因：${rejectReason}`,
        isRead: false,
        relatedId: jobId,
        createTime: now
      }
    })

    return { code: 200, message: '已拒绝该职位' }
  } catch (e) {
    return { code: 500, message: '审核操作失败', error: e }
  }
}
