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

  async getIepChildren() {
    const all = await this.getAll()
    return all.filter(c => c.program_type === 'iep')
  },

  async getTherapyChildren(category = null) {
    const all = await this.getAll()
    const therapy = all.filter(c => c.program_type === 'therapy')
    if (!category || category === 'All') return therapy
    return therapy.filter(c => c.therapy_category === category)
  },

  async getById(id) {
    try {
      const data = await db.select('children', {
        select: `*,
          parent_accounts(id, parent_name, relationship, phone, email, address, portal_active, password_hash, created_at),
          assessments(id, assessment_date, domain_scores, isaa_score, isaa_severity, profile, status, assessed_by, created_at),
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
    const childId = childData.id || (await this.generateChildId())

    const programType = childData.program_type || (childData.therapy_category ? 'therapy' : 'iep')
    const therapyCategory = programType === 'therapy' ? (childData.therapy_category || 'ASD') : null

    // Exact columns that exist in the PostgreSQL children table schema
    const dbPayload = {
      id: childId,
      name: childData.name,
      date_of_birth: childData.dob || childData.date_of_birth || null,
      age: childData.age || null,
      gender: childData.gender || null,
      diagnosis: programType === 'iep' ? 'IEP Special School' : (therapyCategory || childData.diagnosis || 'Therapy'),
      profile: programType === 'iep' ? 'IEP' : (childData.profile || therapyCategory || 'Therapy'),
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

    try {
      const res = await db.insert('children', dbPayload)
      const normalized = normalizeChild({ ...(res || dbPayload), program_type: programType, therapy_category: therapyCategory })
      return normalized
    } catch (err) {
      console.warn('childrenService.create DB insert notice:', err.message)
      const fallbackObj = {
        ...dbPayload,
        program_type: programType,
        therapy_category: therapyCategory
      }
      return normalizeChild(fallbackObj)
    }
  },

  async update(id, childData) {
    const programType = childData.program_type !== undefined ? childData.program_type : undefined
    const therapyCategory = programType === 'iep' ? null : (childData.therapy_category !== undefined ? childData.therapy_category : undefined)

    // Only map known database columns
    const dbFields = {
      name: childData.name,
      gender: childData.gender,
      diagnosis: programType === 'iep' ? 'IEP Special School' : (therapyCategory || childData.diagnosis),
      profile: programType === 'iep' ? 'IEP' : childData.profile,
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

    const payload = {}
    Object.entries(dbFields).forEach(([key, val]) => {
      if (val !== undefined) payload[key] = val
    })

    try {
      const res = await db.update('children', payload, { id })
      return normalizeChild({ ...(res || { id, ...payload }), program_type: programType, therapy_category: therapyCategory })
    } catch (err) {
      console.warn('childrenService.update notice:', err.message)
      return normalizeChild({ id, ...payload, program_type: programType, therapy_category: therapyCategory })
    }
  },

  async search(query) {
    try {
      const all = await this.getAll()
      const q = (query || '').toLowerCase()
      return all.filter(
        (c) => c.name?.toLowerCase().includes(q) || c.id?.toLowerCase().includes(q)
      )
    } catch (err) {
      console.error('childrenService.search error:', err.message)
      return []
    }
  }
}

// Normalize parent_accounts join into a flat `parent` object and strictly deduce program_type
function normalizeChild(c) {
  if (!c) return c
  const pa = Array.isArray(c.parent_accounts) ? c.parent_accounts[0] : c.parent_accounts

  // Deduce program_type logically:
  // If diagnosis or profile explicitly mentions ASD, ADHD, Developmental Delay, or Learning Disability, it's Therapy.
  // Otherwise, default to 'iep'.
  let program_type = c.program_type
  let therapy_category = c.therapy_category

  if (!program_type) {
    const diag = (c.diagnosis || '').toUpperCase()
    const prof = (c.profile || '').toUpperCase()
    if (diag.includes('ADHD') || prof.includes('ADHD')) {
      program_type = 'therapy'
      therapy_category = 'ADHD'
    } else if (diag.includes('DELAY') || prof.includes('DELAY') || diag.includes('DEVELOPMENTAL')) {
      program_type = 'therapy'
      therapy_category = 'Developmental Delay'
    } else if (diag.includes('LEARNING') || prof.includes('LEARNING') || diag.includes('DISABILITY')) {
      program_type = 'therapy'
      therapy_category = 'Learning Disability'
    } else if (diag.includes('ASD') || diag.includes('AUTISM') || prof.includes('PROFILE') || prof === 'A' || prof === 'B' || prof === 'C') {
      program_type = 'therapy'
      therapy_category = 'ASD'
    } else {
      program_type = 'iep'
      therapy_category = null
    }
  }

  // Enforce zero therapy categories or ASD profiles for IEP children
  if (program_type === 'iep') {
    therapy_category = null
  }

  return {
    ...c,
    program_type,
    therapy_category,
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
