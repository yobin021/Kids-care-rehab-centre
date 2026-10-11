import { db } from '../lib/db'

function toUUID(val) {
  return typeof val === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(val)
    ? val
    : null
}

const LOCAL_STORAGE_KEY = 'kcr_appointments'

export const appointmentService = {

  getLocal() {
    if (typeof window === 'undefined') return []
    try {
      return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]')
    } catch (_) {
      return []
    }
  },

  syncLocal(item) {
    if (typeof window === 'undefined' || !item) return
    try {
      const list = this.getLocal()
      const idx = list.findIndex(a => a.id === item.id)
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...item }
      } else {
        list.push(item)
      }
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list))
    } catch (_) {}
  },

  updateLocal(id, updates) {
    if (typeof window === 'undefined') return
    try {
      const list = this.getLocal()
      const next = list.map(a => a.id === id ? { ...a, ...updates } : a)
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next))
    } catch (_) {}
  },

  removeLocal(id) {
    if (typeof window === 'undefined') return
    try {
      const list = this.getLocal().filter(a => a.id !== id)
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list))
    } catch (_) {}
  },

  async getAll() {
    let remote = []
    try {
      remote = await db.select('appointments', {
        select: '*, children(id, name, profile, diagnosis)',
        order: { column: 'appointment_date', ascending: true }
      }) || []
    } catch (err) {
      console.warn('appointmentService.getAll notice:', err.message)
    }

    const local = this.getLocal()
    const merged = Array.isArray(remote) ? [...remote] : []
    for (const l of local) {
      if (!merged.some(m => m.id === l.id)) {
        merged.push(l)
      }
    }

    return merged.sort((a, b) => {
      const dateA = `${a.appointment_date || ''} ${a.appointment_time || ''}`
      const dateB = `${b.appointment_date || ''} ${b.appointment_time || ''}`
      return dateA.localeCompare(dateB)
    })
  },

  async getUpcoming() {
    const today = new Date().toISOString().split('T')[0]
    const all = await this.getAll()
    return all.filter(a => a.status === 'upcoming' && a.appointment_date >= today)
  },

  async getToday() {
    const today = new Date().toISOString().split('T')[0]
    const all = await this.getAll()
    return all.filter(a => a.appointment_date === today)
  },

  async getByChildId(childId) {
    const all = await this.getAll()
    return all.filter(a => a.child_id === childId)
  },

  async getNextForChild(childId) {
    const today = new Date().toISOString().split('T')[0]
    const list = await this.getByChildId(childId)
    return list.find(a => a.status === 'upcoming' && a.appointment_date >= today) || null
  },

  async create(appointmentData, userId) {
    const validUserId = toUUID(userId)
    const payload = {
      ...appointmentData,
      status: 'upcoming'
    }
    if (validUserId) payload.created_by = validUserId

    try {
      const res = await db.insert('appointments', payload)
      if (res) this.syncLocal(res)
      return res || payload
    } catch (err) {
      console.warn('appointmentService.create remote notice (using local storage):', err.message)
      const localApt = {
        id: 'apt-' + Date.now(),
        ...payload,
        created_at: new Date().toISOString()
      }
      this.syncLocal(localApt)
      return localApt
    }
  },

  async updateStatus(id, status, reason = null) {
    const payload = { status, updated_at: new Date().toISOString() }
    if (reason) payload.cancelled_reason = reason
    this.updateLocal(id, payload)

    try {
      return await db.update('appointments', payload, { id })
    } catch (err) {
      console.warn('appointmentService.updateStatus notice:', err.message)
      return { id, ...payload }
    }
  },

  async update(id, updates) {
    const payload = { ...updates, updated_at: new Date().toISOString() }
    this.updateLocal(id, payload)

    try {
      return await db.update('appointments', payload, { id })
    } catch (err) {
      console.warn('appointmentService.update notice:', err.message)
      return { id, ...payload }
    }
  },

  async delete(id) {
    this.removeLocal(id)
    try {
      return await db.remove('appointments', { id })
    } catch (err) {
      console.warn('appointmentService.delete notice:', err.message)
      return { id, deleted: true }
    }
  }
}
