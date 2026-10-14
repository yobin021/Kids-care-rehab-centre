import { db } from '../lib/db'
import { ensureChildExists } from './therapyAssessmentService'

function toUUID(val) {
  return typeof val === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(val)
    ? val
    : null
}

/**
 * Dedicated report tables corresponding to each of the 5 assessment forms.
 */
export const REPORT_TABLE_MAP = {
  special_school:        'reports_special_school',
  iep:                   'reports_special_school',
  asd:                   'reports_asd',
  adhd:                  'reports_adhd',
  developmental_delay:   'reports_developmental_delay',
  learning_disability:   'reports_learning_disability'
}

export const ALL_REPORT_TABLES = [
  'reports_special_school',
  'reports_asd',
  'reports_adhd',
  'reports_developmental_delay',
  'reports_learning_disability'
]

export function resolveReportTable(assessmentType) {
  if (!assessmentType) return null
  const clean = String(assessmentType).toLowerCase().trim()
  if (clean.includes('adhd') || clean.includes('conner')) return 'reports_adhd'
  if (clean.includes('delay') || clean.includes('developmental')) return 'reports_developmental_delay'
  if (clean.includes('learn') || clean.includes('ldst') || clean.includes('sld') || clean.includes('dyslex')) return 'reports_learning_disability'
  if (clean.includes('special') || clean.includes('iep')) return 'reports_special_school'
  if (clean.includes('asd') || clean.includes('autism') || clean.includes('isaa')) return 'reports_asd'
  return REPORT_TABLE_MAP[clean] || null
}

