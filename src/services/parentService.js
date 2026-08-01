import { supabase } from '../lib/supabase'

export const parentService = {

  async createAccount(parentData, 
    childId, createdBy) {
    const { data, error } = await supabase
      .from('parent_accounts')
      .insert({
        ...parentData,
        child_id: childId,
        created_by: createdBy,
        portal_active: true
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updatePassword(parentId, 
    newPassword) {
    const { data, error } = await supabase
      .from('parent_accounts')
      .update({ 
        password_hash: newPassword 
      })
      .eq('id', parentId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async logExercise(childId, parentId,
    exerciseId, feedback) {
    const today = new Date()
      .toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('exercise_logs')
      .upsert({
        child_id: childId,
        parent_id: parentId,
        exercise_id: exerciseId,
        log_date: today,
        is_done: true,
        feedback: feedback,
        done_at: new Date().toISOString()
      }, {
        onConflict: 
          'child_id,exercise_id,log_date'
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async undoExercise(childId, exerciseId) {
    const today = new Date()
      .toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('exercise_logs')
      .update({ 
        is_done: false,
        feedback: null,
        done_at: null
      })
      .eq('child_id', childId)
      .eq('exercise_id', exerciseId)
      .eq('log_date', today)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getTodayLogs(childId) {
    const today = new Date()
      .toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('exercise_logs')
      .select('*')
      .eq('child_id', childId)
      .eq('log_date', today)

    if (error) throw error
    return data || []
  },

  async getWeekLogs(childId) {
    const today = new Date()
    const weekAgo = new Date(today)
    weekAgo.setDate(today.getDate() - 6)

    const { data, error } = await supabase
      .from('exercise_logs')
      .select('log_date, is_done')
      .eq('child_id', childId)
      .gte('log_date', 
        weekAgo.toISOString()
          .split('T')[0])
      .lte('log_date', 
        today.toISOString()
          .split('T')[0])

    if (error) throw error
    return data || []
  },

  async sendMessage(childId, parentId, 
    message) {
    const today = new Date()
      .toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('parent_messages')
      .insert({
        child_id: childId,
        parent_id: parentId,
        message,
        message_date: today
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getTodayMessage(childId) {
    const today = new Date()
      .toISOString().split('T')[0]

    const { data } = await supabase
      .from('parent_messages')
      .select('*')
      .eq('child_id', childId)
      .eq('message_date', today)
      .single()

    return data || null
  }
}
