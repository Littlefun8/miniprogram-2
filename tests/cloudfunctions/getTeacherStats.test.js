/**
 * getTeacherStats 云函数单元测试
 */

const { createMockSdk, createMockContext } = require('../helpers/mock-wx-server-sdk')

// Mock wx-server-sdk
const mockSdk = createMockSdk({
  openid: 'teacher-openid-001',
  collections: {
    users: [
      { _id: 'u1', _openid: 'teacher-openid-001', userType: 'teacher', nickName: '张教授', avatarUrl: '' },
      { _id: 'u2', _openid: 'student-001', userType: 'student', nickName: '赵雪', avatarUrl: '', profile: { student: { department: '计算机系', major: '软件工程' } } },
      { _id: 'u3', _openid: 'alumni-001', userType: 'alumni', nickName: '李明远', avatarUrl: '' },
      { _id: 'u4', _openid: 'student-002', userType: 'student', nickName: '孙鹏', avatarUrl: '', profile: { student: { department: '电子信息学院', major: '通信工程' } } }
    ],
    jobs: [
      { _id: 'j1', title: '前端开发工程师', company: '蓝天科技', salary: '15k-25k', status: 'published', publisherId: 'alumni-001' },
      { _id: 'j2', title: '后端开发工程师', company: '云智科技', salary: '18k-30k', status: 'published', publisherId: 'alumni-001' },
      { _id: 'j3', title: '产品经理', company: '创新公司', salary: '12k-20k', status: 'pending', publisherId: 'alumni-001' }
    ],
    applications: [
      { _id: 'a1', jobId: 'j1', userId: 'student-001', publisherId: 'alumni-001', status: 'pending', createTime: new Date('2026-04-10') },
      { _id: 'a2', jobId: 'j2', userId: 'student-001', publisherId: 'alumni-001', status: 'accepted', createTime: new Date('2026-04-08') },
      { _id: 'a3', jobId: 'j1', userId: 'student-002', publisherId: 'alumni-001', status: 'rejected', createTime: new Date('2026-04-09') },
      { _id: 'a4', jobId: 'j2', userId: 'student-002', publisherId: 'alumni-001', status: 'processing', createTime: new Date('2026-04-11') }
    ]
  }
})

// 替换 require
const Module = require('module')
const originalRequire = Module.prototype.require
Module.prototype.require = function(id) {
  if (id === 'wx-server-sdk') return mockSdk
  return originalRequire.apply(this, arguments)
}

// 加载云函数
const fs = require('fs')
const path = require('path')
const functionCode = fs.readFileSync(path.join(__dirname, '../../cloudfunctions/getTeacherStats/index.js'), 'utf8')

// 使用 vm 模块执行云函数
const vm = require('vm')
const sandbox = {
  require: (id) => {
    if (id === 'wx-server-sdk') return mockSdk
    return originalRequire(id)
  },
  console,
  exports: {},
  module: { exports: {} }
}
vm.createContext(sandbox)
vm.runInContext(functionCode, sandbox)
const getTeacherStats = sandbox.exports.main

// 测试
async function runTests() {
  let passed = 0
  let failed = 0

  async function test(name, fn) {
    try {
      await fn()
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

  console.log('\ngetTeacherStats 云函数测试：\n')

  await test('教师用户可以获取统计数据', async () => {
    const result = await getTeacherStats(
      { timeRange: 'week' },
      { OPENID: 'teacher-openid-001' }
    )
    assert(result.code === 200, `Expected code 200, got ${result.code}`)
    assert(result.data !== undefined, 'Expected data to exist')
  })

  await test('非教师非管理员用户被拒绝', async () => {
    const result = await getTeacherStats(
      { timeRange: 'week' },
      { OPENID: 'student-001' }
    )
    assert(result.code === 403, `Expected code 403, got ${result.code}`)
  })

  await test('overview 包含正确的统计数字', async () => {
    const result = await getTeacherStats(
      { timeRange: 'week' },
      { OPENID: 'teacher-openid-001' }
    )
    const overview = result.data.overview
    assert(overview.totalStudents === 2, `Expected 2 students, got ${overview.totalStudents}`)
    assert(overview.totalApplications === 4, `Expected 4 applications, got ${overview.totalApplications}`)
    assert(overview.pendingCount === 1, `Expected 1 pending, got ${overview.pendingCount}`)
    assert(overview.acceptedCount === 1, `Expected 1 accepted, got ${overview.acceptedCount}`)
    assert(overview.rejectedCount === 1, `Expected 1 rejected, got ${overview.rejectedCount}`)
    assert(overview.passRate === 25, `Expected 25% pass rate, got ${overview.passRate}`)
  })

  await test('statusDistribution 包含正确的分布', async () => {
    const result = await getTeacherStats(
      { timeRange: 'week' },
      { OPENID: 'teacher-openid-001' }
    )
    const dist = result.data.statusDistribution
    assert(dist.length > 0, 'Expected status distribution to have entries')
    const total = dist.reduce((sum, d) => sum + d.count, 0)
    assert(total === 4, `Expected total 4, got ${total}`)
  })

  await test('hotJobs 按申请数排序', async () => {
    const result = await getTeacherStats(
      { timeRange: 'week' },
      { OPENID: 'teacher-openid-001' }
    )
    const hotJobs = result.data.hotJobs
    assert(hotJobs.length > 0, 'Expected hot jobs')
    for (let i = 1; i < hotJobs.length; i++) {
      assert(hotJobs[i - 1].count >= hotJobs[i].count, 'Hot jobs should be sorted by count desc')
    }
  })

  await test('recentApplications 包含最近申请', async () => {
    const result = await getTeacherStats(
      { timeRange: 'week' },
      { OPENID: 'teacher-openid-001' }
    )
    const apps = result.data.recentApplications
    assert(apps.length > 0, 'Expected recent applications')
    assert(apps[0].studentName !== undefined, 'Expected studentName in recent applications')
    assert(apps[0].jobTitle !== undefined, 'Expected jobTitle in recent applications')
  })

  await test('funnelStages 包含转化漏斗', async () => {
    const result = await getTeacherStats(
      { timeRange: 'week' },
      { OPENID: 'teacher-openid-001' }
    )
    const funnel = result.data.funnelStages
    assert(funnel.length === 3, `Expected 3 funnel stages, got ${funnel.length}`)
    assert(funnel[0].name === '提交申请', `First stage should be 提交申请`)
    assert(funnel[0].count === 4, `First stage count should be 4`)
  })

  await test('trendData 返回时间序列', async () => {
    const result = await getTeacherStats(
      { timeRange: 'week' },
      { OPENID: 'teacher-openid-001' }
    )
    const trend = result.data.trendData
    assert(Array.isArray(trend), 'Expected trendData to be an array')
    assert(trend.length > 0, 'Expected trend data to have entries')
    assert(trend[0].date !== undefined, 'Expected date field')
    assert(trend[0].count !== undefined, 'Expected count field')
  })

  // 恢复原始 require
  Module.prototype.require = originalRequire

  console.log(`\n结果: ${passed} 通过, ${failed} 失败\n`)
  process.exit(failed > 0 ? 1 : 0)
}

runTests().catch(err => {
  console.error('Test runner error:', err)
  Module.prototype.require = originalRequire
  process.exit(1)
})