export const reportService = {

  async saveDraft(reportData) {
    try {
      const childId = reportData.child_id || reportData.childId || reportData.id
      const assessmentType = reportData.assessment_type || reportData.assessmentType || 'asd'
      const targetTable = resolveReportTable(assessmentType)

      // Ensure child exists in Postgres before inserting foreign key
      if (childId) {
        await ensureChildExists(childId, { category: assessmentType })
      }

      const payload = {
        child_id: childId,
        assessment_id: toUUID(reportData.assessment_id || reportData.assessmentId),
        assessment_type: assessmentType,
        therapist_report: reportData.therapist_report || reportData.therapistReport || null,
        parent_report: reportData.parent_report || reportData.parentReport || null,
        therapy_details: reportData.therapy_details || reportData.therapyDetails || null,
        prepared_by: reportData.prepared_by || reportData.preparedBy || null,
        prepared_by_id: toUUID(reportData.prepared_by_id || reportData.preparedById),
        status: reportData.status || 'draft',
        last_edited_at: new Date().toISOString()
      }

      // Preserve clinic & home exercises if provided
      const cEx = reportData.clinic_exercises || reportData.clinicExercises
      if (Array.isArray(cEx) && cEx.length > 0) {
        payload.clinic_exercises = cEx
      }
      const hEx = reportData.home_exercises || reportData.homeExercises
      if (Array.isArray(hEx) && hEx.length > 0) {
        payload.home_exercises = hEx
      }

      // If exercises not provided, check assessment fallback across all tables
      if ((!payload.clinic_exercises || !payload.home_exercises) && childId) {
        const assTablesToCheck = targetTable
          ? ['assessment_' + targetTable.replace('reports_', ''), 'assessment_asd', 'assessment_adhd', 'assessment_developmental_delay', 'assessment_learning_disability', 'assessment_special_school']
          : ['assessment_asd', 'assessment_adhd', 'assessment_developmental_delay', 'assessment_learning_disability', 'assessment_special_school']
        for (const assTable of assTablesToCheck) {
          try {
            const assList = await db.select(assTable, { match: { child_id: childId }, order: { column: 'assessment_date', ascending: false }, limit: 1 })
            if (Array.isArray(assList) && assList.length > 0) {
              if (!payload.clinic_exercises && Array.isArray(assList[0].clinic_exercises) && assList[0].clinic_exercises.length > 0) {
                payload.clinic_exercises = assList[0].clinic_exercises
              }
              if (!payload.home_exercises && Array.isArray(assList[0].home_exercises) && assList[0].home_exercises.length > 0) {
                payload.home_exercises = assList[0].home_exercises
              }
              if (payload.clinic_exercises && payload.home_exercises) break
            }
          } catch (_) {}
        }
      }

      // Assessment-specific score fields
      if (reportData.isaa_score !== undefined) payload.isaa_score = reportData.isaa_score
      if (reportData.isaa_severity !== undefined) payload.isaa_severity = reportData.isaa_severity
      if (reportData.isaa_level !== undefined) payload.isaa_level = reportData.isaa_level
      if (reportData.isaa_section_scores !== undefined) payload.isaa_section_scores = reportData.isaa_section_scores
      if (reportData.conners_total_score !== undefined) payload.conners_total_score = reportData.conners_total_score
      if (reportData.conners_t_score !== undefined) payload.conners_t_score = reportData.conners_t_score
      if (reportData.conners_percentile !== undefined) payload.conners_percentile = reportData.conners_percentile
      if (reportData.conners_severity !== undefined) payload.conners_severity = reportData.conners_severity
      if (reportData.adhd_presentation !== undefined) payload.adhd_presentation = reportData.adhd_presentation
      if (reportData.conners_subscales !== undefined) payload.conners_subscales = reportData.conners_subscales
      if (reportData.delay_total_score !== undefined) payload.delay_total_score = reportData.delay_total_score
      if (reportData.delay_severity !== undefined) payload.delay_severity = reportData.delay_severity
      if (reportData.developmental_age !== undefined) payload.developmental_age = reportData.developmental_age
      if (reportData.delay_domains !== undefined) payload.delay_domains = reportData.delay_domains
      if (reportData.milestone_status !== undefined) payload.milestone_status = reportData.milestone_status
      if (reportData.ldst_total_score !== undefined) payload.ldst_total_score = reportData.ldst_total_score
      if (reportData.ldst_severity !== undefined) payload.ldst_severity = reportData.ldst_severity
      if (reportData.ldst_classification !== undefined) payload.ldst_classification = reportData.ldst_classification
      if (reportData.ldst_subtest_scores !== undefined) payload.ldst_subtest_scores = reportData.ldst_subtest_scores
      if (reportData.iep_report !== undefined) payload.iep_report = reportData.iep_report
      if (reportData.iep_cycle !== undefined) payload.iep_cycle = reportData.iep_cycle
      if (reportData.domain_scores !== undefined) payload.domain_scores = reportData.domain_scores
      if (reportData.profile !== undefined) payload.profile = reportData.profile

      if (!payload.assessment_id) delete payload.assessment_id
      if (!payload.prepared_by_id) delete payload.prepared_by_id

      let savedResult = null

      // 1. Try saving to dedicated assessment report table
      if (targetTable) {
        try {
          if (toUUID(reportData.id)) {
            savedResult = await db.update(targetTable, payload, { id: reportData.id })
          } else {
            let existingInTarget = null
            if (payload.assessment_id) {
              const byAss = await db.select(targetTable, {
                match: { assessment_id: payload.assessment_id },
                limit: 1
              })
              if (Array.isArray(byAss) && byAss.length > 0) {
                existingInTarget = byAss[0]
              }
            }
            if (existingInTarget) {
              savedResult = await db.update(targetTable, payload, { id: existingInTarget.id })
            } else {
              savedResult = await db.insert(targetTable, payload)
            }
          }
        } catch (tableErr) {
          console.warn(`reportService.saveDraft notice for ${targetTable}:`, tableErr.message)
        }
      }

      // 2. Always synchronize to master reports table for global lookups & backward compatibility
      try {
        const masterPayload = { ...payload }
        if (savedResult && savedResult.id) masterPayload.id = savedResult.id

        let existingMaster = null
        if (toUUID(masterPayload.id || reportData.id)) {
          existingMaster = await db.select('reports', { match: { id: masterPayload.id || reportData.id }, single: true })
        } else if (payload.assessment_id) {
          const byAss = await db.select('reports', { match: { assessment_id: payload.assessment_id }, limit: 1 })
          if (Array.isArray(byAss) && byAss.length > 0) existingMaster = byAss[0]
        }

        if (existingMaster) {
          const updated = await db.update('reports', masterPayload, { id: existingMaster.id })
          return savedResult || updated || existingMaster
        } else {
          const inserted = await db.insert('reports', masterPayload)
          return savedResult || inserted
        }
      } catch (masterErr) {
        console.warn('reportService.saveDraft master sync notice:', masterErr.message)
      }

      return savedResult || { success: true, id: `local-rep-${Date.now()}` }
    } catch (err) {
      console.warn('reportService.saveDraft error:', err.message)
      return { success: true, id: `local-rep-${Date.now()}` }
    }
  },

  async publish(reportId, publishedBy, publishedById, reportData = {}) {
    try {
      const childId = reportData.child_id || reportData.childId || reportId
      const assessmentType = reportData.assessment_type || reportData.assessmentType || 'asd'
      const targetTable = resolveReportTable(assessmentType)

      const payload = {
        status: 'published',
        published_by: publishedBy || null,
        published_at: new Date().toISOString(),
        last_edited_at: new Date().toISOString()
      }

      if (reportData.assessment_id || reportData.assessmentId) {
        payload.assessment_id = toUUID(reportData.assessment_id || reportData.assessmentId)
      }
      if (assessmentType) payload.assessment_type = assessmentType
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

      // If exercises not in reportData, check assessment fallback across all tables
      if ((!payload.clinic_exercises || !payload.home_exercises) && childId) {
        const assTablesToCheck = targetTable
          ? ['assessment_' + targetTable.replace('reports_', ''), 'assessment_asd', 'assessment_adhd', 'assessment_developmental_delay', 'assessment_learning_disability', 'assessment_special_school']
          : ['assessment_asd', 'assessment_adhd', 'assessment_developmental_delay', 'assessment_learning_disability', 'assessment_special_school']
        for (const assTable of assTablesToCheck) {
          try {
            const assList = await db.select(assTable, { match: { child_id: childId }, order: { column: 'assessment_date', ascending: false }, limit: 1 })
            if (Array.isArray(assList) && assList.length > 0) {
              if (!payload.clinic_exercises && Array.isArray(assList[0].clinic_exercises) && assList[0].clinic_exercises.length > 0) {
                payload.clinic_exercises = assList[0].clinic_exercises
              }
              if (!payload.home_exercises && Array.isArray(assList[0].home_exercises) && assList[0].home_exercises.length > 0) {
                payload.home_exercises = assList[0].home_exercises
              }
              if (payload.clinic_exercises && payload.home_exercises) break
            }
          } catch (_) {}
        }
      }

      if (reportData.prepared_by || reportData.preparedBy) {
        payload.prepared_by = reportData.prepared_by || reportData.preparedBy
      }

      const uuidId = toUUID(publishedById)
      if (uuidId) payload.published_by_id = uuidId

      if (childId) {
        await ensureChildExists(childId, { category: assessmentType })
      }

      // Assessment-specific metrics
      if (reportData.isaa_score !== undefined) payload.isaa_score = reportData.isaa_score
      if (reportData.isaa_severity !== undefined) payload.isaa_severity = reportData.isaa_severity
      if (reportData.isaa_level !== undefined) payload.isaa_level = reportData.isaa_level
      if (reportData.isaa_section_scores !== undefined) payload.isaa_section_scores = reportData.isaa_section_scores
      if (reportData.conners_total_score !== undefined) payload.conners_total_score = reportData.conners_total_score
      if (reportData.conners_t_score !== undefined) payload.conners_t_score = reportData.conners_t_score
      if (reportData.conners_percentile !== undefined) payload.conners_percentile = reportData.conners_percentile
      if (reportData.conners_severity !== undefined) payload.conners_severity = reportData.conners_severity
      if (reportData.adhd_presentation !== undefined) payload.adhd_presentation = reportData.adhd_presentation
      if (reportData.conners_subscales !== undefined) payload.conners_subscales = reportData.conners_subscales
      if (reportData.delay_total_score !== undefined) payload.delay_total_score = reportData.delay_total_score
      if (reportData.delay_severity !== undefined) payload.delay_severity = reportData.delay_severity
      if (reportData.developmental_age !== undefined) payload.developmental_age = reportData.developmental_age
      if (reportData.delay_domains !== undefined) payload.delay_domains = reportData.delay_domains
      if (reportData.milestone_status !== undefined) payload.milestone_status = reportData.milestone_status
      if (reportData.ldst_total_score !== undefined) payload.ldst_total_score = reportData.ldst_total_score
      if (reportData.ldst_severity !== undefined) payload.ldst_severity = reportData.ldst_severity
      if (reportData.ldst_classification !== undefined) payload.ldst_classification = reportData.ldst_classification
      if (reportData.ldst_subtest_scores !== undefined) payload.ldst_subtest_scores = reportData.ldst_subtest_scores
      if (reportData.iep_report !== undefined) payload.iep_report = reportData.iep_report
      if (reportData.iep_cycle !== undefined) payload.iep_cycle = reportData.iep_cycle
      if (reportData.domain_scores !== undefined) payload.domain_scores = reportData.domain_scores

      // 1. Publish in dedicated assessment report table
      if (targetTable) {
        try {
          if (toUUID(reportId)) {
            await db.update(targetTable, payload, { id: reportId })
          } else {
            let existing = null
            if (payload.assessment_id) {
              const byAss = await db.select(targetTable, { match: { assessment_id: payload.assessment_id }, limit: 1 })
              if (Array.isArray(byAss) && byAss.length > 0) existing = byAss[0]
            }
            if (existing) {
              await db.update(targetTable, payload, { id: existing.id })
            } else {
              const inserted = await db.insert(targetTable, { child_id: childId, ...payload })
              if (inserted?.id) reportId = inserted.id
            }
          }
        } catch (tableErr) {
          console.warn(`reportService.publish notice for ${targetTable}:`, tableErr.message)
        }
      }

      // 2. Publish in master reports table
      try {
        if (toUUID(reportId)) {
          return await db.update('reports', payload, { id: reportId })
        }
        let existingMaster = null
        if (payload.assessment_id) {
          const reps = await db.select('reports', { match: { assessment_id: payload.assessment_id }, limit: 1 })
          if (Array.isArray(reps) && reps.length > 0) existingMaster = reps[0]
        }
        if (existingMaster) {
          return await db.update('reports', payload, { id: existingMaster.id })
        }
        return await db.insert('reports', { child_id: childId, ...payload })
      } catch (masterErr) {
        console.warn('reportService.publish master notice:', masterErr.message)
      }

      return { success: true }
    } catch (err) {
      console.warn('reportService.publish error:', err.message)
      return { success: true }
    }
  },

  async update(reportId, updates) {
    try {
      const assessmentType = updates.assessment_type || updates.assessmentType
      const targetTable = resolveReportTable(assessmentType)

      const payload = {
        last_edited_at: new Date().toISOString()
      }

      if (updates.therapist_report || updates.therapistReport)
        payload.therapist_report = updates.therapist_report || updates.therapistReport
      if (updates.parent_report || updates.parentReport)
        payload.parent_report = updates.parent_report || updates.parentReport
      if (updates.therapy_details || updates.therapyDetails)
        payload.therapy_details = updates.therapy_details || updates.therapyDetails
      const cEx = updates.clinic_exercises || updates.clinicExercises
      if (Array.isArray(cEx) && cEx.length > 0) {
        payload.clinic_exercises = cEx
      }
      const hEx = updates.home_exercises || updates.homeExercises
      if (Array.isArray(hEx) && hEx.length > 0) {
        payload.home_exercises = hEx
      }
      if (updates.prepared_by || updates.preparedBy)
        payload.prepared_by = updates.prepared_by || updates.preparedBy
      if (updates.status) payload.status = updates.status

      const match = toUUID(reportId) ? { id: reportId } : { child_id: reportId }

      // Update dedicated table if known
      if (targetTable) {
        try {
          await db.update(targetTable, payload, match)
        } catch (_) {}
      } else {
        // Try all dedicated tables
        for (const tbl of ALL_REPORT_TABLES) {
          try {
            await db.update(tbl, payload, match)
          } catch (_) {}
        }
      }

      // Update master table
      return await db.update('reports', payload, match)
    } catch (err) {
      console.warn('reportService.update notice:', err.message)
      return { success: true }
    }
  },

  async getById(id) {
    if (!id) return null
    try {
      const match = toUUID(id) ? { id } : { child_id: id }

      // 1. Check dedicated assessment report tables first
      for (const table of ALL_REPORT_TABLES) {
        try {
          const rep = await db.select(table, { match, single: true })
          if (rep) {
            rep.source_report_table = table
            if (rep.child_id && !rep.children) {
              try {
                const childData = await db.select('children', { match: { id: rep.child_id }, single: true })
                if (childData) rep.children = childData
              } catch (_) {}
            }
            return rep
          }
        } catch (_) {}
      }

      // 2. Check master reports table
      const rep = await db.select('reports', { match, single: true })
      if (rep) {
        if (rep.child_id && !rep.children) {
          try {
            const childData = await db.select('children', { match: { id: rep.child_id }, single: true })
            if (childData) rep.children = childData
          } catch (_) {}
        }
        return rep
      }

      return null
    } catch (err) {
      console.warn('reportService.getById:', err.message)
      return null
    }
  },

  async getByChildId(childId) {
    if (!childId) return []
    const combined = []
    const seenIds = new Set()

    // 1. Fetch from all 5 dedicated report tables
    for (const table of ALL_REPORT_TABLES) {
      try {
        const list = await db.select(table, {
          match: { child_id: childId },
          order: { column: 'created_at', ascending: false }
        })
        if (Array.isArray(list)) {
          for (const item of list) {
            if (item && item.id && !seenIds.has(item.id)) {
              seenIds.add(item.id)
              combined.push({ ...item, source_report_table: table })
            }
          }
        }
      } catch (_) {}
    }

    // 2. Fetch from master reports table
    try {
      const masterList = await db.select('reports', {
        match: { child_id: childId },
        order: { column: 'created_at', ascending: false }
      })
      if (Array.isArray(masterList)) {
        for (const item of masterList) {
          if (item && item.id && !seenIds.has(item.id)) {
            seenIds.add(item.id)
            combined.push(item)
          }
        }
      }
    } catch (err) {
      console.warn('reportService.getByChildId master lookup:', err.message)
    }

    return combined.sort((a, b) => new Date(b.created_at || b.published_at || 0) - new Date(a.created_at || a.published_at || 0))
  },

  async getPublishedByChildId(childId, category = null) {
    if (!childId) return null
    try {
      const allReps = await this.getByChildId(childId)
      if (Array.isArray(allReps) && allReps.length > 0) {
        const publishedList = allReps.filter(r => r && (r.status === 'published' || r.review_status === 'published'))
        if (publishedList.length > 0) {
          publishedList.sort((a, b) => {
            const dateA = new Date(a.published_at || a.created_at || a.last_edited_at || 0).getTime()
            const dateB = new Date(b.published_at || b.created_at || b.last_edited_at || 0).getTime()
            return dateB - dateA
          })
          return publishedList[0]
        }
      }

      const targetTable = resolveReportTable(category)
      const tablesToCheck = targetTable ? [targetTable, ...ALL_REPORT_TABLES.filter(t => t !== targetTable)] : ALL_REPORT_TABLES

      for (const table of tablesToCheck) {
        try {
          const data = await db.select(table, {
            match: { child_id: childId, status: 'published' },
            order: { column: 'published_at', ascending: false },
            limit: 1
          })
          const rep = Array.isArray(data) ? data[0] : data
          if (rep) {
            rep.source_report_table = table
            return rep
          }
        } catch (_) {}
      }

      // Master reports fallback
      const data = await db.select('reports', {
        match: { child_id: childId, status: 'published' },
        order: { column: 'published_at', ascending: false },
        limit: 1
      })
      const rep = Array.isArray(data) ? data[0] : data
      if (rep) return rep
    } catch (_) {}

    return null
  },

  async submitForReview(reportId, submittedBy, submittedById, reportData = {}) {
    try {
      const childId = reportData.child_id || reportData.childId || reportId
      const assessmentType = reportData.assessment_type || reportData.assessmentType || 'asd'
      const targetTable = resolveReportTable(assessmentType)

      const payload = {
        status: 'pending_review',
        submitted_for_review_at: new Date().toISOString(),
        prepared_by: submittedBy || null
      }

      if (reportData.assessment_id || reportData.assessmentId) {
        payload.assessment_id = toUUID(reportData.assessment_id || reportData.assessmentId)
      }
      if (assessmentType) payload.assessment_type = assessmentType
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

      if (childId) {
        await ensureChildExists(childId, { category: assessmentType })
      }

      // Assessment-specific metrics
      if (reportData.isaa_score !== undefined) payload.isaa_score = reportData.isaa_score
      if (reportData.isaa_severity !== undefined) payload.isaa_severity = reportData.isaa_severity
      if (reportData.isaa_level !== undefined) payload.isaa_level = reportData.isaa_level
      if (reportData.isaa_section_scores !== undefined) payload.isaa_section_scores = reportData.isaa_section_scores
      if (reportData.conners_total_score !== undefined) payload.conners_total_score = reportData.conners_total_score
      if (reportData.conners_t_score !== undefined) payload.conners_t_score = reportData.conners_t_score
      if (reportData.conners_percentile !== undefined) payload.conners_percentile = reportData.conners_percentile
      if (reportData.conners_severity !== undefined) payload.conners_severity = reportData.conners_severity
      if (reportData.adhd_presentation !== undefined) payload.adhd_presentation = reportData.adhd_presentation
      if (reportData.conners_subscales !== undefined) payload.conners_subscales = reportData.conners_subscales
      if (reportData.delay_total_score !== undefined) payload.delay_total_score = reportData.delay_total_score
      if (reportData.delay_severity !== undefined) payload.delay_severity = reportData.delay_severity
      if (reportData.developmental_age !== undefined) payload.developmental_age = reportData.developmental_age
      if (reportData.delay_domains !== undefined) payload.delay_domains = reportData.delay_domains
      if (reportData.milestone_status !== undefined) payload.milestone_status = reportData.milestone_status
      if (reportData.ldst_total_score !== undefined) payload.ldst_total_score = reportData.ldst_total_score
      if (reportData.ldst_severity !== undefined) payload.ldst_severity = reportData.ldst_severity
      if (reportData.ldst_classification !== undefined) payload.ldst_classification = reportData.ldst_classification
      if (reportData.ldst_subtest_scores !== undefined) payload.ldst_subtest_scores = reportData.ldst_subtest_scores
      if (reportData.iep_report !== undefined) payload.iep_report = reportData.iep_report
      if (reportData.iep_cycle !== undefined) payload.iep_cycle = reportData.iep_cycle
      if (reportData.domain_scores !== undefined) payload.domain_scores = reportData.domain_scores

      // 1. Submit in dedicated table
      if (targetTable) {
        try {
          if (toUUID(reportId)) {
            await db.update(targetTable, payload, { id: reportId })
          } else {
            let existing = null
            if (payload.assessment_id) {
              const byAss = await db.select(targetTable, { match: { assessment_id: payload.assessment_id }, limit: 1 })
              if (Array.isArray(byAss) && byAss.length > 0) existing = byAss[0]
            }
            if (existing) {
              await db.update(targetTable, payload, { id: existing.id })
            } else {
              await db.insert(targetTable, { child_id: childId, ...payload })
            }
          }
        } catch (tableErr) {
          console.warn(`reportService.submitForReview notice for ${targetTable}:`, tableErr.message)
        }
      }

      // 2. Submit in master table (optional sync)
      try {
        if (toUUID(reportId)) {
          return await db.update('reports', payload, { id: reportId })
        }
        let existingMaster = null
        if (payload.assessment_id) {
          const reps = await db.select('reports', { match: { assessment_id: payload.assessment_id }, limit: 1 })
          if (Array.isArray(reps) && reps.length > 0) existingMaster = reps[0]
        }
        if (existingMaster) {
          return await db.update('reports', payload, { id: existingMaster.id })
        }
        return await db.insert('reports', { child_id: childId, ...payload })
      } catch (_) {}

      return { success: true }
    } catch (err) {
      console.warn('reportService.submitForReview notice:', err.message)
      return { success: true }
    }
  },

  async getAllPublished() {
    const combined = []
    const seenIds = new Set()

    for (const table of ALL_REPORT_TABLES) {
      try {
        const list = await db.select(table, {
          select: 'id, child_id, status, published_at, published_by, prepared_by, assessment_type, children(name)',
          match: { status: 'published' },
          order: { column: 'published_at', ascending: false }
        })
        if (Array.isArray(list)) {
          for (const item of list) {
            if (item && item.id && !seenIds.has(item.id)) {
              seenIds.add(item.id)
              combined.push({ ...item, source_report_table: table })
            }
          }
        }
      } catch (_) {}
    }

    try {
      const masterList = await db.select('reports', {
        select: 'id, child_id, status, published_at, published_by, prepared_by, assessment_type, children(name)',
        match: { status: 'published' },
        order: { column: 'published_at', ascending: false }
      })
      if (Array.isArray(masterList)) {
        for (const item of masterList) {
          if (item && item.id && !seenIds.has(item.id)) {
            seenIds.add(item.id)
            combined.push(item)
          }
        }
      }
    } catch (err) {
      console.warn('reportService.getAllPublished master:', err.message)
    }

    return combined.sort((a, b) => new Date(b.published_at || 0) - new Date(a.published_at || 0))
  },

  async getAllPending() {
    const combined = []
    const seenIds = new Set()

    for (const table of ALL_REPORT_TABLES) {
      try {
        const list = await db.select(table, {
          select: 'id, child_id, status, assessment_type, created_at, prepared_by, children(name)',
          match: { status: 'pending_review' },
          order: { column: 'created_at', ascending: false }
        })
        if (Array.isArray(list)) {
          for (const item of list) {
            if (item && item.id && !seenIds.has(item.id)) {
              seenIds.add(item.id)
              combined.push({ ...item, source_report_table: table })
            }
          }
        }
      } catch (_) {}
    }

    try {
      const masterList = await db.select('reports', {
        select: 'id, child_id, status, assessment_type, created_at, prepared_by, children(name)',
        match: { status: 'pending_review' },
        order: { column: 'created_at', ascending: false }
      })
      if (Array.isArray(masterList)) {
        for (const item of masterList) {
          if (item && item.id && !seenIds.has(item.id)) {
            seenIds.add(item.id)
            combined.push(item)
          }
        }
      }
    } catch (err) {
      console.warn('reportService.getAllPending master:', err.message)
    }

    return combined.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
  },

  async getPendingCount() {
    try {
      const list = await this.getAllPending()
      return Array.isArray(list) ? list.length : 0
    } catch {
      return 0
    }
  },

  async delete(reportId, assessmentType = null) {
    if (!reportId) return { success: false, error: 'No report ID provided' }
    const tablesToTry = assessmentType
      ? [resolveReportTable(assessmentType), 'reports'].filter(Boolean)
      : [...ALL_REPORT_TABLES, 'reports']

    for (const table of tablesToTry) {
      try {
        await db.delete(table, { id: reportId })
      } catch (_) {}
    }

    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`report_draft_${reportId}`)
        localStorage.removeItem(`report_${reportId}`)
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.includes(reportId)) {
            localStorage.removeItem(key)
          }
        }
      } catch (_) {}
    }
    return { success: true, id: reportId }
  }
}

