import { supabase } from '../lib/supabase'

export const assessmentService = {

  async save(assessmentData) {
    const payload = {
      child_id: assessmentData.child_id || assessmentData.childId,
      assessment_date: assessmentData.assessment_date || assessmentData.assessmentDate || new Date().toISOString().split('T')[0],
      isaa_score: assessmentData.isaa_score ?? assessmentData.isaaScore ?? 0,
      isaa_severity: assessmentData.isaa_severity || assessmentData.isaaSeverity || 'Mild',
      isaa_level: assessmentData.isaa_level ?? assessmentData.isaaLevel ?? 1,
      domain_scores: assessmentData.domain_scores || assessmentData.domainScores || {},
      profile: assessmentData.profile || 'B',
      clinic_exercises: assessmentData.clinic_exercises || assessmentData.clinicExercises || [],
      home_exercises: assessmentData.home_exercises || assessmentData.homeExercises || [],
      form_data: assessmentData.form_data || assessmentData.formData || {},
      status: assessmentData.status || 'completed'
    }

    // Try inserting with assessed_by
    try {
      const { data, error } = await supabase
        .from('assessments')
        .insert({
          ...payload,
          assessed_by: assessmentData.assessed_by || assessmentData.assessedBy || null
        })
        .select()
        .single()

      if (!error && data) return data
      if (error) console.warn('Supabase assessment insert warning (with assessed_by):', error.message)
    } catch (e) {
      console.warn('Assessment save exception:', e.message)
    }

    // Fallback insert without assessed_by (in case of foreign key constraint on users table)
    const { data, error } = await supabase
      .from('assessments')
      .insert(payload)
      .select()
      .single()

    if (error) {
      console.error('Supabase assessment insert error:', error)
      throw error
    }

    return data
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('assessments')
      .select(`
        *,
        children(name, age, diagnosis)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async getByChildId(childId) {
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('child_id', childId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('assessments')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }
}
