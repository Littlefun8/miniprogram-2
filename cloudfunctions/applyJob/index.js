// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { jobId } = event
  const wxContext = cloud.getWXContext()
  const userId = wxContext.OPENID

  try {
    // 检查用户是否已申请过该职位
    const existingApplication = await db.collection('applications')
      .where({
        jobId,
        userId
      })
      .get()
      .then(res => res.data[0])

    if (existingApplication) {
      return {
        code: 400,
        message: '您已申请过该职位'
      }
    }

    // 获取职位信息
    const job = await db.collection('jobs')
      .doc(jobId)
      .get()
      .then(res => res.data)

    if (!job) {
      return {
        code: 404,
        message: '职位不存在'
      }
    }

    // 创建申请记录
    const application = {
      jobId,
      userId,
      status: 'pending', // pending, accepted, rejected
      createTime: db.serverDate(),
      updateTime: db.serverDate()
    }

    await db.collection('applications').add({
      data: application
    })

    // 更新职位申请数
    await db.collection('jobs').doc(jobId).update({
      data: {
        applicationCount: db.command.inc(1)
      }
    })

    return {
      code: 200,
      message: '申请成功'
    }
  } catch (error) {
    console.error('申请职位失败:', error)
    return {
      code: 500,
      message: '服务器错误'
    }
  }
} 