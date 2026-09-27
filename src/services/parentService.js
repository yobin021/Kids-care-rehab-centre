import { db } from '../lib/db'
import { hashPassword, isHashed } from './passwordService'

function toUUID(val) {
  return typeof val === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(val)
    ? val
    : null
}

// Valid values for exercise_logs.feedback (per DB CHECK constraint)
const VALID_FEEDBACK = ['great', 'okay', 'hard']

export const parentService = {

  async createAccount(parentData, childId, createdBy) {
    console.log('parentService.createAccount:', { parentData, childId, createdBy })

    if (!childId) throw new Error('Child ID is required')
    if (!parentData.phone) throw new Error('Phone number is required')
    if (!parentData.password_hash && !parentData.password) throw new Error('Password is required')

    const rawPass = parentData.password_hash || parentData.password || 'parent123'
    const password_hash = isHashed(rawPass) ? rawPass : await hashPassword(rawPass)

    // Exact columns from parent_accounts schema
    const row = {
      child_id: childId,
      parent_name: parentData.parent_name || parentData.parentName || null,
      relationship: parentData.relationship || null,
      phone: parentData.phone,
      email: parentData.email || null,
      address: parentData.address || null,
      password_hash,
      portal_active: true,
      created_by: toUUID(createdBy)
    }

    if (!row.created_by) delete row.created_by

    try {
      // First check if an account exists for this child_id or phone
      const existing = await db.select('parent_accounts', {
        match: { phone: parentData.phone },
        single: true
      }).catch(() => null) || await db.select('parent_accounts', {
        match: { child_id: childId },
        single: true
      }).catch(() => null)

      if (existing && existing.id) {
        return await db.update('parent_accounts', row, { id: existing.id })
      }

      return await db.insert('parent_accounts', row)
    } catch (err) {
      console.warn('parentService.createAccount notice (trying direct upsert fallback):', err.message)
      try {
        return await db.upsert('parent_accounts', row, 'phone')
      } catch (fallbackErr) {
        console.warn('parentService.createAccount local fallback:', fallbackErr.message)
        return { ...row, id: 'PA-' + Date.now() }
      }
    }
  },

  async updatePassword(parentIdOrPhone, newPassword) {
    try {
      const password_hash = isHashed(newPassword) ? newPassword : await hashPassword(newPassword)
      if (typeof parentIdOrPhone === 'string' && /^[0-9a-fA-F-]{36}$/.test(parentIdOrPhone)) {
        return await db.update('parent_accounts', { password_hash }, { id: parentIdOrPhone })
      } else {
        return await db.update('parent_accounts', { password_hash }, { match: { phone: String(parentIdOrPhone) } })
      }
    } catch (err) {
      console.error('parentService.updatePassword error:', err.message)
      throw err
    }
  },

  async updatePasswordByPhone(phone, newPassword) {
    try {
      const password_hash = isHashed(newPassword) ? newPassword : await hashPassword(newPassword)
      return await db.update('parent_accounts', { password_hash }, { match: { phone: String(phone) } })
    } catch (err) {
      console.error('parentService.updatePasswordByPhone error:', err.message)
      throw err
    }
  },

  async updatePasswordByChildId(childId, newPassword) {
    try {
      const password_hash = isHashed(newPassword) ? newPassword : await hashPassword(newPassword)
      return await db.update('parent_accounts', { password_hash }, { match: { child_id: childId } })
    } catch (err) {
      console.error('parentService.updatePasswordByChildId error:', err.message)
      throw err
    }
  },

  async logExercise(childId, parentId, exerciseId, feedback) {
    const today = new Date().toISOString().split('T')[0]

    // feedback must match DB CHECK constraint or be null
    const safeFeedback = VALID_FEEDBACK.includes(feedback) ? feedback : null

    const row = {
      child_id: childId,
      exercise_id: String(exerciseId),
      log_date: today,
      is_done: true,
      feedback: safeFeedback,
      done_at: new Date().toISOString(),
      parent_id: toUUID(parentId)
    }

    // Remove null parent_id so DB uses its default
    if (!row.parent_id) delete row.parent_id

    try {
      return await db.upsert('exercise_logs', row, 'child_id,exercise_id,log_date')
    } catch (err) {
      console.warn('parentService.logExercise notice (trying insert/update fallback):', err.message)
      try {
        return await db.insert('exercise_logs', row)
      } catch (e) {
        try {
          return await db.update('exercise_logs', { is_done: true, feedback: safeFeedback, done_at: new Date().toISOString() }, {
            match: { child_id: childId, exercise_id: String(exerciseId), log_date: today }
          })
        } catch (e2) {
          return { ...row, id: 'EL-' + Date.now() }
        }
      }
    }
  },

  async undoExercise(childId, exerciseId) {
    const today = new Date().toISOString().split('T')[0]
    try {
      return await db.update(
        'exercise_logs',
        { is_done: false, feedback: null, done_at: null },
        { match: { child_id: childId, exercise_id: exerciseId, log_date: today } }
      )
    } catch (err) {
      console.error('parentService.undoExercise error:', err.message)
      throw err
    }
  },

  async getTodayLogs(childId) {
    const today = new Date().toISOString().split('T')[0]
    try {
      return await db.select('exercise_logs', {
        match: { child_id: childId, log_date: today }
      }) || []
    } catch (err) {
      console.warn('parentService.getTodayLogs:', err.message)
      return []
    }
  },

  async getWeekLogs(childId) {
    try {
      const data = await db.select('exercise_logs', {
        select: 'log_date, is_done',
        match: { child_id: childId }
      })
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 6)
      const weekAgoStr = weekAgo.toISOString().split('T')[0]
      return (data || []).filter((r) => r.log_date >= weekAgoStr)
    } catch (err) {
      console.warn('parentService.getWeekLogs:', err.message)
      return []
    }
  },

  async sendMessage(childId, parentId, message) {
    // Exact columns from parent_messages schema: child_id, parent_id, message, message_date
    const row = {
      child_id: childId,
      message,
      message_date: new Date().toISOString().split('T')[0],
      parent_id: toUUID(parentId)
    }
    if (!row.parent_id) delete row.parent_id

    try {
      return await db.insert('parent_messages', row)
    } catch (err) {
      console.error('parentService.sendMessage error:', err.message)
      throw err
    }
  },

  async getTodayMessage(childId) {
    const today = new Date().toISOString().split('T')[0]
    try {
      const data = await db.select('parent_messages', {
        match: { child_id: childId, message_date: today },
        limit: 1,
        single: true
      })
      return data || null
    } catch {
      return null
    }
  },

  async getAllMessages(limit = 50) {
    try {
      const data = await db.select('parent_messages', {
        select: '*, children(id, name, diagnosis), parent_accounts(id, parent_name, phone)',
        order: { column: 'created_at', ascending: false },
        limit
      })
      return Array.isArray(data) ? data : (data ? [data] : [])
    } catch (err) {
      console.warn('parentService.getAllMessages error (trying basic select):', err.message)
      try {
        const fallback = await db.select('parent_messages', {
          order: { column: 'created_at', ascending: false },
          limit
        })
        return Array.isArray(fallback) ? fallback : (fallback ? [fallback] : [])
      } catch (_) {
        return []
      }
    }
  },

  async getMessagesByChildId(childId) {
    try {
      const data = await db.select('parent_messages', {
        select: '*, children(id, name, diagnosis), parent_accounts(id, parent_name, phone)',
        match: { child_id: childId },
        order: { column: 'created_at', ascending: false }
      })
      return Array.isArray(data) ? data : (data ? [data] : [])
    } catch (err) {
      console.warn('parentService.getMessagesByChildId error:', err.message)
      try {
        const fallback = await db.select('parent_messages', {
          match: { child_id: childId },
          order: { column: 'created_at', ascending: false }
        })
        return Array.isArray(fallback) ? fallback : (fallback ? [fallback] : [])
      } catch (_) {
        return []
      }
    }
  }
}
