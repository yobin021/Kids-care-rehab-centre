import { db } from '../lib/db'
import { MASTER_EXERCISES } from '../data/exercisesData'

export const exerciseService = {

  async getAll() {
    try {
      const data = await db.select('exercises', {
        match: { is_active: true },
        order: { column: 'name', ascending: true }
      })

      if (data && data.length > 0) {
        // Merge remote DB rows with master exercises so image_url and rich descriptions are always present
        return MASTER_EXERCISES.map((master) => {
          const remote = data.find((d) => d.id === master.id || d.name?.toLowerCase() === master.name?.toLowerCase());
          return remote
            ? { ...master, ...remote, image_url: remote.image_url || master.image_url }
            : master;
        });
      }
      return MASTER_EXERCISES
    } catch (err) {
      console.warn('exerciseService.getAll fallback notice:', err.message)
      return MASTER_EXERCISES
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
  },

  /**
   * Safety guard: exercises are strictly prohibited for IEP children.
   */
  async getForChild(child, ids = []) {
    if (!child || child.program_type === 'iep') {
      return []
    }
    return await this.getByIds(ids)
  }
}
