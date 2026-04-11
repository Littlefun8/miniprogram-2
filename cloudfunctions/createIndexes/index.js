// 云函数入口文件
// createIndexes: 一次性运行，创建所有数据库索引
// 仅管理员可调用
const cloud = require('wx-server-sdk')
cloud.init({ env: 'cloud1-3g3q2srz04d1d705' })
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  try {
    // 管理员校验
    const userRes = await db.collection('users')
      .where({ _openid: openid, userType: 'admin' })
      .limit(1)
      .get()
    if (!userRes.data || userRes.data.length === 0) {
      return { code: 403, message: '仅管理员可创建索引' }
    }

    const results = []

    // users 集合索引
    try {
      await db.collection('users').createIndex({
        keys: { _openid: 1 },
        name: 'openid_unique',
        unique: true
      })
      results.push({ collection: 'users', index: 'openid_unique', status: 'created' })
    } catch (e) {
      results.push({ collection: 'users', index: 'openid_unique', status: e.message })
    }

    // jobs 集合索引
    try {
      await db.collection('jobs').createIndex({
        keys: { status: 1, createTime: -1 },
        name: 'status_createTime'
      })
      results.push({ collection: 'jobs', index: 'status_createTime', status: 'created' })
    } catch (e) {
      results.push({ collection: 'jobs', index: 'status_createTime', status: e.message })
    }

    try {
      await db.collection('jobs').createIndex({
        keys: { publisherId: 1 },
        name: 'publisherId'
      })
      results.push({ collection: 'jobs', index: 'publisherId', status: 'created' })
    } catch (e) {
      results.push({ collection: 'jobs', index: 'publisherId', status: e.message })
    }

    // applications 集合索引
    try {
      await db.collection('applications').createIndex({
        keys: { jobId: 1, userId: 1 },
        name: 'jobId_userId_unique',
        unique: true
      })
      results.push({ collection: 'applications', index: 'jobId_userId_unique', status: 'created' })
    } catch (e) {
      results.push({ collection: 'applications', index: 'jobId_userId_unique', status: e.message })
    }

    try {
      await db.collection('applications').createIndex({
        keys: { userId: 1, status: 1 },
        name: 'userId_status'
      })
      results.push({ collection: 'applications', index: 'userId_status', status: 'created' })
    } catch (e) {
      results.push({ collection: 'applications', index: 'userId_status', status: e.message })
    }

    try {
      await db.collection('applications').createIndex({
        keys: { publisherId: 1, status: 1 },
        name: 'publisherId_status'
      })
      results.push({ collection: 'applications', index: 'publisherId_status', status: 'created' })
    } catch (e) {
      results.push({ collection: 'applications', index: 'publisherId_status', status: e.message })
    }

    // notifications 集合索引
    try {
      await db.collection('notifications').createIndex({
        keys: { userId: 1, isRead: 1 },
        name: 'userId_isRead'
      })
      results.push({ collection: 'notifications', index: 'userId_isRead', status: 'created' })
    } catch (e) {
      results.push({ collection: 'notifications', index: 'userId_isRead', status: e.message })
    }

    // favorites 集合索引
    try {
      await db.collection('favorites').createIndex({
        keys: { userId: 1, jobId: 1 },
        name: 'userId_jobId_unique',
        unique: true
      })
      results.push({ collection: 'favorites', index: 'userId_jobId_unique', status: 'created' })
    } catch (e) {
      results.push({ collection: 'favorites', index: 'userId_jobId_unique', status: e.message })
    }

    // userActions 集合索引
    try {
      await db.collection('userActions').createIndex({
        keys: { userId: 1, jobId: 1 },
        name: 'userId_jobId'
      })
      results.push({ collection: 'userActions', index: 'userId_jobId', status: 'created' })
    } catch (e) {
      results.push({ collection: 'userActions', index: 'userId_jobId', status: e.message })
    }

    return { code: 200, data: results, message: '索引创建完成' }
  } catch (e) {
    return { code: 500, message: '索引创建失败', error: e }
  }
}
