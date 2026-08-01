import { supabase } from '../lib/supabase'

export const childrenService = {

  async getAll() {
    const { data, error } = await supabase
      .from('children')
      .select(`
        *,
        parent_accounts(
          parent_name, phone, 
          email, portal_active
        ),
        assessments(count),
        reports(count)
      `)
      .eq('is_active', true)
      .order('created_at', 
        { ascending: false })

    if (error) throw error
    return data
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('children')
      .select(`
        *,
        parent_accounts(
          id, parent_name, relationship,
          phone, email, address,
          portal_active, created_at
        ),
        assessments(
          id, assessment_date,
          isaa_score, isaa_severity,
          profile, status,
          assessed_by
        ),
        reports(
          id, status, created_at,
          published_at, prepared_by,
          published_by
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async generateChildId() {
    try {
      const { data, error } = await supabase
        .rpc('get_next_child_id')

      if (!error && data) return data
    } catch (e) {
      console.warn('get_next_child_id RPC not found, generating fallback ID:', e.message)
    }

    const year = new Date().getFullYear()
    return `KCR-${year}-${Math.floor(Math.random() * 900) + 100}`
  },

  async create(childData, userId) {
    const childId = await this.generateChildId()

    // Map camelCase to snake_case for Postgres table columns
    const payload = {
      id: childId,
      name: childData.name,
      dob: childData.dob || childData.date_of_birth,
      age: childData.age,
      gender: childData.gender,
      diagnosis: childData.diagnosis,
      profile: childData.profile,
      school: childData.school || null,
      class: childData.class || null,
      primary_concern: childData.primaryConcern || childData.primary_concern || null,
      referred_by: childData.referredBy || childData.referred_by || 'Self',
      previous_therapy: childData.previousTherapy ?? childData.previous_therapy ?? false,
      previous_therapy_details: childData.previousTherapyDetails || childData.previous_therapy_details || null,
      registered_date: new Date().toISOString().split('T')[0],
      is_active: true
    }

    // Try inserting with registered_by
    try {
      const { data, error } = await supabase
        .from('children')
        .insert({
          ...payload,
          registered_by: userId || null
        })
        .select()
        .single()

      if (!error && data) return data
      if (error) console.warn('Supabase children insert error (with registered_by):', error.message)
    } catch (e) {
      console.warn('Children insert error:', e.message)
    }

    // Fallback without registered_by if foreign key error occurs
    const { data, error } = await supabase
      .from('children')
      .insert(payload)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id, childData) {
    const payload = {
      name: childData.name,
      gender: childData.gender,
      diagnosis: childData.diagnosis,
      profile: childData.profile,
      school: childData.school || null,
      class: childData.class || null,
      primary_concern: childData.primaryConcern || childData.primary_concern || null,
      referred_by: childData.referredBy || childData.referred_by || null,
      previous_therapy: childData.previousTherapy ?? childData.previous_therapy,
      previous_therapy_details: childData.previousTherapyDetails || childData.previous_therapy_details || null
    }

    // Clean undefined fields
    Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key])

    const { data, error } = await supabase
      .from('children')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async search(query) {
    const { data, error } = await supabase
      .from('children')
      .select('*')
      .or(`name.ilike.%${query}%,id.ilike.%${query}%`)
      .eq('is_active', true)

    if (error) throw error
    return data
  }
}
