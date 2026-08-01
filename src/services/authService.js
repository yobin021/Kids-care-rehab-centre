import { supabase } from '../lib/supabase'

export const authService = {

  async loginStaff(username, password) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('password_hash', password)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      return { 
        success: false, 
        error: 'Invalid credentials' 
      }
    }

    const user = {
      id: data.id,
      name: data.name,
      username: data.username,
      role: data.role,
      designation: data.designation
    }

    return { success: true, user }
  },

  async loginParent(phone, password) {
    const { data, error } = await supabase
      .from('parent_accounts')
      .select(`
        *,
        children(id, name, diagnosis, 
          profile)
      `)
      .eq('phone', phone)
      .eq('password_hash', password)
      .eq('portal_active', true)
      .single()

    if (error || !data) {
      return { 
        success: false, 
        error: 'Invalid credentials' 
      }
    }

    const user = {
      id: data.id,
      name: data.parent_name,
      phone: data.phone,
      role: 'parent',
      childId: data.child_id,
      childName: data.children?.name
    }

    return { success: true, user }
  },

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kcr_user')
    }
  },

  getCurrentUser() {
    return null
  }
}
