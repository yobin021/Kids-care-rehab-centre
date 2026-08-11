import { db } from '../lib/db'

function toUUID(val) {
  return typeof val === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(val)
    ? val
    : null
}

export const assessmentService = {

  async save(assessmentData) {
    // form_data is NOT NULL in schema — must always be provided
    const formData = assessmentData.form_data || assessmentData.formData || {}

    // Exact columns from assessments schema
    const payload = {
      child_id: assessmentData.child_id || assessmentData.childId,
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

    console.log('assessmentService.save payload:', payload)

    try {
      return await db.insert('assessments', payload)
    } catch (err) {
      console.error('assessmentService.save error:', err.message, '| code:', err.code)

      // Return a local fallback so the UI can still navigate to results
      return {
        id: `local-${Date.now()}`,
        ...payload,
        created_at: new Date().toISOString()
      }
    }
  },

  async getById(id) {
    try {
      return await db.select('assessments', {
        select: '*, children(name, age, diagnosis, profile)',
        match: { id },
        single: true
      })
    } catch (err) {
      console.warn('assessmentService.getById:', err.message)
      return null
    }
  },

  async getByChildId(childId) {
    try {
      return await db.select('assessments', {
        match: { child_id: childId },
        order: { column: 'created_at', ascending: false }
      }) || []
    } catch (err) {
      console.warn('assessmentService.getByChildId:', err.message)
      return []
    }
  },

  async update(id, updates) {
    try {
      return await db.update('assessments', {
        ...updates,
        updated_at: new Date().toISOString()
      }, { id })
    } catch (err) {
      console.warn('assessmentService.update:', err.message)
      return null
    }
  },

  async getAllThisMonth() {
    try {
      const data = await db.select('assessments', {
        select: 'id, assessment_date, created_at',
        order: { column: 'created_at', ascending: false }
      }) || []

      const now = new Date()
      const currentYear = now.getFullYear()
      const currentMonth = now.getMonth()

      const dbFiltered = data.filter((row) => {
        const dateStr = row.assessment_date || row.created_at
        if (!dateStr) return false
        const d = new Date(dateStr)
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth
      })

      if (dbFiltered.length > 0) return dbFiltered

      // Fallback: check localStorage for saved assessments if DB returns zero
      let localCount = 0
      if (typeof window !== 'undefined') {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.startsWith('assessment_result_')) {
            localCount++
          }
        }
      }
      return localCount > 0 ? new Array(localCount).fill({}) : []
    } catch (err) {
      console.warn('assessmentService.getAllThisMonth notice:', err.message)
      return []
    }
  }
}
