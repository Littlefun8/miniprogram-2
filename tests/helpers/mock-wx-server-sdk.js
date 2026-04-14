/**
 * mock-wx-server-sdk.js
 * 模拟 wx-server-sdk 用于云函数单元测试
 */

/**
 * 创建一个可配置的 mock 数据库
 * @param {Object} collections - 集合数据映射 { collectionName: [documents] }
 * @returns {Object} mock db 对象
 */
function createMockDb(collections = {}) {
  const data = {}
  for (const [name, docs] of Object.entries(collections)) {
    data[name] = docs.map(doc => ({ ...doc }))
  }

  const collection = (name) => {
    const docs = data[name] || []

    return {
      where: (condition) => {
        const filtered = filterDocs(docs, condition)
        return {
          get: async () => ({ data: filtered }),
          count: async () => ({ total: filtered.length }),
          update: async (updateData) => {
            let updated = 0
            for (const doc of filtered) {
              Object.assign(doc, updateData.data || {})
              updated++
            }
            return { stats: { updated } }
          },
          remove: async () => {
            const count = filtered.length
            return { stats: { removed: count } }
          },
          orderBy: (field, order) => {
            const sorted = [...filtered].sort((a, b) => {
              const va = a[field], vb = b[field]
              if (order === 'desc') return va < vb ? 1 : -1
              return va > vb ? 1 : -1
            })
            return {
              limit: (n) => ({
                get: async () => ({ data: sorted.slice(0, n) }),
                skip: (offset) => ({
                  get: async () => ({ data: sorted.slice(offset, offset + n) })
                })
              }),
              skip: (offset) => ({
                limit: (n) => ({
                  get: async () => ({ data: sorted.slice(offset, offset + n) })
                })
              })
            }
          },
          limit: (n) => ({
            get: async () => ({ data: filtered.slice(0, n) }),
            skip: (offset) => ({
              get: async () => ({ data: filtered.slice(offset, offset + n) })
            })
          }),
          skip: (offset) => ({
            limit: (n) => ({
              get: async () => ({ data: filtered.slice(offset, offset + n) })
            }),
            get: async () => ({ data: filtered.slice(offset) })
          })
        }
      },
      doc: (id) => {
        const doc = docs.find(d => d._id === id)
        return {
          get: async () => {
            if (!doc) throw new Error('document not found')
            return { data: doc }
          },
          update: async (updateData) => {
            if (!doc) return { stats: { updated: 0 } }
            Object.assign(doc, updateData.data || {})
            return { stats: { updated: 1 } }
          },
          remove: async () => {
            const idx = docs.indexOf(doc)
            if (idx >= 0) docs.splice(idx, 1)
            return { stats: { removed: 1 } }
          }
        }
      },
      add: async (addData) => {
        const newDoc = { _id: 'mock-' + Math.random().toString(36).slice(2, 8), ...addData.data }
        docs.push(newDoc)
        return { _id: newDoc._id }
      },
      get: async () => ({ data: docs })
    }
  }

  return { collection }
}

/**
 * 简单的条件过滤
 */
function filterDocs(docs, condition) {
  if (!condition) return docs

  return docs.filter(doc => {
    for (const [key, value] of Object.entries(condition)) {
      if (typeof value === 'object' && value !== null) {
        // 处理 command 对象（简化版）
        if (value._type === 'eq') {
          if (doc[key] !== value._val) return false
        }
        continue
      }
      if (doc[key] !== value) return false
    }
    return true
  })
}

/**
 * 创建 mock wx-server-sdk
 * @param {Object} options
 * @param {string} options.openid - 模拟的 OPENID
 * @param {Object} options.collections - 集合数据
 */
function createMockSdk(options = {}) {
  const { openid = 'test-openid-001', collections = {} } = options
  const db = createMockDb(collections)

  return {
    init: () => {},
    getWXContext: () => ({ OPENID: openid }),
    database: () => db,
    DYNAMIC_CURRENT_ENV: 'mock-env'
  }
}

/**
 * 创建 mock context（供云函数测试使用）
 */
function createMockContext(openid = 'test-openid-001') {
  return {
    OPENID: openid
  }
}

module.exports = {
  createMockDb,
  createMockSdk,
  createMockContext
}
