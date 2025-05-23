// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    // 创建公司数据
    const companyResult = await db.collection('companies').add({
      data: {
        name: '示例科技有限公司',
        description: '一家专注于技术创新的公司',
        industry: '互联网',
        size: '100-500人',
        location: '北京市朝阳区',
        createTime: db.serverDate()
      }
    })

    // 创建用户数据
    const userResult = await db.collection('users').add({
      data: {
        nickName: 'HR小王',
        avatarUrl: 'https://example.com/avatar.png',
        userType: 'hr',
        companyId: companyResult._id,
        createTime: db.serverDate()
      }
    })

    // 创建职位数据
    const jobResult = await db.collection('jobs').add({
      data: {
        title: '前端开发工程师',
        salary: '15k-25k',
        location: '北京市朝阳区',
        tags: ['React', 'Vue', '小程序'],
        description: '负责公司产品的前端开发工作',
        requirements: '1. 本科及以上学历\n2. 3年以上前端开发经验\n3. 熟悉主流前端框架',
        companyId: companyResult._id,
        publisherId: userResult._id,
        publishTime: '2024-03-20',
        createTime: db.serverDate()
      }
    })

    return {
      code: 200,
      message: '初始化数据成功',
      data: {
        companyId: companyResult._id,
        userId: userResult._id,
        jobId: jobResult._id
      }
    }
  } catch (error) {
    console.error('初始化数据失败:', error)
    return {
      code: 500,
      message: '初始化数据失败'
    }
  }
} 