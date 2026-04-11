// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: 'cloud1-3g3q2srz04d1d705' })
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  try {
    // 权限校验：仅管理员可执行初始化
    const userRes = await db.collection('users')
      .where({ _openid: openid, userType: 'admin' })
      .limit(1)
      .get()
    if (!userRes.data || userRes.data.length === 0) {
      return { code: 403, message: '无权限：仅管理员可初始化数据' }
    }

    // 与前端模拟数据一致的职位数据
    const jobs = [
      {
        title: '前端开发工程师',
        salary: '15K-25K',
        company: '示例科技有限公司',
        location: '北京市朝阳区',
        date: '2024-03-20',
        tags: ['React', 'Vue', '小程序'],
        publisher: { name: '姚经理', tag: '校友' },
        reviewer: { name: '张教授', tag: '老师' },
        likeCount: 12,
        status: 'published',
        createTime: db.serverDate()
      },
      {
        title: '后端开发工程师',
        salary: '20K-35K',
        company: '云智科技有限公司',
        location: '上海市浦东新区',
        date: '2024-03-18',
        tags: ['Java', 'Spring Boot', '微服务'],
        publisher: { name: '技术总监', tag: '校友' },
        reviewer: { name: '李教授', tag: '老师' },
        likeCount: 25,
        status: 'published',
        createTime: db.serverDate()
      },
      {
        title: '产品经理',
        salary: '18K-30K',
        company: '创新互联网公司',
        location: '深圳市南山区',
        date: '2024-03-15',
        tags: ['用户增长', '数据分析', '产品设计'],
        publisher: { name: '李经理', tag: '校友' },
        reviewer: { name: '王教授', tag: '老师' },
        likeCount: 7,
        status: 'published',
        createTime: db.serverDate()
      }
    ]

    // 清空原有数据
    await db.collection('jobs').where({}).remove()
    // 批量插入
    for (const job of jobs) {
      await db.collection('jobs').add({ data: job })
    }
    return { code: 200, message: '初始化成功', count: jobs.length }
  } catch (e) {
    return { code: 500, message: '初始化失败', error: e }
  }
} 