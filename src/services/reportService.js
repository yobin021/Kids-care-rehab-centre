import { supabase } from '../lib/supabase'

export const reportService = {

  async saveDraft(reportData) {
    const existing = reportData.id 
      ? await this.getById(reportData.id) 
      : null

    if (existing) {
      const { data, error } = 
        await supabase
          .from('reports')
          .update({
            ...reportData,
            last_edited_at: 
              new Date().toISOString()
          })
          .eq('id', reportData.id)
          .select()
          .single()

      if (error) throw error
      return data
    }

    const { data, error } = await supabase
      .from('reports')
      .insert({
        ...reportData,
        status: 'draft'
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async publish(reportId, publishedBy, 
    publishedById) {
    const { data, error } = await supabase
      .from('reports')
      .update({
        status: 'published',
        published_by: publishedBy,
        published_by_id: publishedById,
        published_at: 
          new Date().toISOString()
      })
      .eq('id', reportId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(reportId, updates) {
    const { data, error } = await supabase
      .from('reports')
      .update({
        ...updates,
        last_edited_at: 
          new Date().toISOString()
      })
      .eq('id', reportId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('reports')
      .select(`
        *,
        children(
          id, name, age, diagnosis, 
          profile, date_of_birth
        ),
        assessments(
          isaa_score, isaa_severity,
          isaa_level, domain_scores,
          profile, clinic_exercises,
          home_exercises
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async getByChildId(childId) {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('child_id', childId)
      .order('created_at', 
        { ascending: false })

    if (error) throw error
    return data
  },

  async getPublishedByChildId(childId) {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('child_id', childId)
      .eq('status', 'published')
      .order('published_at', 
        { ascending: false })
      .limit(1)
      .single()

    if (error) return null
    return data
  },

  async getAllPublished() {
    const { data, error } = await supabase
      .from('reports')
      .select(`
        id, child_id, status,
        published_at, published_by,
        prepared_by,
        children(name)
      `)
      .eq('status', 'published')
      .order('published_at', 
        { ascending: false })

    if (error) throw error
    return data
  }
}
