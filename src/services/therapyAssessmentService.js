import { db } from '../lib/db'

/**
 * Mapping from therapy category / form type to their dedicated assessment table.
 */
const TABLE_MAP = {
  special_school:        'assessment_special_school',
  asd:                   'assessment_asd',
  adhd:                  'assessment_adhd',
  developmental_delay:   'assessment_developmental_delay',
  learning_disability:   'assessment_learning_disability'
}

function toUUID(val) {
  return typeof val === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(val)
    ? val
    : null
}

function resolveTable(formType) {
  const table = TABLE_MAP[formType]
  if (!table) throw new Error(`Unknown assessment form type: "${formType}". Valid types: ${Object.keys(TABLE_MAP).join(', ')}`)
  return table
}

/**
 * Helper to ensure the child row exists in Postgres before inserting FK dependencies.
 */
export async function ensureChildExists(childId, fallbackData = {}) {
  if (!childId) return
  try {
    const existing = await db.select('children', { match: { id: childId }, single: true })
    if (!existing) {
      let localChild = null
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('kcr_registered_children') || localStorage.getItem('children')
          if (stored) {
            const parsed = JSON.parse(stored)
            if (Array.isArray(parsed)) localChild = parsed.find(c => c.id === childId)
          }
        } catch (_) {}
      }

      const category = (fallbackData.category || fallbackData.therapy_category || localChild?.therapy_category || '').toLowerCase()
      let defaultDiagnosis = 'Developmental Delay'
      let defaultProfile = 'Developmental Delay'
      if (category.includes('delay') || category.includes('developmental')) {
        defaultDiagnosis = 'Developmental Delay'
        defaultProfile = 'Developmental Delay'
      } else if (category.includes('adhd')) {
        defaultDiagnosis = 'ADHD'
        defaultProfile = 'ADHD'
      } else if (category.includes('learn') || category.includes('ldst') || category.includes('sld')) {
        defaultDiagnosis = 'Learning Disability'
        defaultProfile = 'Learning Disability'
      } else if (category.includes('asd') || category.includes('autism')) {
        defaultDiagnosis = 'ASD'
        defaultProfile = 'ASD'
      } else if (category.includes('special') || category.includes('iep')) {
        defaultDiagnosis = 'IEP Special School'
        defaultProfile = 'IEP'
      }

      await db.insert('children', {
        id: childId,
        name: localChild?.name || fallbackData.name || `Child ${childId}`,
        gender: localChild?.gender || fallbackData.gender || 'Male',
        age: localChild?.age || fallbackData.age || null,
        date_of_birth: localChild?.dob || localChild?.date_of_birth || fallbackData.dob || null,
        diagnosis: localChild?.diagnosis || fallbackData.diagnosis || defaultDiagnosis,
        profile: localChild?.profile || fallbackData.profile || defaultProfile,
        registered_date: new Date().toISOString().split('T')[0],
        is_active: true
      })
    }
  } catch (e) {
    console.warn('ensureChildExists notice:', e.message)
  }
}

