// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

// 云函数入口函数
exports.main = async (event, context) => {
  const { pageNum = 1, pageSize = 10, keyword = '' } = event
  const skip = (pageNum - 1) * pageSize

  try {
    // 构建查询条件
    const query = {}
    if (keyword) {
      query.title = db.RegExp({
        regexp: keyword,
        options: 'i'
      })
    }

    // 获取总数
    const countResult = await db.collection('jobs')
      .where(query)
      .count()

    // 获取列表数据
    const listResult = await db.collection('jobs')
      .aggregate()
      .match(query)
      .lookup({
        from: 'companies',
        localField: 'companyId',
        foreignField: '_id',
        as: 'company'
      })
      .lookup({
        from: 'users',
        localField: 'publisherId',
        foreignField: '_id',
        as: 'publisher'
      })
      .project({
        _id: 1,
        title: 1,
        salary: 1,
        location: 1,
        tags: 1,
        publishTime: 1,
        company: $.arrayElemAt(['$company', 0]),
        publisher: $.arrayElemAt(['$publisher', 0])
      })
      .skip(skip)
      .limit(pageSize)
      .sort({
        createTime: -1
      })
      .end()

    // 处理返回数据
    const list = listResult.list.map(item => ({
      id: item._id,
      title: item.title,
      salary: item.salary,
      company: item.company.name,
      location: item.location,
      tags: item.tags,
      publishTime: item.publishTime,
      publisher: item.publisher.nickName,
      publisherType: item.publisher.userType
    }))

    return {
      code: 200,
      data: {
        list,
        total: countResult.total,
        pageNum,
        pageSize
      }
    }
  } catch (error) {
    console.error('获取职位列表失败:', error)
    return {
      code: 500,
      message: '服务器错误'
    }
  }
} 