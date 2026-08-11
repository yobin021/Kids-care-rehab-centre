import { db } from '../lib/db'

export const authService = {

  async loginStaff(username, password) {
    try {
      // users table: id (uuid), name, username (UNIQUE), password_hash, designation, role, is_active
      const users = await db.select('users', {
        match: { username, password_hash: password, is_active: true }
      })

      const data = Array.isArray(users) ? users[0] : users

      if (!data) {
        return { success: false, error: 'Invalid username or password' }
      }

      const user = {
        id: data.id,            // uuid
        name: data.name,
        username: data.username,
        role: data.role,        // 'admin' | 'staff'
        designation: data.designation || null
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('kcr_user', JSON.stringify(user))
      }

      return { success: true, user }
    } catch (err) {
      console.error('authService.loginStaff error:', err.message)
      return { success: false, error: 'Login failed. Please try again.' }
    }
  },

  async loginParent(phone, password) {
    try {
      // parent_accounts: phone (UNIQUE), password_hash, portal_active, child_id → children
      const accounts = await db.select('parent_accounts', {
        select: '*, children(id, name, diagnosis, profile)',
        match: { phone, password_hash: password, portal_active: true }
      })

      const data = Array.isArray(accounts) ? accounts[0] : accounts

      if (!data) {
        return { success: false, error: 'Invalid phone or password' }
      }

      const child = Array.isArray(data.children) ? data.children[0] : data.children

      const user = {
        id: data.id,                // uuid
        name: data.parent_name,
        phone: data.phone,
        role: 'parent',
        childId: data.child_id,
        childName: child?.name || null
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('kcr_user', JSON.stringify(user))
      }

      return { success: true, user }
    } catch (err) {
      console.error('authService.loginParent error:', err.message)
      return { success: false, error: 'Login failed. Please try again.' }
    }
  },

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kcr_user')
    }
  },

  getCurrentUser() {
    if (typeof window === 'undefined') return null
    try {
      const raw = localStorage.getItem('kcr_user')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }
}
