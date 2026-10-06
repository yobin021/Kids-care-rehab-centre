import { db } from '../lib/db'

function toUUID(val) {
  return typeof val === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(val)
    ? val
    : null
}

export const assessmentService = {

  /**
   * Helper to ensure the child row exists in Postgres before inserting foreign key dependencies.
   */
  async ensureChildExists(childId, fallbackData = {}) {
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
  },

  async save(assessmentData) {
    // form_data is NOT NULL in schema — must always be provided
    const formData = assessmentData.form_data || assessmentData.formData || {}
    const childId = assessmentData.child_id || assessmentData.childId

    // Exact columns from assessments schema
    const payload = {
      child_id: childId,
      assessment_date: assessmentData.assessment_date || assessmentData.assessmentDate
        || new Date().toISOString().split('T')[0],
      form_data: formData,
      isaa_score: assessmentData.isaa_score ?? assessmentData.isaaScore ?? null,
      isaa_severity: assessmentData.isaa_severity || assessmentData.isaaSeverity || null,
      isaa_level: assessmentData.isaa_level ?? assessmentData.isaaLevel ?? null,
      isaa_section_scores: assessmentData.isaa_section_scores || assessmentData.isaaSectionScores || null,
      domain_scores: assessmentData.domain_scores || assessmentData.domainScores || null,
      profile: assessmentData.profile || null,
      profile_description: assessmentData.profile_description || assessmentData.profileDescription || null,
      clinic_exercises: assessmentData.clinic_exercises || assessmentData.clinicExercises || null,
      home_exercises: assessmentData.home_exercises || assessmentData.homeExercises || null,
      status: assessmentData.status || 'completed',
      assessed_by: toUUID(assessmentData.assessed_by || assessmentData.assessedBy)
    }

    // Remove null assessed_by (FK to users — must be null or valid UUID)
    if (!payload.assessed_by) delete payload.assessed_by

    try {
      const res = await db.insert('assessments', payload)
      if (res && res.id) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(`assessment_result_${res.id}`, JSON.stringify(res))
          localStorage.setItem(`assessment_result_${childId}`, JSON.stringify(res))
        }
        return res
      }
      return res || payload
    } catch (err) {
      // If code 23503 (child_id foreign key constraint), auto-ensure child in DB and retry once
      if (err.code === '23503' || String(err.message || '').includes('foreign key')) {
        console.warn('assessmentService.save: auto-creating missing child record in DB...')
        await this.ensureChildExists(childId, {
          name: formData.studentName || formData.name,
          gender: formData.gender,
          diagnosis: 'IEP Special School',
          profile: 'IEP'
        })
        try {
          const retryRes = await db.insert('assessments', payload)
          if (retryRes && retryRes.id) {
            if (typeof window !== 'undefined') {
              localStorage.setItem(`assessment_result_${retryRes.id}`, JSON.stringify(retryRes))
              localStorage.setItem(`assessment_result_${childId}`, JSON.stringify(retryRes))
            }
            return retryRes
          }
        } catch (retryErr) {
          console.warn('assessmentService.save retry failed, using local storage:', retryErr.message)
        }
      }

      console.warn('assessmentService.save using local storage:', err.message)
      const localResult = {
        id: `local-${Date.now()}`,
        ...payload,
        created_at: new Date().toISOString()
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem(`assessment_result_${localResult.id}`, JSON.stringify(localResult))
        localStorage.setItem(`assessment_result_${childId}`, JSON.stringify(localResult))
      }
      return localResult
    }
  },

  async getById(id) {
    if (!id) return null

    const ASSESSMENT_TABLES = [
      'assessment_special_school',
      'assessment_asd',
      'assessment_adhd',
      'assessment_developmental_delay',
      'assessment_learning_disability'
    ]

    for (const table of ASSESSMENT_TABLES) {
      try {
        const res = await db.select(table, {
          select: '*, children(name, age, diagnosis, profile)',
          match: { id },
          single: true
        })
        if (res) return { ...res, source_table: table }
      } catch (_) {}
    }

    // Legacy table fallback
    try {
      const res = await db.select('assessments', {
        select: '*, children(name, age, diagnosis, profile)',
        match: { id },
        single: true
      })
      if (res) return res
    } catch (_) {}

    // Only fallback if explicitly an unsynced offline temporary ID
    if (typeof window !== 'undefined' && String(id).startsWith('local-')) {
      const local = localStorage.getItem(`assessment_result_${id}`)
      if (local) {
        try {
          return JSON.parse(local)
        } catch (e) {}
      }
    }
    return null
  },

  async getByChildId(childId) {
    if (!childId) return []

    const ASSESSMENT_TABLES = [
      'assessment_special_school',
      'assessment_asd',
      'assessment_adhd',
      'assessment_developmental_delay',
      'assessment_learning_disability'
    ]

    let allAssessments = []

    for (const table of ASSESSMENT_TABLES) {
      try {
        const data = await db.select(table, {
          select: '*',
          match: { child_id: childId },
          order: { column: 'assessment_date', ascending: false }
        })
        if (Array.isArray(data) && data.length > 0) {
          allAssessments.push(...data.map(d => ({ ...d, source_table: table })))
        }
      } catch (_) {}
    }

    // Also check legacy assessments table if nothing found
    if (allAssessments.length === 0) {
      try {
        const data = await db.select('assessments', {
          select: '*',
          match: { child_id: childId },
          order: { column: 'assessment_date', ascending: false }
        })
        if (data && data.length > 0) {
          allAssessments.push(...data)
        }
      } catch (_) {}
    }

    if (allAssessments.length > 0) {
      return allAssessments.sort((a, b) => new Date(b.assessment_date || b.created_at || 0) - new Date(a.assessment_date || a.created_at || 0))
    }

    // Database is authoritative: if no database assessment exists, purge any stale local cache and return []
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`assessment_result_${childId}`)
      } catch (_) {}
    }
    return []
  },

  async getAll() {
    const ASSESSMENT_TABLES = [
      'assessment_special_school',
      'assessment_asd',
      'assessment_adhd',
      'assessment_developmental_delay',
      'assessment_learning_disability'
    ]

    let all = []
    for (const table of ASSESSMENT_TABLES) {
      try {
        const data = await db.select(table, {
          select: '*',
          order: { column: 'assessment_date', ascending: false }
        })
        if (Array.isArray(data)) all.push(...data)
      } catch (_) {}
    }
    return all.sort((a, b) => new Date(b.assessment_date || b.created_at || 0) - new Date(a.assessment_date || a.created_at || 0))
  },

  async getAllThisMonth() {
    const ASSESSMENT_TABLES = [
      'assessment_special_school',
      'assessment_asd',
      'assessment_adhd',
      'assessment_developmental_delay',
      'assessment_learning_disability'
    ]

    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    let all = []

    for (const table of ASSESSMENT_TABLES) {
      try {
        const data = await db.select(table, {
          select: 'id, assessment_date, child_id',
          order: { column: 'assessment_date', ascending: false }
        })
        if (Array.isArray(data)) {
          const thisMonth = data.filter(a => a.assessment_date && a.assessment_date >= firstDay)
          all.push(...thisMonth)
        }
      } catch (_) {}
    }

    return all
  }
}
