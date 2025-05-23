// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { id } = event
  
  try {
    // 获取职位详情
    const jobDetail = await db.collection('jobs')
      .doc(id)
      .get()
      .then(res => res.data)
    
    if (!jobDetail) {
      return {
        code: 404,
        message: '职位不存在'
      }
    }

    // 获取发布者信息
    const publisher = await db.collection('users')
      .doc(jobDetail.publisherId)
      .get()
      .then(res => res.data)

    // 获取公司信息
    const company = await db.collection('companies')
      .doc(jobDetail.companyId)
      .get()
      .then(res => res.data)

    // 组装返回数据
    return {
      code: 200,
      data: {
        ...jobDetail,
        publisher: publisher.nickName,
        publisherType: publisher.type,
        company: company.name,
        companyLogo: company.logo,
        companyDesc: company.description
      }
    }
  } catch (error) {
    console.error('获取职位详情失败:', error)
    return {
      code: 500,
      message: '服务器错误'
    }
  }
} 