import { db } from '../lib/db.js'
import { MASTER_EXERCISES } from '../data/exercisesData.js'

/**
 * Intelligent exercise item resolver.
 * Handles IDs ('ex-01'), exact names ('Jumping Jacks'), partial matches ('Therapy Ball'),
 * or custom clinical strings ('Tummy Time & Floor Crawling Games') and guarantees a complete
 * exercise object with category, description, and high-quality verified image URL.
 */
export function resolveExerciseItem(item, availableList = MASTER_EXERCISES) {
  if (!item) return null
  if (typeof item === 'object' && item.name && (item.image_url || item.imageUrl)) {
    return {
      ...item,
      image_url: item.image_url || item.imageUrl
    }
  }

  const searchStr = (typeof item === 'string' ? item : item.name || item.id || '').trim().toLowerCase()
  if (!searchStr) return null

  // 1. Exact ID match
  let found = availableList.find(e => e.id?.toLowerCase() === searchStr)
  if (found) return found

  // 2. Exact Name match (case-insensitive)
  found = availableList.find(e => e.name?.toLowerCase() === searchStr)
  if (found) return found

  // 3. Substring / normalized match (e.g. "Swing Therapy" -> "Swing Therapy (Pediatric Swing)", "Treadmill" -> "Treadmill Training")
  found = availableList.find(e => {
    const eName = e.name?.toLowerCase() || ''
    return eName.includes(searchStr) || searchStr.includes(eName)
  })
  if (found) return found

  // 4. Clinical semantic keyword matching
  if (searchStr.includes('tummy') || searchStr.includes('crawl') || searchStr.includes('prone')) {
    const matched = availableList.find(e => e.id === 'ex-24') || availableList.find(e => e.id === 'ex-13')
    return { ...matched, name: typeof item === 'string' ? item : item.name, category: 'Gross Motor & Prone Skills' }
  }
  if (searchStr.includes('ball') || searchStr.includes('rocking')) {
    const matched = availableList.find(e => e.id === 'ex-15') || availableList.find(e => e.id === 'ex-07')
    return { ...matched, name: typeof item === 'string' ? item : item.name, category: 'Sensory & Postural Control' }
  }
  if (searchStr.includes('balance') || searchStr.includes('stepping') || searchStr.includes('line')) {
    const matched = availableList.find(e => e.id === 'ex-10') || availableList.find(e => e.id === 'ex-09')
    return { ...matched, name: typeof item === 'string' ? item : item.name, category: 'Balance & Motor Coordination' }
  }
  if (searchStr.includes('pincer') || searchStr.includes('peg') || searchStr.includes('stack') || searchStr.includes('cup') || searchStr.includes('grasp')) {
    const matched = availableList.find(e => e.id === 'ex-16') || availableList.find(e => e.id === 'ex-20')
    return { ...matched, name: typeof item === 'string' ? item : item.name, category: 'Fine Motor & Dexterity' }
  }
  if (searchStr.includes('speech') || searchStr.includes('sound') || searchStr.includes('rhyme') || searchStr.includes('talk')) {
    const matched = availableList.find(e => e.id === 'ex-29') || availableList.find(e => e.id === 'ex-31')
    return { ...matched, name: typeof item === 'string' ? item : item.name, category: 'Speech & Communication' }
  }
  if (searchStr.includes('sensory') || searchStr.includes('tactile')) {
    const matched = availableList.find(e => e.id === 'ex-28')
    return { ...matched, name: typeof item === 'string' ? item : item.name, category: 'Sensory Integration' }
  }
  if (searchStr.includes('animal') || searchStr.includes('heavy') || searchStr.includes('walk')) {
    const matched = availableList.find(e => e.id === 'ex-02') || availableList.find(e => e.id === 'ex-03')
    return { ...matched, name: typeof item === 'string' ? item : item.name, category: 'Proprioceptive & Core' }
  }
  if (searchStr.includes('jump') || searchStr.includes('hop') || searchStr.includes('active')) {
    const matched = availableList.find(e => e.id === 'ex-01') || availableList.find(e => e.id === 'ex-04')
    return { ...matched, name: typeof item === 'string' ? item : item.name, category: 'Gross Motor & Agility' }
  }
  if (searchStr.includes('puzzle') || searchStr.includes('sort') || searchStr.includes('shape')) {
    const matched = availableList.find(e => e.id === 'ex-18') || availableList.find(e => e.id === 'ex-20')
    return { ...matched, name: typeof item === 'string' ? item : item.name, category: 'Cognitive & Visual Spatial' }
  }
  if (searchStr.includes('social') || searchStr.includes('behaviour') || searchStr.includes('behavior')) {
    const matched = availableList.find(e => e.id === 'ex-30') || availableList[0]
    return { ...matched, name: typeof item === 'string' ? item : item.name, category: 'Behaviour & Social Skills' }
  }
  if (searchStr.includes('bead') || searchStr.includes('button') || searchStr.includes('zip') || searchStr.includes('hand')) {
    const matched = availableList.find(e => e.id === 'ex-17') || availableList.find(e => e.id === 'ex-19')
    return { ...matched, name: typeof item === 'string' ? item : item.name, category: 'Fine Motor Coordination' }
  }

  // 5. Fallback: match by index hash so an authentic clinical photo is always provided
  const idx = Math.abs(searchStr.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % availableList.length
  const fallbackRef = availableList[idx] || availableList[0]
  return {
    ...fallbackRef,
    id: typeof item === 'object' && item.id ? item.id : `ex-${searchStr.replace(/[^a-z0-9]/g, '-').slice(0, 20)}`,
    name: typeof item === 'string' ? item : item.name || 'Therapy Exercise',
    category: typeof item === 'object' && item.category ? item.category : fallbackRef.category,
    description: typeof item === 'object' && item.description ? item.description : `Clinical exercise recommended for active stimulation, milestone achievement, and daily practice.`,
    home_description: typeof item === 'object' && item.home_description ? item.home_description : `Perform 1-2 sets daily for 10-15 minutes in a comfortable space.`,
    image_url: fallbackRef.image_url
  }
}

export function resolveExerciseList(items = [], availableList = MASTER_EXERCISES) {
  if (!Array.isArray(items) || items.length === 0) return []
  return items.map(item => resolveExerciseItem(item, availableList)).filter(Boolean)
}

export const exerciseService = {

  async getAll() {
    try {
      const data = await db.select('exercises', {
        match: { is_active: true },
        order: { column: 'name', ascending: true }
      })

      if (data && data.length > 0) {
        // Merge remote DB rows with master exercises, always preserving the verified working image_url
        return MASTER_EXERCISES.map((master) => {
          const remote = data.find((d) => d.id === master.id || d.name?.toLowerCase() === master.name?.toLowerCase())
          return remote
            ? { ...master, ...remote, image_url: master.image_url }
            : master
        })
      }
      return MASTER_EXERCISES
    } catch (err) {
      console.warn('exerciseService.getAll fallback notice:', err.message)
      return MASTER_EXERCISES
    }
  },

  async getByProfile(profile) {
    try {
      const data = await db.select('exercises', { match: { is_active: true } })
      if (Array.isArray(data) && data.length > 0) {
        return data.filter(
          (ex) => Array.isArray(ex.for_profiles) && ex.for_profiles.includes(profile)
        )
      }
      return MASTER_EXERCISES
    } catch (err) {
      console.error('exerciseService.getByProfile error:', err.message)
      return MASTER_EXERCISES
    }
  },

  async getHomeExercises() {
    return MASTER_EXERCISES.filter(e => e.is_home_exercise)
  },

  async getClinicExercises() {
    return MASTER_EXERCISES.filter(e => e.is_clinic_exercise)
  },

  async getByIds(ids = []) {
    if (!ids || ids.length === 0) return []
    try {
      const all = await this.getAll()
      return resolveExerciseList(ids, all)
    } catch (err) {
      console.warn('exerciseService.getByIds notice:', err.message)
      return resolveExerciseList(ids, MASTER_EXERCISES)
    }
  },

  /**
   * Safety guard: exercises are strictly prohibited for IEP children.
   * For therapy children without explicit IDs, returns default pathway exercises.
   */
  async getForChild(child, ids = []) {
    if (!child || child.program_type === 'iep') {
      return []
    }
    if (ids && ids.length > 0) {
      return await this.getByIds(ids)
    }

    // Default therapy exercises by category if none assigned yet
    const category = (child.therapy_category || child.diagnosis || child.profile || '').toLowerCase()
    if (category.includes('delay') || category.includes('developmental')) {
      return resolveExerciseList([
        'Prone on Elbows & Tummy Reaching',
        'Therapy Ball Reach',
        'Step-Ups',
        'Pegboard Activity',
        'Sensory Tactile Bin Exploration'
      ])
    }
    if (category.includes('adhd')) {
      return resolveExerciseList([
        'Bear Walk',
        'Frog Jumps',
        'Jumping Jacks',
        'Obstacle Course',
        'Single Leg Stance'
      ])
    }
    if (category.includes('learn') || category.includes('sld')) {
      return resolveExerciseList([
        'Pegboard Activity',
        'Bead Stringing',
        'Cutting with Scissors',
        'Playdough Clay Modeling',
        'Bilateral Hand Clapping & Pat-a-Cake'
      ])
    }
    // Default ASD
    return resolveExerciseList([
      'Swing Therapy (Vestibular Stimulation)',
      'Deep Pressure Sensory Roll',
      'Sensory Tactile Bin Exploration',
      'Oral Motor Straw Blowing & Bubbles',
      'Obstacle Course'
    ])
  }
}

