// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: 'cloud1-3g3q2srz04d1d705' })
const db = cloud.database()

const VALID_ACTIONS = ['view', 'apply', 'share', 'expandAssociation', 'saveAllInfo']
const ACTION_WEIGHTS = { view: 1, apply: 5, share: 3, expandAssociation: 2, saveAllInfo: 2 }

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { jobId, actionType, stayDuration } = event

  if (!jobId || !actionType) {
    return { code: 400, message: '缺少必要参数（jobId, actionType）' }
  }
  if (!VALID_ACTIONS.includes(actionType)) {
    return { code: 400, message: `非法行为类型：${actionType}` }
  }

  try {
    await db.collection('userActions').add({
      data: {
        userId: openid,
        jobId,
        actionType,
        stayDuration: stayDuration || 0,
        weight: ACTION_WEIGHTS[actionType] || 1,
        createTime: db.serverDate()
      }
    })
    return { code: 200, message: '记录成功' }
  } catch (e) {
    return { code: 500, message: '记录失败', error: e }
  }
} 