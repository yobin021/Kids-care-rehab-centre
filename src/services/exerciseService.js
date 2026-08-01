import { supabase } from '../lib/supabase'

export const exerciseService = {

  async getAll() {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) throw error
    return data || []
  },

  async getByProfile(profile) {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .contains('for_profiles', 
        [profile])
      .eq('is_active', true)

    if (error) throw error
    return data || []
  },

  async getHomeExercises() {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('is_home_exercise', true)
      .eq('is_active', true)

    if (error) throw error
    return data || []
  }
}
