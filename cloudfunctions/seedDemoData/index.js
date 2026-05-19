const cloud = require('wx-server-sdk')

cloud.init({ env: 'cloud1-3g3q2srz04d1d705' })
const db = cloud.database()

function makePublishedJob(openid, title, company, location, salary) {
  return {
    title,
    salary,
    company,
    location,
    date: '2026-04-20',
    tags: ['小程序', '内推'],
    publisherId: openid,
    publisher: { name: '演示发布者', tag: '校友', openid },
    likeCount: 0,
    applicationCount: 0,
    status: 'published',
    description: '演示岗位描述。',
    requirements: '演示任职要求。',
    recommenderComment: '演示数据：用于论文截图。',
    referralCode: 'JUFE2026',
    contactWechat: 'xufan2026',
    jobLink: 'https://example.com/job',
    demoTag: 'seed_demo',
    demoOwner: openid,
    createTime: db.serverDate(),
    updateTime: db.serverDate()
  }
}

function makePendingReviewJob(ownerId, title, company, idx) {
  const mockPublisherId = `seed_demo_alumni_${ownerId.slice(-6)}_${idx}`
  return {
    title,
    salary: '15K-25K',
    company,
    location: '深圳',
    date: '2026-04-20',
    tags: ['待审核'],
    publisherId: mockPublisherId,
    publisher: { name: '演示校友', tag: '校友', openid: mockPublisherId },
    likeCount: 0,
    applicationCount: 0,
    status: 'pending',
    description: '演示待审核岗位。',
    requirements: '演示要求。',
    recommenderComment: '用于教师审核截图。',
    demoTag: 'seed_review_pending',
    demoOwner: ownerId,
    createTime: db.serverDate(),
    updateTime: db.serverDate()
  }
}

function makeApplication(job, ownerId, publisherId, status, idx) {
  const now = Date.now()
  const applyTime = new Date(now - (idx + 3) * 24 * 60 * 60 * 1000)
  const processingTime = new Date(now - (idx + 2) * 24 * 60 * 60 * 1000)
  const finalTime = new Date(now - (idx + 1) * 24 * 60 * 60 * 1000)

  const timeline = [{ status: 'pending', time: applyTime, desc: '提交申请' }]
  if (status !== 'pending') {
    timeline.push({ status: 'processing', time: processingTime, desc: '审核中' })
  }
  if (status === 'accepted') {
    timeline.push({ status: 'accepted', time: finalTime, desc: '审核通过' })
  }
  if (status === 'rejected') {
    timeline.push({ status: 'rejected', time: finalTime, desc: '审核未通过' })
  }

  return {
    jobId: job._id,
    userId: `seed_student_${ownerId.slice(-6)}_${status}_${idx}`,
    publisherId,
    status,
    applyDate: applyTime,
    updateTime: finalTime,
    jobSnapshot: {
      title: job.title,
      company: job.company,
      salary: job.salary
    },
    timeline,
    demoTag: 'seed_demo_app',
    demoOwner: ownerId
  }
}

function buildNotificationTemplates(openid, relatedJobId) {
  const now = Date.now()
  return [
    {
      userId: openid,
      type: 'job_audit',
      title: '职位审核通过',
      content: '您发布的职位已通过教师审核，已进入发布状态。',
      isRead: false,
      relatedId: relatedJobId || '',
      demoTag: 'seed_demo_notify',
      demoOwner: openid,
      createTime: new Date(now - 30 * 60 * 1000)
    },
    {
      userId: openid,
      type: 'application_status',
      title: '申请处理提醒',
      content: '您收到一条新的申请处理进度变更通知，可点击查看相关审核内容。',
      isRead: false,
      relatedId: relatedJobId || '',
      demoTag: 'seed_demo_notify',
      demoOwner: openid,
      createTime: new Date(now - 2 * 60 * 60 * 1000)
    },
    {
      userId: openid,
      type: 'system',
      title: '系统提示',
      content: '通知中心支持未读统计、类型标识和点击跳转。',
      isRead: true,
      relatedId: '',
      demoTag: 'seed_demo_notify',
      demoOwner: openid,
      createTime: new Date(now - 24 * 60 * 60 * 1000)
    }
  ]
}

