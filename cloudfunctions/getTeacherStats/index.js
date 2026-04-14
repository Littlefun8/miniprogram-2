const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

/**
 * getTeacherStats — 教师统计页数据聚合
 * 仅教师角色可调用，返回平台统计数据
 *
 * 输入参数：
 *   timeRange: 'week' | 'month' | 'semester' | 'all'（默认 'week'）
 *
 * 返回数据结构：
 *   overview: { totalStudents, totalApplications, pendingCount, acceptedCount, rejectedCount, passRate }
 *   statusDistribution: [{ status, count, percentage }]
 *   hotJobs: [{ title, count, percentage }]
 *   topReferralPosters: [{ name, company, department, referralsPostedCount }]
 *   lowResponsivenessAlumni: [{ name, company, pendingCount, lastActiveDate }]
 *   highSuccessRateStudents: [{ name, department, major, applicationsMade, applicationsSuccessful, successRate }]
 *   recentApplications: [{ studentName, jobTitle, company, status, applyTime }]
 *   trendData: [{ date, count }]
 *   funnelStages: [{ name, count, conversion }]
 */
exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { timeRange = 'week' } = event

  try {
    // 1. 校验教师身份
    const userRes = await db.collection('users').where({ _openid: OPENID }).get()
    if (!userRes.data || userRes.data.length === 0) {
      return { code: 401, message: '用户未注册' }
    }
    const user = userRes.data[0]
    if (user.userType !== 'teacher' && user.userType !== 'admin') {
      return { code: 403, message: '仅教师或管理员可查看统计' }
    }

    // 2. 并行查询基础数据
    const [
      studentsRes,
      applicationsRes,
      jobsRes,
      alumniRes
    ] = await Promise.all([
      db.collection('users').where({ userType: 'student' }).count(),
      db.collection('applications').get(),
      db.collection('jobs').where({ status: 'published' }).get(),
      db.collection('users').where({ userType: 'alumni' }).get()
    ])

    const totalStudents = studentsRes.total
    const applications = applicationsRes.data || []
    const publishedJobs = jobsRes.data || []
    const alumni = alumniRes.data || []

    // 3. 计算 overview
    const totalApplications = applications.length
    const pendingCount = applications.filter(a => a.status === 'pending').length
    const acceptedCount = applications.filter(a => a.status === 'accepted').length
    const rejectedCount = applications.filter(a => a.status === 'rejected').length
    const processingCount = applications.filter(a => a.status === 'processing').length
    const passRate = totalApplications > 0
      ? Math.round((acceptedCount / totalApplications) * 100)
      : 0

    const overview = {
      totalStudents,
      totalApplications,
      pendingCount,
      acceptedCount,
      rejectedCount,
      processingCount,
      passRate
    }

    // 4. 状态分布
    const statusDistribution = []
    if (totalApplications > 0) {
      const statuses = [
        { status: '待处理', key: 'pending', count: pendingCount, color: '#FAA61A' },
        { status: '处理中', key: 'processing', count: processingCount, color: '#0052D9' },
        { status: '已通过', key: 'accepted', count: acceptedCount, color: '#36B37E' },
        { status: '已拒绝', key: 'rejected', count: rejectedCount, color: '#FF4D4F' }
      ]
      for (const s of statuses) {
        if (s.count > 0) {
          statusDistribution.push({
            status: s.status,
            count: s.count,
            percentage: Math.round((s.count / totalApplications) * 1000) / 10,
            color: s.color
          })
        }
      }
    }

    // 5. 热门岗位（按申请数排序）
    const jobApplicationCounts = {}
    for (const app of applications) {
      const jid = app.jobId
      if (!jobApplicationCounts[jid]) jobApplicationCounts[jid] = 0
      jobApplicationCounts[jid]++
    }

    // 获取所有相关职位信息
    const allJobIds = Object.keys(jobApplicationCounts)
    const jobDetailsMap = {}
    // 获取所有职位（包括非 published 的，用于统计）
    const allJobsRes = await db.collection('jobs').get()
    const allJobs = allJobsRes.data || []
    for (const job of allJobs) {
      jobDetailsMap[job._id] = job
    }

    const hotJobs = []
    const totalAppsWithJob = allJobIds.reduce((sum, jid) => sum + (jobApplicationCounts[jid] || 0), 0)
    for (const jid of allJobIds) {
      const job = jobDetailsMap[jid]
      if (job) {
        hotJobs.push({
          title: job.title,
          count: jobApplicationCounts[jid],
          percentage: totalAppsWithJob > 0
            ? Math.round((jobApplicationCounts[jid] / totalAppsWithJob) * 1000) / 10
            : 0
        })
      }
    }
    hotJobs.sort((a, b) => b.count - a.count)

    // 6. 活跃校友排行（发布职位最多的校友）
    const alumniJobCounts = {}
    for (const job of allJobs) {
      const pid = job.publisherId
      if (!alumniJobCounts[pid]) alumniJobCounts[pid] = 0
      alumniJobCounts[pid]++
    }

    const alumniMap = {}
    for (const a of alumni) {
      alumniMap[a._openid] = a
    }

    const topReferralPosters = []
    for (const [openid, count] of Object.entries(alumniJobCounts)) {
      const alumnus = alumniMap[openid]
      if (alumnus) {
        topReferralPosters.push({
          name: alumnus.nickName || '校友',
          company: '',
          department: '',
          referralsPostedCount: count,
          avatar: alumnus.avatarUrl || ''
        })
      }
    }
    topReferralPosters.sort((a, b) => b.referralsPostedCount - a.referralsPostedCount)

    // 7. 低响应校友（有 pending 申请的发布者）
    const publisherPendingCounts = {}
    for (const app of applications) {
      if (app.status === 'pending') {
        const pid = app.publisherId
        if (!publisherPendingCounts[pid]) publisherPendingCounts[pid] = 0
        publisherPendingCounts[pid]++
      }
    }

    const lowResponsivenessAlumni = []
    for (const [openid, count] of Object.entries(publisherPendingCounts)) {
      const alumnus = alumniMap[openid]
      if (alumnus && count >= 1) {
        lowResponsivenessAlumni.push({
          name: alumnus.nickName || '校友',
          company: '',
          pendingApplicationsCount: count,
          avatar: alumnus.avatarUrl || ''
        })
      }
    }
    lowResponsivenessAlumni.sort((a, b) => b.pendingApplicationsCount - a.pendingApplicationsCount)

    // 8. 高成功率学生
    const studentAppStats = {}
    for (const app of applications) {
      const uid = app.userId
      if (!studentAppStats[uid]) {
        studentAppStats[uid] = { total: 0, accepted: 0 }
      }
      studentAppStats[uid].total++
      if (app.status === 'accepted') {
        studentAppStats[uid].accepted++
      }
    }

    // 获取学生信息
    const studentsRes2 = await db.collection('users').where({ userType: 'student' }).get()
    const studentsMap = {}
    for (const s of (studentsRes2.data || [])) {
      studentsMap[s._openid] = s
    }

    const highSuccessRateStudents = []
    for (const [openid, stats] of Object.entries(studentAppStats)) {
      if (stats.total >= 1) {
        const student = studentsMap[openid]
        if (student) {
          highSuccessRateStudents.push({
            name: student.nickName || '学生',
            department: (student.profile && student.profile.student && student.profile.student.department) || '',
            major: (student.profile && student.profile.student && student.profile.student.major) || '',
            applicationsMade: stats.total,
            applicationsSuccessful: stats.accepted,
            successRate: Math.round((stats.accepted / stats.total) * 1000) / 1000,
            avatar: student.avatarUrl || ''
          })
        }
      }
    }
    highSuccessRateStudents.sort((a, b) => b.successRate - a.successRate)

    // 9. 最近申请
    const recentApplications = []
    const sortedApps = [...applications].sort((a, b) => {
      const ta = a.createTime instanceof Date ? a.createTime.getTime() : new Date(a.createTime || 0).getTime()
      const tb = b.createTime instanceof Date ? b.createTime.getTime() : new Date(b.createTime || 0).getTime()
      return tb - ta
    })

    for (const app of sortedApps.slice(0, 10)) {
      const student = studentsMap[app.userId]
      const job = jobDetailsMap[app.jobId]
      const statusMap = {
        'pending': '待处理',
        'processing': '处理中',
        'accepted': '已通过',
        'rejected': '已拒绝'
      }
      recentApplications.push({
        id: app._id,
        studentName: student ? (student.nickName || '学生') : '未知学生',
        studentAvatar: student ? (student.avatarUrl || '') : '',
        jobTitle: job ? job.title : '未知职位',
        company: job ? job.company : '未知公司',
        status: app.status,
        statusText: statusMap[app.status] || app.status,
        applyTime: app.createTime instanceof Date
          ? app.createTime.toISOString().slice(0, 16).replace('T', ' ')
          : (app.createTime || '')
      })
    }

    // 10. 趋势数据（按时间范围聚合）
    const trendData = computeTrendData(applications, timeRange)

    // 11. 漏斗数据
    const funnelStages = [
      { name: '提交申请', count: totalApplications },
      { name: '进入审核', count: processingCount + acceptedCount + rejectedCount },
      { name: '审核通过', count: acceptedCount }
    ]
    // 计算转化率
    for (let i = 0; i < funnelStages.length; i++) {
      const current = funnelStages[i]
      if (i < funnelStages.length - 1) {
        const next = funnelStages[i + 1]
        current.conversion = current.count > 0
          ? Math.round((next.count / current.count) * 100)
          : 0
        current.dropoff = 100 - current.conversion
        current.nextCount = next.count
      } else {
        current.conversion = null
        current.dropoff = null
        current.nextCount = null
      }
    }

    return {
      code: 200,
      data: {
        overview,
        statusDistribution,
        hotJobs,
        topReferralPosters,
        lowResponsivenessAlumni,
        highSuccessRateStudents,
        recentApplications,
        trendData,
        funnelStages
      }
    }
  } catch (err) {
    console.error('getTeacherStats error:', err)
    return { code: 500, message: err.message }
  }
}

