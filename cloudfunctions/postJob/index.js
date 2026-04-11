// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: 'cloud1-3g3q2srz04d1d705' })
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  const {
    title, salary, company, location, tags,
    recommenderComment, jobLink, publisherName,
    description, requirements, referralCode, contactWechat
  } = event

  // 参数校验
  if (!title || !salary || !company || !location) {
    return { code: 400, message: '缺少必要参数（title, salary, company, location）' }
  }

  try {
    // 角色校验：仅校友和老师可发布
    const userRes = await db.collection('users')
      .where({ _openid: openid })
      .limit(1)
      .get()
    const user = userRes.data && userRes.data[0]
    if (!user) {
      return { code: 401, message: '用户未注册' }
    }
    if (user.userType !== 'alumni' && user.userType !== 'teacher') {
      return { code: 403, message: '仅校友和老师可发布职位' }
    }

    // 构建职位数据（白名单字段，不直接写入 event）
    const jobData = {
      title,
      salary,
      company,
      location,
      tags: tags || [],
      recommenderComment: recommenderComment || '',
      jobLink: jobLink || '',
      publisherName: publisherName || '',
      description: description || '',
      requirements: requirements || '',
      referralCode: referralCode || '',
      contactWechat: contactWechat || '',
      publisherId: openid,
      publisher: {
        openid: openid,
        name: publisherName || user.nickName || '',
        userType: user.userType
      },
      status: 'pending',
      applicationCount: 0,
      likeCount: 0,
      createTime: db.serverDate(),
      updateTime: db.serverDate()
    }

    const res = await db.collection('jobs').add({ data: jobData })
    return { code: 200, message: '发布成功，等待审核', id: res._id }
  } catch (e) {
    return { code: 500, message: '发布失败', error: e }
  }
} 