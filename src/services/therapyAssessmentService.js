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
async function ensureChildExists(childId, fallbackData = {}) {
  if (!childId) return
  try {
    const existing = await db.select('children', { match: { id: childId }, single: true })
    if (!existing) {
      await db.insert('children', {
        id: childId,
        name: fallbackData.name || `Student ${childId}`,
        gender: fallbackData.gender || 'Male',
        diagnosis: fallbackData.diagnosis || 'IEP Special School',
        profile: fallbackData.profile || 'IEP',
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

  /** Re-export for convenience */
  ensureChildExists,
  TABLE_MAP,

  /**
   * ──────────────────────────────────────────────
   *  INTERNAL: unified insert with FK retry
   * ──────────────────────────────────────────────
   */
  async _save(formType, dbPayload) {
    const table = resolveTable(formType)
    const childId = dbPayload.child_id

    // Remove null assessed_by (FK to users — must be null or valid UUID)
    if (!dbPayload.assessed_by) delete dbPayload.assessed_by

    try {
      const res = await db.insert(table, dbPayload)
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
          const retryRes = await db.insert(table, dbPayload)
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

      // Local storage fallback
      console.warn(`therapyAssessmentService._save(${table}) using local storage:`, err.message)
      const localResult = {
        id: `local-${Date.now()}`,
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
