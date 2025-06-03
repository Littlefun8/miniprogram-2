// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: 'cloud1-3g3q2srz04d1d705' })
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { pageNum = 1, pageSize = 10 } = event
  const skip = (pageNum - 1) * pageSize
  try {
    const res = await db.collection('jobs')
      .orderBy('date', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get()
    // 兼容前端字段
    const list = res.data.map(item => ({
      id: item._id,
      title: item.title,
      salary: item.salary,
      company: item.company,
      location: item.location,
      date: item.date,
      tags: item.tags,
      publisher: item.publisher,
      reviewer: item.reviewer,
      likeCount: item.likeCount
    }))
    return { code: 200, data: list }
  } catch (e) {
    return { code: 500, message: '获取失败', error: e }
  }
} 