exports.main = async () => {
  const { OPENID } = cloud.getWXContext()

  try {
    const userRes = await db.collection('users').where({ _openid: OPENID }).limit(1).get()
    const user = (userRes.data && userRes.data[0]) || null
    if (!user) {
      return { code: 404, message: '当前用户不存在，请先登录后重试' }
    }

    const role = user.userType
    if (role !== 'teacher' && role !== 'admin' && role !== 'alumni') {
      return { code: 403, message: '仅教师/管理员/校友可生成演示数据' }
    }

    // 1) 当前账号至少有2条发布职位（用于“我的发布=2”截图）
    const ownPublishedRes = await db.collection('jobs')
      .where({ publisherId: OPENID, demoTag: 'seed_demo', demoOwner: OPENID })
      .limit(20)
      .get()
    const ownPublished = ownPublishedRes.data || []

    const ownTemplates = [
      makePublishedJob(OPENID, '演示前端开发工程师', '演示科技A', '北京', '16K-24K'),
      makePublishedJob(OPENID, '演示后端开发工程师', '演示科技B', '上海', '18K-30K')
    ]

    for (let i = ownPublished.length; i < 2; i++) {
      await db.collection('jobs').add({ data: ownTemplates[i] })
    }
    if (ownPublished.length > 2) {
      for (let i = 2; i < ownPublished.length; i++) {
        await db.collection('jobs').doc(ownPublished[i]._id).remove()
      }
    }

    // 2) 教师/管理员：保证待审核职位至少3条（用于审核页截图与“我的审核=3”）
    if (role === 'teacher' || role === 'admin') {
      const demoPendingRes = await db.collection('jobs').where({ demoTag: 'seed_review_pending', demoOwner: OPENID }).limit(20).get()
      const demoPending = demoPendingRes.data || []
      const need = Math.max(0, 3 - demoPending.length)
      const pendingTemplates = [
        makePendingReviewJob(OPENID, '演示待审核岗位A', '演示企业A', 1),
        makePendingReviewJob(OPENID, '演示待审核岗位B', '演示企业B', 2),
        makePendingReviewJob(OPENID, '演示待审核岗位C', '演示企业C', 3)
      ]
      for (let i = 0; i < need; i++) {
        await db.collection('jobs').add({ data: pendingTemplates[i] })
      }
      // 若历史测试多次生成，超出的演示待审核记录删除，保持稳定为3条
      if (demoPending.length > 3) {
        for (let i = 3; i < demoPending.length; i++) {
          await db.collection('jobs').doc(demoPending[i]._id).remove()
        }
      }
    }

    // 3) 校友：补齐申请管理页多状态数据（pending/processing/accepted/rejected）
    if (role === 'alumni') {
      const latestOwnJobsRes = await db.collection('jobs')
        .where({ publisherId: OPENID })
        .orderBy('createTime', 'desc')
        .limit(2)
        .get()
      const ownJobs = latestOwnJobsRes.data || []

      if (ownJobs.length > 0) {
        const appRes = await db.collection('applications')
          .where({ publisherId: OPENID, demoTag: 'seed_demo_app', demoOwner: OPENID })
          .limit(50)
          .get()
        const existing = appRes.data || []
        const existingStatus = new Set(existing.map((x) => x.status))
        const statuses = ['pending', 'processing', 'accepted', 'rejected']

        for (let i = 0; i < statuses.length; i++) {
          const status = statuses[i]
          if (!existingStatus.has(status)) {
            const job = ownJobs[i % ownJobs.length]
            await db.collection('applications').add({
              data: makeApplication(job, OPENID, OPENID, status, i)
            })
          }
        }
      }
    }

    // 4) 补齐当前账号通知演示数据（未读/已读/类型）
    const ownJobListRes = await db.collection('jobs')
      .where({ publisherId: OPENID })
      .orderBy('createTime', 'desc')
      .limit(1)
      .get()
    const relatedJobId = (ownJobListRes.data && ownJobListRes.data[0] && ownJobListRes.data[0]._id) || ''

    const demoNotifyRes = await db.collection('notifications')
      .where({ userId: OPENID, demoTag: 'seed_demo_notify', demoOwner: OPENID })
      .limit(20)
      .get()
    const demoNotify = demoNotifyRes.data || []
    const templates = buildNotificationTemplates(OPENID, relatedJobId)

    for (let i = demoNotify.length; i < templates.length; i++) {
      await db.collection('notifications').add({ data: templates[i] })
    }
    if (demoNotify.length > templates.length) {
      for (let i = templates.length; i < demoNotify.length; i++) {
        await db.collection('notifications').doc(demoNotify[i]._id).remove()
      }
    }

    // 5) 返回统计结果
    const postsRes = await db.collection('jobs').where({ publisherId: OPENID, demoTag: 'seed_demo', demoOwner: OPENID }).count()
    const pendingRes = role === 'alumni'
      ? await db.collection('applications').where({ publisherId: OPENID }).count()
      : await db.collection('jobs').where({ demoTag: 'seed_review_pending', demoOwner: OPENID }).count()

    return {
      code: 200,
      message: '演示数据生成成功',
      data: {
        stats: {
          postsCount: postsRes.total || 0,
          reviewCount: pendingRes.total || 0
        },
        role
      }
    }
  } catch (error) {
    return { code: 500, message: '演示数据生成失败', error }
  }
}




