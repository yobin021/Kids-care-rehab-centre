import { db } from '../lib/db'

// Validate UUID format before sending to Postgres
function toUUID(val) {
  return typeof val === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(val)
    ? val
    : null
}

export const childrenService = {

  async getAll() {
    try {
      const data = await db.select('children', {
        select: '*, parent_accounts(id, parent_name, phone, email, portal_active, password_hash)',
        match: { is_active: true },
        order: { column: 'created_at', ascending: false }
      })

      return (data || []).map(normalizeChild)
    } catch (err) {
      console.warn('childrenService.getAll notice (using local data):', err.message)
      return []
    }
  },

  async getById(id) {
    try {
      const data = await db.select('children', {
        select: `*,
          parent_accounts(id, parent_name, relationship, phone, email, address, portal_active, password_hash, created_at),
          assessments(id, assessment_date, isaa_score, isaa_severity, profile, status, assessed_by, created_at),
          reports(id, status, created_at, published_at, prepared_by, published_by)`,
        match: { id },
        single: true
      })

      return normalizeChild(data)
    } catch (err) {
      console.warn('childrenService.getById notice (using local data):', err.message)
      return null
    }
  },

  async generateChildId() {
    try {
      const data = await db.rpc('get_next_child_id')
      if (data) return data
    } catch (e) {
      console.warn('get_next_child_id RPC unavailable, using fallback:', e.message)
    }
    const year = new Date().getFullYear()
    return `KCR-${year}-${Math.floor(Math.random() * 900) + 100}`
  },

  async create(childData, userId) {
    const childId = await this.generateChildId()

    // Build payload using exact column names from schema
    const payload = {
      id: childId,
      name: childData.name,
      date_of_birth: childData.dob || childData.date_of_birth || null,
      age: childData.age || null,
      gender: childData.gender || null,
      diagnosis: childData.diagnosis || null,
      profile: childData.profile || null,
      school: childData.school || null,
      class: childData.class || null,
      primary_concern: childData.primaryConcern || childData.primary_concern || null,
      referred_by: childData.referredBy || childData.referred_by || null,
      previous_therapy: childData.previousTherapy ?? childData.previous_therapy ?? false,
      previous_therapy_details: childData.previousTherapyDetails || childData.previous_therapy_details || null,
      languages: childData.languages || null,
      school_feedback: childData.schoolFeedback || childData.school_feedback || null,
      udid_number: childData.udidNumber || childData.udid_number || null,
      registered_date: new Date().toISOString().split('T')[0],
      registered_by: toUUID(userId),
      is_active: true
    }

    console.log('childrenService.create payload:', payload)

    try {
      return await db.insert('children', payload)
    } catch (err) {
      console.error('childrenService.create error:', err.message, '| code:', err.code)
      throw err
    }
  },

  async update(id, childData) {
    const payload = {}

    const fields = {
      name: childData.name,
      gender: childData.gender,
      diagnosis: childData.diagnosis,
      profile: childData.profile,
      school: childData.school || null,
      class: childData.class || null,
      primary_concern: childData.primaryConcern || childData.primary_concern || null,
      referred_by: childData.referredBy || childData.referred_by || null,
      previous_therapy: childData.previousTherapy ?? childData.previous_therapy,
      previous_therapy_details: childData.previousTherapyDetails || childData.previous_therapy_details || null,
      languages: childData.languages || null,
      school_feedback: childData.schoolFeedback || childData.school_feedback || null,
      udid_number: childData.udidNumber || childData.udid_number || null
    }

    // Only include fields that were actually provided
    Object.entries(fields).forEach(([key, val]) => {
      if (val !== undefined) payload[key] = val
    })

    try {
      return await db.update('children', payload, { id })
    } catch (err) {
      console.error('childrenService.update error:', err.message)
      throw err
    }
  },

  async search(query) {
    try {
      const data = await db.select('children', { match: { is_active: true } })
      const q = (query || '').toLowerCase()
      return (data || []).filter(
        (c) => c.name?.toLowerCase().includes(q) || c.id?.toLowerCase().includes(q)
      )
    } catch (err) {
      console.error('childrenService.search error:', err.message)
      return []
    }
  }
}

// Normalize parent_accounts join into a flat `parent` object
function normalizeChild(c) {
  if (!c) return c
  const pa = Array.isArray(c.parent_accounts) ? c.parent_accounts[0] : c.parent_accounts
  return {
    ...c,
    parent: pa
      ? {
          id: pa.id,
          name: pa.parent_name,
          relationship: pa.relationship,
          phone: pa.phone,
          email: pa.email,
          address: pa.address,
          portalActive: pa.portal_active,
          portalPassword: pa.password_hash || pa.portalPassword || ""
        }
      : c.parent || null
  }
}
