// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: 'cloud1-3g3q2srz04d1d705' })
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { status, pageNum = 1, pageSize = 10, asPublisher, ensureDemoCases } = event
  const skip = (pageNum - 1) * pageSize
  const limit = Math.min(pageSize, 20)

  try {
    // 学生端可选：自动补齐三类演示案例（通过/未通过/审核中）
    if (!asPublisher && ensureDemoCases) {
      const ownAppsRes = await db.collection('applications')
        .where({ userId: openid })
        .field({ status: true, jobId: true })
        .limit(100)
        .get()

      const ownApps = ownAppsRes.data || []
      const hasStatus = {
        accepted: ownApps.some(item => item.status === 'accepted'),
        rejected: ownApps.some(item => item.status === 'rejected'),
        processing: ownApps.some(item => item.status === 'processing')
      }

      const needStatuses = []
      if (!hasStatus.accepted) needStatuses.push('accepted')
      if (!hasStatus.rejected) needStatuses.push('rejected')
      if (!hasStatus.processing) needStatuses.push('processing')

      if (needStatuses.length > 0) {
        const jobsRes = await db.collection('jobs')
          .where({ status: 'published' })
          .orderBy('createTime', 'desc')
          .limit(20)
          .get()

        const jobs = jobsRes.data || []
        const usedJobIds = new Set(ownApps.map(item => item.jobId).filter(Boolean))
        const candidateJobs = jobs.filter(job => !usedJobIds.has(job._id))
        const now = Date.now()

        for (let i = 0; i < needStatuses.length; i++) {
          const appStatus = needStatuses[i]
          const job = candidateJobs[i] || jobs[i] || jobs[0]
          if (!job) break

          const applyTime = new Date(now - (i + 2) * 24 * 60 * 60 * 1000)
          const updateTime = new Date(now - (i + 1) * 24 * 60 * 60 * 1000)

          const timeline = [
            { status: 'pending', time: applyTime, desc: '提交申请' }
          ]
          if (appStatus === 'processing') {
            timeline.push({ status: 'processing', time: updateTime, desc: '审核中' })
          }
          if (appStatus === 'accepted') {
            timeline.push({ status: 'processing', time: updateTime, desc: '审核中' })
            timeline.push({ status: 'accepted', time: updateTime, desc: '审核通过' })
          }
          if (appStatus === 'rejected') {
            timeline.push({ status: 'processing', time: updateTime, desc: '审核中' })
            timeline.push({ status: 'rejected', time: updateTime, desc: '审核未通过' })
          }

          await db.collection('applications').add({
            data: {
              jobId: job._id,
              userId: openid,
              publisherId: job.publisherId || '',
              status: appStatus,
              applyDate: applyTime,
              updateTime,
              jobSnapshot: {
                title: job.title || '岗位信息',
                company: job.company || '-',
                salary: job.salary || '-'
              },
              timeline,
              remark: appStatus === 'rejected' ? '本次演示案例：暂未通过' : ''
            }
          })
        }
      }
    }

    // asPublisher=true 时查询收到他人的申请（校友视角），否则查询自己提交的申请（学生视角）
    let query = asPublisher ? { publisherId: openid } : { userId: openid }
    if (status && status !== 'all') {
      if (status === 'completed') {
        query.status = _.in(['accepted', 'rejected'])
      } else {
        query.status = status
      }
    }

    // 查询总数
    const countRes = await db.collection('applications').where(query).count()
    const total = countRes.total

    const res = await db.collection('applications')
      .where(query)
      .orderBy('applyDate', 'desc')
      .skip(skip)
      .limit(limit)
      .get()

    let data = res.data || []

    // 校友视角：补充申请人可读信息，避免前端直接展示 userId
    if (asPublisher && data.length > 0) {
      const userIds = [...new Set(data.map(item => item.userId).filter(Boolean))]
      const userMap = {}

      if (userIds.length > 0) {
        const usersRes = await db.collection('users')
          .where({ _openid: _.in(userIds) })
          .field({ _openid: true, nickName: true, profile: true })
          .limit(100)
          .get()

        ;(usersRes.data || []).forEach(user => {
          userMap[user._openid] = user
        })
      }

      data = data.map(item => {
        const user = userMap[item.userId] || {}
        const resume = item.resumeSnapshot || {}
        const studentProfile = (user.profile && user.profile.student) || {}

        return {
          ...item,
          applicantName: user.nickName || resume.name || resume.realName || studentProfile.name || '',
          applicantProfile: {
            school: resume.school || studentProfile.school || '',
            major: resume.major || studentProfile.major || '',
            grade: resume.grade || studentProfile.grade || '',
            bio: resume.bio || resume.introduction || studentProfile.bio || studentProfile.introduction || ''
          }
        }
      })
    }

    // 学生视角补充可展示字段：内推码/联系方式/链接（仅在职位已有数据时返回）
    if (!asPublisher && data.length > 0) {
      const jobsMap = {}
      const uniqueJobIds = [...new Set(data.map(item => item.jobId).filter(Boolean))]

      await Promise.all(uniqueJobIds.map(async jobId => {
        try {
          const jobRes = await db.collection('jobs').doc(jobId).get()
          jobsMap[jobId] = jobRes.data || {}
        } catch (err) {
          jobsMap[jobId] = {}
        }
      }))

      data = data.map(item => {
        const job = jobsMap[item.jobId] || {}
        return {
          ...item,
          referralCode: job.referralCode || item.referralCode || '',
          contactWechat: job.contactWechat || item.contactWechat || '',
          jobLink: job.jobLink || item.jobLink || '',
          jobLocation: job.location || item.jobLocation || ''
        }
      })
    }

    return {
      code: 200,
      data,
      total,
      hasMore: skip + limit < total
    }
  } catch (e) {
    return { code: 500, message: '获取申请进度失败', error: e }
  }
} 