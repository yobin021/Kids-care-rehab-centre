import { db } from '../lib/db'

function toUUID(val) {
  return typeof val === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(val)
    ? val : null
}

export const iepService = {

  /**
   * Get all assessments + reports for a child, newest first.
   * Used to build the IEP cycle history table.
   */
  async getIepHistory(childId) {
    try {
      const [assessments, reports] = await Promise.all([
        db.select('assessment_special_school', {
          match: { child_id: childId },
          order: { column: 'created_at', ascending: false }
        }),
        db.select('reports', {
          match: { child_id: childId },
          order: { column: 'created_at', ascending: false }
        })
      ])

      const apts = Array.isArray(assessments) ? assessments : []
      const rpts = Array.isArray(reports) ? reports : []

      // Pair each assessment with its report
      return apts.map((a, idx) => {
        const report = rpts.find(r => r.assessment_id === a.id) || rpts[idx] || null
        const cycle = apts.length - idx // newest = highest cycle
        const startDate = a.assessment_date
        const endDate = addDays(startDate, 90)
        return {
          cycle,
          assessment: a,
          report,
          period: `Month ${(cycle - 1) * 3}–${cycle * 3}`,
          startDate,
          endDate,
          reviewStatus: report?.review_status || (report ? 'draft' : null),
          reportStatus: report?.status || null,
          nextReviewDate: report?.next_review_date || addDays(startDate, 90)
        }
      })
    } catch (err) {
      console.warn('iepService.getIepHistory:', err.message)
      return []
    }
  },

  /**
   * Get the most recent completed assessment for a child (for cycle 2+ comparison).
   */
  async getPreviousAssessment(childId, excludeAssessmentId = null) {
    try {
      const all = await db.select('assessment_special_school', {
        match: { child_id: childId },
        order: { column: 'created_at', ascending: false }
      }) || []

      const filtered = excludeAssessmentId
        ? all.filter(a => a.id !== excludeAssessmentId)
        : all

      return filtered[0] || null
    } catch (err) {
      console.warn('iepService.getPreviousAssessment:', err.message)
      return null
    }
  },

  /**
   * Get count of reports pending admin review.
   */
  async getPendingReviewCount() {
    try {
      const data = await db.select('reports', {
        select: 'id, review_status',
        match: { review_status: 'pending_review' }
      }) || []
      return Array.isArray(data) ? data.length : 0
    } catch (err) {
      console.warn('iepService.getPendingReviewCount:', err.message)
      return 0
    }
  },

  /**
   * Get all reports pending admin review (with child info).
   */
  async getPendingReview() {
    try {
      const reports = await db.select('reports', {
        match: { review_status: 'pending_review' },
        order: { column: 'created_at', ascending: false }
      }) || []

      if (Array.isArray(reports) && reports.length > 0) {
        try {
          const children = await db.select('children', {}) || []
          return reports.map(r => ({
            ...r,
            children: children.find(c => c.id === r.child_id) || r.children || null
          }))
        } catch (_) {}
      }
      return reports
    } catch (err) {
      console.warn('iepService.getPendingReview:', err.message)
      return []
    }
  },

  /**
   * Save IEP draft report to DB. Creates a new report row or updates existing.
   */
  async saveIepDraft({ childId, assessmentId, previousAssessmentId, iepReport, preparedBy, preparedById, cycle }) {
    const nextReviewDate = addDays(new Date().toISOString().split('T')[0], 90)

    const payload = {
      child_id: childId,
      assessment_id: toUUID(assessmentId),
      iep_report: iepReport,
      iep_cycle: cycle || 1,
      review_status: 'pending_review',
      status: 'draft',
      prepared_by: preparedBy || null,
      next_review_date: nextReviewDate
    }

    if (toUUID(previousAssessmentId)) {
      payload.previous_assessment_id = previousAssessmentId
    }
    if (toUUID(preparedById)) {
      payload.prepared_by_id = preparedById
    }

    try {
      // Check if a report already exists for this assessment
      const existing = await db.select('reports', {
        match: { assessment_id: assessmentId },
        single: true
      })

      let res = null
      if (existing && existing.id) {
        res = await db.update('reports', payload, { id: existing.id })
      } else {
        res = await db.insert('reports', payload)
      }

      if (res && res.id) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(`iep_report_${res.id}`, JSON.stringify(res))
        }
      }
      return res
    } catch (err) {
      console.warn('iepService.saveIepDraft fallback:', err.message)
      const fallbackId = `local-${Date.now()}`
      const fallbackReport = {
        id: fallbackId,
        child_id: childId,
        assessment_id: assessmentId,
        iep_report: iepReport,
        iep_cycle: cycle || 1,
        review_status: 'pending_review',
        status: 'draft',
        prepared_by: preparedBy || 'Therapist',
        next_review_date: nextReviewDate,
        created_at: new Date().toISOString()
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem(`iep_report_${fallbackId}`, JSON.stringify(fallbackReport))
        localStorage.setItem(`report_draft_${childId}`, JSON.stringify(fallbackReport))
      }
      return fallbackReport
    }
  },

  /**
   * Admin: update the IEP report content (editable sections).
   */
  async updateIepReport(reportId, iepReport) {
    try {
      const res = await db.update('reports', {
        iep_report: iepReport,
        last_edited_at: new Date().toISOString()
      }, { id: reportId })

      if (typeof window !== 'undefined') {
        localStorage.setItem(`iep_report_${reportId}`, JSON.stringify(res || { id: reportId, iep_report: iepReport }))
      }
      return res
    } catch (err) {
      console.warn('iepService.updateIepReport local save:', err.message)
      if (typeof window !== 'undefined') {
        const existing = localStorage.getItem(`iep_report_${reportId}`)
        const current = existing ? JSON.parse(existing) : { id: reportId }
        current.iep_report = iepReport
        localStorage.setItem(`iep_report_${reportId}`, JSON.stringify(current))
      }
      return { id: reportId, iep_report: iepReport }
    }
  },

  /**
   * Admin: publish an IEP report.
   */
  async publishIepReport(reportId, adminName, adminId) {
    const now = new Date().toISOString()
    const payload = {
      status: 'published',
      review_status: 'published',
      reviewed_by: adminName || null,
      reviewed_at: now,
      published_by: adminName || null,
      published_at: now
    }
    if (toUUID(adminId)) {
      payload.published_by_id = adminId
    }

    try {
      const res = await db.update('reports', payload, { id: reportId })
      if (typeof window !== 'undefined') {
        localStorage.setItem(`iep_report_${reportId}`, JSON.stringify(res || { id: reportId, ...payload }))
        if (res?.child_id) {
          localStorage.setItem(`report_published_${res.child_id}`, JSON.stringify(res))
        }
      }
      return res
    } catch (err) {
      console.warn('iepService.publishIepReport local fallback:', err.message)
      if (typeof window !== 'undefined') {
        const existing = localStorage.getItem(`iep_report_${reportId}`)
        const current = existing ? JSON.parse(existing) : { id: reportId }
        const merged = { ...current, ...payload }
        localStorage.setItem(`iep_report_${reportId}`, JSON.stringify(merged))
      }
      return { id: reportId, ...payload }
    }
  },

  /**
   * Get a single report by ID (with child info attached).
   */
  async getReportById(reportId) {
    try {
      let rep = await db.select('reports', {
        match: { id: reportId },
        single: true
      })

      if (!rep && typeof window !== 'undefined') {
        const saved = localStorage.getItem(`iep_report_${reportId}`) || localStorage.getItem(`report_draft_${reportId}`)
        if (saved) {
          try { rep = JSON.parse(saved) } catch (_) {}
        }
      }

      if (rep && rep.child_id && !rep.children) {
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
      console.warn('iepService.getReportById:', err.message)
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(`iep_report_${reportId}`) || localStorage.getItem(`report_draft_${reportId}`)
        if (saved) {
          try { return JSON.parse(saved) } catch (_) {}
        }
      }
      return null
    }
  },

  /**
   * Get latest published IEP report for a child (for parent portal).
   */
  async getPublishedForChild(childId) {
    try {
      const data = await db.select('reports', {
        match: { child_id: childId, status: 'published' },
        order: { column: 'published_at', ascending: false },
        limit: 1
      })
      const arr = Array.isArray(data) ? data : []
      if (arr[0]) return arr[0]

      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(`report_published_${childId}`)
        if (saved) {
          try { return JSON.parse(saved) } catch (_) {}
        }
      }
      return null
    } catch (err) {
      console.warn('iepService.getPublishedForChild:', err.message)
      return null
    }
  },

  /**
   * Get all IEP reports for a child (any status) for history.
   */
  async getReportsByChildId(childId) {
    try {
      return await db.select('reports', {
        match: { child_id: childId },
        order: { column: 'created_at', ascending: false }
      }) || []
    } catch (err) {
      console.warn('iepService.getReportsByChildId:', err.message)
      return []
    }
  }
}

/** Helper: add N days to a date string (YYYY-MM-DD) */
function addDays(dateStr, days) {
  try {
    const d = new Date(dateStr)
    d.setDate(d.getDate() + days)
    return d.toISOString().split('T')[0]
  } catch {
    const d = new Date()
    d.setDate(d.getDate() + days)
    return d.toISOString().split('T')[0]
  }
}
