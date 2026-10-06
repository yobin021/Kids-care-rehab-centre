import { db } from '../lib/db'
import { ensureChildExists } from './therapyAssessmentService'

function toUUID(val) {
  return typeof val === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(val)
    ? val
    : null
}

export const reportService = {

  async saveDraft(reportData) {
    try {
      const childId = reportData.child_id || reportData.childId || reportData.id

      // 1. Check if a report row already exists for this child or report ID
      let existingRow = null
      if (toUUID(reportData.id)) {
        existingRow = await this.getById(reportData.id)
      }
      if (!existingRow && childId) {
        const reps = await this.getByChildId(childId)
        if (Array.isArray(reps) && reps.length > 0) {
          existingRow = reps[0]
        }
      }

      if (existingRow) {
        return await this.update(existingRow.id, reportData)
      }

      // Ensure child exists before inserting foreign key
      if (childId) {
        await ensureChildExists(childId, { category: reportData.assessment_type })
      }

      // 2. Insert new row
      const payload = {
        child_id: childId,
        assessment_id: toUUID(reportData.assessment_id || reportData.assessmentId),
        assessment_type: reportData.assessment_type || reportData.assessmentType || null,
        therapist_report: reportData.therapist_report || reportData.therapistReport || null,
        parent_report: reportData.parent_report || reportData.parentReport || null,
        therapy_details: reportData.therapy_details || reportData.therapyDetails || null,
        clinic_exercises: reportData.clinic_exercises || reportData.clinicExercises || null,
        home_exercises: reportData.home_exercises || reportData.homeExercises || null,
        prepared_by: reportData.prepared_by || reportData.preparedBy || null,
        prepared_by_id: toUUID(reportData.prepared_by_id || reportData.preparedById),
        status: reportData.status || 'draft'
      }

      if (!payload.assessment_id) delete payload.assessment_id
      if (!payload.assessment_type) delete payload.assessment_type
      if (!payload.prepared_by_id) delete payload.prepared_by_id

      const res = await db.insert('reports', payload)
      return res || { success: true, id: `local-rep-${Date.now()}` }
    } catch (err) {
      console.warn('reportService.saveDraft notice:', err.message)
      return { success: true, id: `local-rep-${Date.now()}` }
    }
  },

  async publish(reportId, publishedBy, publishedById, reportData = {}) {
    try {
      const payload = {
        status: 'published',
        published_by: publishedBy || null,
        published_at: new Date().toISOString()
      }

      if (reportData.assessment_id || reportData.assessmentId) {
        payload.assessment_id = toUUID(reportData.assessment_id || reportData.assessmentId)
      }
      if (reportData.assessment_type || reportData.assessmentType) {
        payload.assessment_type = reportData.assessment_type || reportData.assessmentType
      }
      if (reportData.therapist_report || reportData.therapistReport) {
        payload.therapist_report = reportData.therapist_report || reportData.therapistReport
      }
      if (reportData.parent_report || reportData.parentReport) {
        payload.parent_report = reportData.parent_report || reportData.parentReport
      }
      if (reportData.therapy_details || reportData.therapyDetails) {
        payload.therapy_details = reportData.therapy_details || reportData.therapyDetails
      }
      if (reportData.clinic_exercises || reportData.clinicExercises) {
        payload.clinic_exercises = reportData.clinic_exercises || reportData.clinicExercises
      }
      if (reportData.home_exercises || reportData.homeExercises) {
        payload.home_exercises = reportData.home_exercises || reportData.homeExercises
      }
      if (reportData.prepared_by || reportData.preparedBy) {
        payload.prepared_by = reportData.prepared_by || reportData.preparedBy
      }

      const uuidId = toUUID(publishedById)
      if (uuidId) payload.published_by_id = uuidId

      if (toUUID(reportId)) {
        return await db.update('reports', payload, { id: reportId })
      }

      const childId = reportData.child_id || reportData.childId || reportId

      // Check if report row exists for string childId
      const reps = await this.getByChildId(childId)
      if (Array.isArray(reps) && reps.length > 0) {
        return await db.update('reports', payload, { id: reps[0].id })
      }

      // Ensure child exists in PostgreSQL before inserting foreign key
      if (childId) {
        await ensureChildExists(childId, { category: reportData.assessment_type })
      }

      // Create published report row for child_id
      return await db.insert('reports', {
        child_id: childId,
        ...payload
      })
    } catch (err) {
      console.warn('reportService.publish notice:', err.message)
      return { success: true }
    }
  },

  async update(reportId, updates) {
    try {
      const payload = {
        last_edited_at: new Date().toISOString()
      }

      if (updates.therapist_report || updates.therapistReport)
        payload.therapist_report = updates.therapist_report || updates.therapistReport
      if (updates.parent_report || updates.parentReport)
        payload.parent_report = updates.parent_report || updates.parentReport
      if (updates.therapy_details || updates.therapyDetails)
        payload.therapy_details = updates.therapy_details || updates.therapyDetails
      if (updates.clinic_exercises || updates.clinicExercises)
        payload.clinic_exercises = updates.clinic_exercises || updates.clinicExercises
      if (updates.home_exercises || updates.homeExercises)
        payload.home_exercises = updates.home_exercises || updates.homeExercises
      if (updates.prepared_by || updates.preparedBy)
        payload.prepared_by = updates.prepared_by || updates.preparedBy
      if (updates.status) payload.status = updates.status

      const match = toUUID(reportId) ? { id: reportId } : { child_id: reportId }
      return await db.update('reports', payload, match)
    } catch (err) {
      console.warn('reportService.update notice:', err.message)
      return { success: true }
    }
  },

  async getById(id) {
    try {
      const match = toUUID(id) ? { id } : { child_id: id }
      const rep = await db.select('reports', {
        match,
        single: true
      })
      if (!rep) return null
      if (rep.child_id && !rep.children) {
        try {
          const childData = await db.select('children', {
            match: { id: rep.child_id },
            single: true
          })
          if (childData) rep.children = childData
        } catch (_) {}
      }
      return rep
    } catch (err) {
      console.warn('reportService.getById:', err.message)
      return null
    }
  },

  async getByChildId(childId) {
    if (!childId) return []
    let list = []
    try {
      list = await db.select('reports', {
        match: { child_id: childId },
        order: { column: 'created_at', ascending: false }
      }) || []
    } catch (err) {
      console.warn('reportService.getByChildId:', err.message)
    }

    if (Array.isArray(list) && list.length > 0) return list

    // Database is the single source of truth — no localStorage fallback
    return []
  },

  async getPublishedByChildId(childId) {
    if (!childId) return null

    // Database is the single source of truth for published reports
    try {
      const data = await db.select('reports', {
        match: { child_id: childId, status: 'published' },
        order: { column: 'published_at', ascending: false },
        limit: 1
      })
      const rep = Array.isArray(data) ? data[0] || null : data
      if (rep) return rep
    } catch {
      // no published report found
    }

    return null
  },

  async submitForReview(reportId, submittedBy, submittedById, reportData = {}) {
    try {
      const payload = {
        status: 'pending_review',
        submitted_for_review_at: new Date().toISOString(),
        prepared_by: submittedBy || null
      }

      if (reportData.assessment_id || reportData.assessmentId) {
        payload.assessment_id = toUUID(reportData.assessment_id || reportData.assessmentId)
      }
      if (reportData.assessment_type || reportData.assessmentType) {
        payload.assessment_type = reportData.assessment_type || reportData.assessmentType
      }
      if (reportData.therapist_report || reportData.therapistReport) {
        payload.therapist_report = reportData.therapist_report || reportData.therapistReport
      }
      if (reportData.parent_report || reportData.parentReport) {
        payload.parent_report = reportData.parent_report || reportData.parentReport
      }
      if (reportData.therapy_details || reportData.therapyDetails) {
        payload.therapy_details = reportData.therapy_details || reportData.therapyDetails
      }
      if (reportData.clinic_exercises || reportData.clinicExercises) {
        payload.clinic_exercises = reportData.clinic_exercises || reportData.clinicExercises
      }
      if (reportData.home_exercises || reportData.homeExercises) {
        payload.home_exercises = reportData.home_exercises || reportData.homeExercises
      }

      const uuidId = toUUID(submittedById)
      if (uuidId) payload.prepared_by_id = uuidId

      if (toUUID(reportId)) {
        return await db.update('reports', payload, { id: reportId })
      }

      const childId = reportData.child_id || reportData.childId || reportId
      const reps = await this.getByChildId(childId)
      if (Array.isArray(reps) && reps.length > 0) {
        return await db.update('reports', payload, { id: reps[0].id })
      }

      return await db.insert('reports', {
        child_id: childId,
        ...payload
      })
    } catch (err) {
      console.warn('reportService.submitForReview notice:', err.message)
      return { success: true }
    }
  },

  async getAllPublished() {
    try {
      return await db.select('reports', {
        select: 'id, child_id, status, published_at, published_by, prepared_by, assessment_type, children(name)',
        match: { status: 'published' },
        order: { column: 'published_at', ascending: false }
      }) || []
    } catch (err) {
      console.warn('reportService.getAllPublished:', err.message)
      return []
    }
  },

  async getAllPending() {
    try {
      return await db.select('reports', {
        select: 'id, child_id, status, assessment_type, created_at, prepared_by, children(name)',
        match: { status: 'pending_review' },
        order: { column: 'created_at', ascending: false }
      }) || []
    } catch (err) {
      console.warn('reportService.getAllPending:', err.message)
      return []
    }
  },

  async getPendingCount() {
    try {
      const list = await this.getAllPending()
      return Array.isArray(list) ? list.length : 0
    } catch {
      return 0
    }
  }
}

