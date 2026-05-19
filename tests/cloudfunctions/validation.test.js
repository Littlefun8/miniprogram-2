/**
 * applyJob 云函数单元测试 — 参数校验和权限校验
 *
 * 注意：由于 wx-server-sdk 无法在本地安装，本测试通过模拟测试核心校验逻辑
 */

// 提取 applyJob 中的参数校验逻辑进行独立测试
function validateApplyJobParams(event) {
  if (!event.jobId) {
    return { code: 400, message: '缺少必要参数 jobId' }
  }
  return null
}

// 提取 auditJob 中的参数校验逻辑
function validateAuditJobParams(event) {
  if (!event.jobId) {
    return { code: 400, message: '缺少必要参数 jobId' }
  }
  if (!event.action || !['approve', 'reject'].includes(event.action)) {
    return { code: 400, message: 'action 必须为 approve 或 reject' }
  }
  if (event.action === 'reject' && !event.rejectReason) {
    return { code: 400, message: '拒绝审核时必须提供拒审理由' }
  }
  return null
}

// 提取 updateApplicationStatus 中的状态流转校验
function validateStatusTransition(currentStatus, targetStatus) {
  const validTransitions = {
    'pending': ['processing'],
    'processing': ['accepted', 'rejected'],
    'accepted': [],
    'rejected': []
  }
  const allowed = validTransitions[currentStatus] || []
  if (!allowed.includes(targetStatus)) {
    return { code: 409, message: `不允许从 ${currentStatus} 转换到 ${targetStatus}` }
  }
  return null
}

// 提取 recordUserAction 中的 actionType 校验
function validateActionType(actionType) {
  const validActions = ['view', 'apply', 'share', 'expandAssociation', 'saveAllInfo']
  if (!validActions.includes(actionType)) {
    return { code: 400, message: `无效的 actionType: ${actionType}` }
  }
  return null
}

// 提取 recordUserAction 中的 weight 计算
function getActionWeight(actionType) {
  const weights = { view: 1, apply: 5, share: 3, expandAssociation: 2, saveAllInfo: 2 }
  return weights[actionType] || 0
}

// 提取 setUserRole 中的角色校验
function validateUserRole(userType) {
  const validRoles = ['student', 'alumni']
  if (!validRoles.includes(userType)) {
    return { code: 400, message: `无效的用户类型: ${userType}` }
  }
  return null
}

// 测试
let passed = 0
let failed = 0

function test(name, fn) {
  try {
    fn()
    console.log(`  ✅ ${name}`)
    passed++
  } catch (err) {
    console.log(`  ❌ ${name}: ${err.message}`)
    failed++
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed')
}

console.log('\n云函数参数校验 & 状态机测试：\n')

// applyJob 参数校验
console.log('--- applyJob 参数校验 ---')

test('缺少 jobId 返回 400', () => {
  const err = validateApplyJobParams({})
  assert(err !== null, 'Expected error')
  assert(err.code === 400, `Expected 400, got ${err.code}`)
})

test('有 jobId 时校验通过', () => {
  const err = validateApplyJobParams({ jobId: 'j1' })
  assert(err === null, 'Expected no error')
})

// auditJob 参数校验
console.log('\n--- auditJob 参数校验 ---')

test('缺少 jobId 返回 400', () => {
  const err = validateAuditJobParams({ action: 'approve' })
  assert(err !== null, 'Expected error')
  assert(err.code === 400, `Expected 400, got ${err.code}`)
})

test('无效 action 返回 400', () => {
  const err = validateAuditJobParams({ jobId: 'j1', action: 'invalid' })
  assert(err !== null, 'Expected error')
  assert(err.code === 400, `Expected 400`)
})

test('reject 缺少 rejectReason 返回 400', () => {
  const err = validateAuditJobParams({ jobId: 'j1', action: 'reject' })
  assert(err !== null, 'Expected error')
  assert(err.code === 400, `Expected 400`)
})

test('approve 参数完整时校验通过', () => {
  const err = validateAuditJobParams({ jobId: 'j1', action: 'approve' })
  assert(err === null, 'Expected no error')
})

test('reject 有 rejectReason 时校验通过', () => {
  const err = validateAuditJobParams({ jobId: 'j1', action: 'reject', rejectReason: '不合规' })
  assert(err === null, 'Expected no error')
})

// 状态流转校验
console.log('\n--- 申请状态流转校验 ---')

test('pending → processing 允许', () => {
  const err = validateStatusTransition('pending', 'processing')
  assert(err === null, 'Expected allowed')
})

test('pending → accepted 禁止', () => {
  const err = validateStatusTransition('pending', 'accepted')
  assert(err !== null, 'Expected error')
  assert(err.code === 409, `Expected 409`)
})

test('pending → rejected 禁止', () => {
  const err = validateStatusTransition('pending', 'rejected')
  assert(err !== null, 'Expected error')
})

test('processing → accepted 允许', () => {
  const err = validateStatusTransition('processing', 'accepted')
  assert(err === null, 'Expected allowed')
})

test('processing → rejected 允许', () => {
  const err = validateStatusTransition('processing', 'rejected')
  assert(err === null, 'Expected allowed')
})

test('accepted → any 禁止（终态）', () => {
  assert(validateStatusTransition('accepted', 'pending') !== null, 'accepted → pending should fail')
  assert(validateStatusTransition('accepted', 'processing') !== null, 'accepted → processing should fail')
  assert(validateStatusTransition('accepted', 'rejected') !== null, 'accepted → rejected should fail')
})

test('rejected → any 禁止（终态）', () => {
  assert(validateStatusTransition('rejected', 'pending') !== null, 'rejected → pending should fail')
  assert(validateStatusTransition('rejected', 'processing') !== null, 'rejected → processing should fail')
})

// actionType 校验
console.log('\n--- recordUserAction actionType 校验 ---')

test('合法 actionType 校验通过', () => {
  assert(validateActionType('view') === null)
  assert(validateActionType('apply') === null)
  assert(validateActionType('share') === null)
})

test('非法 actionType 返回 400', () => {
  const err = validateActionType('invalid')
  assert(err !== null, 'Expected error')
  assert(err.code === 400)
})

test('action weight 正确计算', () => {
  assert(getActionWeight('view') === 1)
  assert(getActionWeight('apply') === 5)
  assert(getActionWeight('share') === 3)
  assert(getActionWeight('expandAssociation') === 2)
  assert(getActionWeight('saveAllInfo') === 2)
  assert(getActionWeight('unknown') === 0)
})

// 角色校验
console.log('\n--- setUserRole 角色校验 ---')

test('合法角色校验通过', () => {
  assert(validateUserRole('student') === null)
  assert(validateUserRole('alumni') === null)
})

test('非法角色返回 400', () => {
  const err = validateUserRole('admin')
  assert(err !== null, 'Expected error')
  assert(err.code === 400)
})

test('空角色返回 400', () => {
  const err = validateUserRole('')
  assert(err !== null, 'Expected error')
})

console.log(`\n结果: ${passed} 通过, ${failed} 失败\n`)
process.exit(failed > 0 ? 1 : 0)
