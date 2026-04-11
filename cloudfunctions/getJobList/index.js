// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: 'cloud1-3g3q2srz04d1d705' })
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { pageNum = 1, pageSize = 10, keyword, city, jobType, sortBy } = event
  const skip = (pageNum - 1) * pageSize
  const limit = Math.min(pageSize, 20)

  try {
    // 构建查询条件
    let query = {}
    // 默认只返回已发布的职位
    query.status = 'published'

    if (keyword) {
      query.title = db.RegExp({ regexp: keyword, options: 'i' })
    }
    if (city && city !== '全部') {
      query.location = db.RegExp({ regexp: city, options: 'i' })
    }
    if (jobType && jobType !== '全部') {
      query.title = db.RegExp({ regexp: jobType, options: 'i' })
    }

    // 查询总数
    const countRes = await db.collection('jobs').where(query).count()
    const total = countRes.total

    // 排序
    const orderField = sortBy === 'newest' ? 'createTime' : 'likeCount'

    const res = await db.collection('jobs')
      .where(query)
      .orderBy(orderField, 'desc')
      .skip(skip)
      .limit(limit)
      .get()

    // 兼容前端字段
    const list = res.data.map(item => ({
      id: item._id,
      title: item.title,
      salary: item.salary,
      company: item.company,
      location: item.location,
      date: item.date || item.createTime,
      tags: item.tags,
      publisher: item.publisher,
      reviewer: item.reviewer,
      likeCount: item.likeCount || 0,
      status: item.status
    }))

    return {
      code: 200,
      data: list,
      total,
      hasMore: skip + limit < total
    }
  } catch (e) {
    return { code: 500, message: '获取失败', error: e }
  }
} 