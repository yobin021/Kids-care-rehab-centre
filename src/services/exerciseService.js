import { db } from '../lib/db'

export const exerciseService = {

  async getAll() {
    // exercises: id, name, category, category_color, description, home_description,
    //            benefits (jsonb), instructions (jsonb), duration, frequency,
    //            for_profiles (jsonb), is_home_exercise, is_clinic_exercise, is_active
    try {
      return await db.select('exercises', {
        match: { is_active: true },
        order: { column: 'name', ascending: true }
      }) || []
    } catch (err) {
      console.error('exerciseService.getAll error:', err.message)
      return []
    }
  },

  async getByProfile(profile) {
    try {
      // for_profiles is a jsonb array — fetch all and filter client-side
      const data = await db.select('exercises', { match: { is_active: true } })
      return (data || []).filter(
        (ex) => Array.isArray(ex.for_profiles) && ex.for_profiles.includes(profile)
      )
    } catch (err) {
      console.error('exerciseService.getByProfile error:', err.message)
      return []
    }
  },

  async getHomeExercises() {
    try {
      return await db.select('exercises', {
        match: { is_home_exercise: true, is_active: true }
      }) || []
    } catch (err) {
      console.error('exerciseService.getHomeExercises error:', err.message)
      return []
    }
  },

  async getClinicExercises() {
    try {
      return await db.select('exercises', {
        match: { is_clinic_exercise: true, is_active: true }
      }) || []
    } catch (err) {
      console.error('exerciseService.getClinicExercises error:', err.message)
      return []
    }
  },

  async getByIds(ids = []) {
    if (!ids || ids.length === 0) return []
    try {
      const all = await this.getAll()
      return ids.map((id) => (all || []).find((e) => e.id === id || e.name === id)).filter(Boolean)
    } catch (err) {
      console.warn('exerciseService.getByIds notice:', err.message)
      return []
    }
  }
}
