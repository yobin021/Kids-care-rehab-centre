import { db } from '../lib/db'

export const appointmentService = {

  async getAll() {
    try {
      return await db.select('appointments', {
        select: '*, children(id, name, profile, diagnosis)',
        order: { column: 'appointment_date', ascending: true }
      }) || []
    } catch (err) {
      console.warn('appointmentService.getAll error:', err.message)
      return []
    }
  },

  async getUpcoming() {
    try {
      const today = new Date().toISOString().split('T')[0]
      const all = await db.select('appointments', {
        select: '*, children(id, name, profile, diagnosis)',
        order: { column: 'appointment_date', ascending: true }
      }) || []
      return all.filter(a => a.status === 'upcoming' && a.appointment_date >= today)
    } catch (err) {
      console.warn('appointmentService.getUpcoming error:', err.message)
      return []
    }
  },

  async getToday() {
    try {
      const today = new Date().toISOString().split('T')[0]
      const all = await db.select('appointments', {
        select: '*, children(id, name, profile, diagnosis)',
        match: { appointment_date: today },
        order: { column: 'appointment_time', ascending: true }
      }) || []
      return all
    } catch (err) {
      console.warn('appointmentService.getToday error:', err.message)
      return []
    }
  },

  async getByChildId(childId) {
    try {
      return await db.select('appointments', {
        match: { child_id: childId },
        order: { column: 'appointment_date', ascending: false }
      }) || []
    } catch (err) {
      console.warn('appointmentService.getByChildId error:', err.message)
      return []
    }
  },

  async getNextForChild(childId) {
    try {
      const today = new Date().toISOString().split('T')[0]
      const all = await db.select('appointments', {
        match: { child_id: childId },
        order: { column: 'appointment_date', ascending: true }
      }) || []
      return all.find(a => a.status === 'upcoming' && a.appointment_date >= today) || null
    } catch (err) {
      console.warn('appointmentService.getNextForChild error:', err.message)
      return null
    }
  },

  async create(appointmentData, userId) {
    try {
      return await db.insert('appointments', {
        ...appointmentData,
        created_by: userId,
        status: 'upcoming'
      })
    } catch (err) {
      console.warn('appointmentService.create error:', err.message)
      throw err
    }
  },

  async updateStatus(id, status, reason = null) {
    try {
      const payload = { status, updated_at: new Date().toISOString() }
      if (reason) payload.cancelled_reason = reason
      return await db.update('appointments', payload, { match: { id } })
    } catch (err) {
      console.warn('appointmentService.updateStatus error:', err.message)
      throw err
    }
  },

  async update(id, updates) {
    try {
      return await db.update('appointments', {
        ...updates,
        updated_at: new Date().toISOString()
      }, { match: { id } })
    } catch (err) {
      console.warn('appointmentService.update error:', err.message)
      throw err
    }
  },

  async delete(id) {
    try {
      return await db.remove('appointments', { match: { id } })
    } catch (err) {
      console.warn('appointmentService.delete error:', err.message)
      throw err
    }
  }
}