export const therapyAssessmentService = {

  /**
   * ──────────────────────────────────────────────
   *  SAVE — routes to the correct table
   * ──────────────────────────────────────────────
   */

  /** Save an IEP Special School assessment */
  async saveSpecialSchool(payload) {
    return this._save('special_school', {
      id:                  payload.id,
      child_id:            payload.child_id,
      assessment_date:     payload.assessment_date || new Date().toISOString().split('T')[0],
      domain_scores:       payload.domain_scores || {},
      profile:             payload.profile || null,
      profile_description: payload.profile_description || null,
      clinic_exercises:    payload.clinic_exercises || null,
      home_exercises:      payload.home_exercises || null,
      form_data:           payload.form_data || {},
      status:              payload.status || 'completed',
      assessed_by:         toUUID(payload.assessed_by)
    })
  },

  /** Save an ISAA / ASD assessment */
  async saveASD(payload) {
    return this._save('asd', {
      id:                  payload.id,
      child_id:            payload.child_id,
      assessment_date:     payload.assessment_date || new Date().toISOString().split('T')[0],
      isaa_score:          payload.isaa_score ?? null,
      isaa_severity:       payload.isaa_severity || null,
      isaa_level:          payload.isaa_level ?? null,
      isaa_section_scores: payload.isaa_section_scores || null,
      domain_scores:       payload.domain_scores || {},
      profile:             payload.profile || null,
      profile_description: payload.profile_description || null,
      clinic_exercises:    payload.clinic_exercises || null,
      home_exercises:      payload.home_exercises || null,
      form_data:           payload.form_data || {},
      status:              payload.status || 'completed',
      assessed_by:         toUUID(payload.assessed_by)
    })
  },

  /** Save a Conners / ADHD assessment */
  async saveADHD(payload) {
    return this._save('adhd', {
      id:                  payload.id,
      child_id:            payload.child_id,
      assessment_date:     payload.assessment_date || new Date().toISOString().split('T')[0],
      conners_total_score: payload.conners_total_score ?? payload.isaa_score ?? null,
      conners_t_score:     payload.conners_t_score ?? null,
      conners_percentile:  payload.conners_percentile ?? null,
      conners_severity:    payload.conners_severity ?? payload.isaa_severity ?? null,
      conners_subscales:   payload.conners_subscales ?? payload.isaa_section_scores ?? null,
      adhd_presentation:   payload.adhd_presentation || null,
      domain_scores:       payload.domain_scores || {},
      profile:             payload.profile || null,
      profile_description: payload.profile_description || null,
      clinic_exercises:    payload.clinic_exercises || null,
      home_exercises:      payload.home_exercises || null,
      form_data:           payload.form_data || {},
      status:              payload.status || 'completed',
      assessed_by:         toUUID(payload.assessed_by)
    })
  },

  /** Save a Developmental Delay assessment */
  async saveDelay(payload) {
    return this._save('developmental_delay', {
      id:                  payload.id,
      child_id:            payload.child_id,
      assessment_date:     payload.assessment_date || new Date().toISOString().split('T')[0],
      delay_total_score:   payload.delay_total_score ?? payload.isaa_score ?? null,
      delay_severity:      payload.delay_severity ?? payload.isaa_severity ?? null,
      developmental_age:   payload.developmental_age || null,
      delay_domains:       payload.delay_domains || null,
      milestone_status:    payload.milestone_status || null,
      domain_scores:       payload.domain_scores || {},
      profile:             payload.profile || null,
      profile_description: payload.profile_description || null,
      clinic_exercises:    payload.clinic_exercises || null,
      home_exercises:      payload.home_exercises || null,
      form_data:           payload.form_data || {},
      status:              payload.status || 'completed',
      assessed_by:         toUUID(payload.assessed_by)
    })
  },

  /** Save an LDST / Learning Disability assessment */
  async saveLearningDisability(payload) {
    return this._save('learning_disability', {
      id:                  payload.id,
      child_id:            payload.child_id,
      assessment_date:     payload.assessment_date || new Date().toISOString().split('T')[0],
      ldst_total_score:    payload.ldst_total_score ?? payload.isaa_score ?? null,
      ldst_severity:       payload.ldst_severity ?? payload.isaa_severity ?? null,
      ldst_subtest_scores: payload.ldst_subtest_scores || null,
      ldst_classification: payload.ldst_classification || null,
      domain_scores:       payload.domain_scores || {},
      profile:             payload.profile || null,
      profile_description: payload.profile_description || null,
      clinic_exercises:    payload.clinic_exercises || null,
      home_exercises:      payload.home_exercises || null,
      form_data:           payload.form_data || {},
      status:              payload.status || 'completed',
      assessed_by:         toUUID(payload.assessed_by)
    })
  },

  /**
   * ──────────────────────────────────────────────
   *  QUERY helpers
   * ──────────────────────────────────────────────
   */

  /** Get all assessments for a child from a specific form type */
  async getByChildId(childId, formType) {
    const table = resolveTable(formType)
    try {
      const data = await db.select(table, {
        select: '*',
        match: { child_id: childId },
        order: { column: 'assessment_date', ascending: false }
      })
      return Array.isArray(data) ? data : []
    } catch (err) {
      console.warn(`therapyAssessmentService.getByChildId (${table}):`, err.message)
      return []
    }
  },

  /** Get a single assessment by ID from a specific form type */
  async getById(id, formType) {
    const table = resolveTable(formType)
    try {
      const res = await db.select(table, {
        select: '*, children(name, age, diagnosis, profile)',
        match: { id },
        single: true
      })
      return res || null
    } catch (err) {
      console.warn(`therapyAssessmentService.getById (${table}):`, err.message)
      return null
    }
  },

  /** Get ALL assessments across all form tables for a given child */
  async getAllForChild(childId) {
    const results = {}
    for (const [formType, table] of Object.entries(TABLE_MAP)) {
      try {
        const data = await db.select(table, {
          select: '*',
          match: { child_id: childId },
          order: { column: 'assessment_date', ascending: false }
        })
        results[formType] = Array.isArray(data) ? data : []
      } catch (err) {
        console.warn(`therapyAssessmentService.getAllForChild (${table}):`, err.message)
        results[formType] = []
      }
    }
    return results
  },

  /** Get assessments completed this month for a specific form type */
  async getThisMonth(formType) {
    const table = resolveTable(formType)
    try {
      const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
      const data = await db.select(table, {
        select: 'id, assessment_date, child_id',
        order: { column: 'assessment_date', ascending: false }
      })
      if (Array.isArray(data)) {
        return data.filter(a => a.assessment_date && a.assessment_date >= firstDay)
      }
      return []
    } catch (err) {
      console.warn(`therapyAssessmentService.getThisMonth (${table}):`, err.message)
      return []
    }
  },

  /** Get total counts across all assessment tables (for dashboard) */
  async getDashboardCounts() {
    const counts = {}
    for (const [formType, table] of Object.entries(TABLE_MAP)) {
      try {
        const data = await db.select(table, { select: 'id' })
        counts[formType] = Array.isArray(data) ? data.length : 0
      } catch (err) {
        counts[formType] = 0
      }
    }
    counts.total = Object.values(counts).reduce((s, n) => s + n, 0)
    return counts
  },

  /** Update an existing assessment directly */
  async update(id, formType, updates) {
    const table = resolveTable(formType)
    if (!toUUID(id)) return null
    return await db.update(table, updates, { id })
  },

  /** Re-export for convenience */
  ensureChildExists,
  TABLE_MAP,

  /**
   * ──────────────────────────────────────────────
   *  INTERNAL: unified save (insert or update) with FK retry
   * ──────────────────────────────────────────────
   */
  async _save(formType, dbPayload) {
    const table = resolveTable(formType)
    const childId = dbPayload.child_id
    const existingId = dbPayload.id || dbPayload.assessment_id

    // Remove null assessed_by (FK to users — must be null or valid UUID)
    if (!dbPayload.assessed_by) delete dbPayload.assessed_by

    // 1. If an existing assessment ID is provided (EDIT MODE)
    // ALWAYS update the original record in place — NEVER create a duplicate copy!
    if (existingId) {
      if (toUUID(existingId)) {
        const updatePayload = { ...dbPayload }
        delete updatePayload.id
        delete updatePayload.assessment_id
        delete updatePayload._table
        delete updatePayload.created_at

        // Try updating in primary table first
        try {
          const updated = await db.update(table, updatePayload, { id: existingId })
          if (updated && updated.id) {
            const resObj = { ...updated, id: existingId, _table: table }
            if (typeof window !== 'undefined') {
              localStorage.setItem(`assessment_result_${existingId}`, JSON.stringify(resObj))
              localStorage.setItem(`assessment_result_${childId}`, JSON.stringify(resObj))
            }
            return resObj
          }
        } catch (updErr) {
          console.warn(`therapyAssessmentService._save update (${table}) notice:`, updErr.message)
        }

        // If not found in primary table, try other assessment tables in case of table migration
        for (const altTable of Object.values(TABLE_MAP)) {
          if (altTable === table) continue
          try {
            const updated = await db.update(altTable, updatePayload, { id: existingId })
            if (updated && updated.id) {
              const resObj = { ...updated, id: existingId, _table: altTable }
              if (typeof window !== 'undefined') {
                localStorage.setItem(`assessment_result_${existingId}`, JSON.stringify(resObj))
                localStorage.setItem(`assessment_result_${childId}`, JSON.stringify(resObj))
              }
              return resObj
            }
          } catch (_) {}
        }
      }

      // If database update returned null or if it's a local ID:
      // DO NOT insert a new duplicate record! Update local storage under original ID
      console.warn(`therapyAssessmentService._save: edit mode for ${existingId}, updating local record only`)
      const localResult = {
        ...dbPayload,
        id: existingId,
        _table: table,
        updated_at: new Date().toISOString()
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem(`assessment_result_${existingId}`, JSON.stringify(localResult))
        localStorage.setItem(`assessment_result_${childId}`, JSON.stringify(localResult))
      }
      return localResult
    }

    // 2. Otherwise insert new record (NEW ASSESSMENT MODE)
    try {
      const insertPayload = { ...dbPayload }
      if (!toUUID(insertPayload.id)) delete insertPayload.id
      delete insertPayload._table
      const res = await db.insert(table, insertPayload)
      if (res && res.id) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(`assessment_result_${res.id}`, JSON.stringify({ ...res, _table: table }))
          localStorage.setItem(`assessment_result_${childId}`, JSON.stringify({ ...res, _table: table }))
        }
        return res
      }
      return res || dbPayload
    } catch (err) {
      // Auto-create missing child row on FK violation, then retry
      if (err.code === '23503' || String(err.message || '').includes('foreign key')) {
        console.warn(`therapyAssessmentService._save(${table}): auto-creating missing child...`)
        await ensureChildExists(childId)
        try {
          const insertPayload = { ...dbPayload }
          if (!toUUID(insertPayload.id)) delete insertPayload.id
          delete insertPayload._table
          const retryRes = await db.insert(table, insertPayload)
          if (retryRes && retryRes.id) {
            if (typeof window !== 'undefined') {
              localStorage.setItem(`assessment_result_${retryRes.id}`, JSON.stringify({ ...retryRes, _table: table }))
              localStorage.setItem(`assessment_result_${childId}`, JSON.stringify({ ...retryRes, _table: table }))
            }
            return retryRes
          }
        } catch (retryErr) {
          console.warn(`therapyAssessmentService._save(${table}) retry failed:`, retryErr.message)
        }
      }

      // Local storage fallback for new assessments
      console.warn(`therapyAssessmentService._save(${table}) using local storage:`, err.message)
      const localResult = {
        id: dbPayload.id || `local-${Date.now()}`,
        ...dbPayload,
        _table: table,
        created_at: new Date().toISOString()
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem(`assessment_result_${localResult.id}`, JSON.stringify(localResult))
        localStorage.setItem(`assessment_result_${childId}`, JSON.stringify(localResult))
      }
      return localResult
    }
  }
}