/**
 * 根据时间范围计算趋势数据
 */
function computeTrendData(applications, timeRange) {
  const now = new Date()
  const result = []

  // 按日期分组所有申请
  const appsByDate = {}
  for (const app of applications) {
    const t = app.createTime instanceof Date ? app.createTime : new Date(app.createTime || 0)
    if (isNaN(t.getTime())) continue
    const key = formatDate(t, timeRange)
    if (!appsByDate[key]) appsByDate[key] = 0
    appsByDate[key]++
  }

  // 生成时间标签
  let labels = []
  switch (timeRange) {
    case 'week': {
      const day = now.getDay() || 7
      const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 1)
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i)
        const mm = (d.getMonth() + 1).toString().padStart(2, '0')
        const dd = d.getDate().toString().padStart(2, '0')
        labels.push(`${mm}-${dd}`)
      }
      break
    }
    case 'month': {
      const year = now.getFullYear()
      const month = now.getMonth()
      const days = new Date(year, month + 1, 0).getDate()
      for (let i = 1; i <= days; i += 5) {
        const d = new Date(year, month, i)
        const mm = (d.getMonth() + 1).toString().padStart(2, '0')
        const dd = d.getDate().toString().padStart(2, '0')
        labels.push(`${mm}-${dd}`)
      }
      break
    }
    case 'semester': {
      // 最近 6 个月
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const mm = (d.getMonth() + 1).toString().padStart(2, '0')
        labels.push(`${mm}月`)
      }
      break
    }
    case 'all':
    default: {
      // 最近 4 个季度
      for (let i = 3; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i * 3, 1)
        const q = Math.floor(d.getMonth() / 3) + 1
        labels.push(`${d.getFullYear()}-Q${q}`)
      }
      break
    }
  }

  for (const label of labels) {
    result.push({
      date: label,
      count: appsByDate[label] || 0
    })
  }

  return result
}

function formatDate(date, timeRange) {
  const mm = (date.getMonth() + 1).toString().padStart(2, '0')
  const dd = date.getDate().toString().padStart(2, '0')

  switch (timeRange) {
    case 'week':
    case 'month':
      return `${mm}-${dd}`
    case 'semester':
      return `${mm}月`
    case 'all':
    default:
      const q = Math.floor(date.getMonth() / 3) + 1
      return `${date.getFullYear()}-Q${q}`
  }
}
