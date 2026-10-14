import { createClient } from '@supabase/supabase-js'

/**
 * Database helper — routes mutations through /api/db (which uses service key to bypass RLS),
 * with automatic direct Supabase fallback if /api/db is unreachable or fails on Vercel.
 */

const FALLBACK_URL = 'https://midkfahpqowiwkajxeiz.supabase.co'
const FALLBACK_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pZGtmYWhwcW93aXdrYWp4ZWl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0OTE4MzQsImV4cCI6MjEwMTA2NzgzNH0.DO92sPo8k42VA987ZZDM13eXcIhISqu5bzA3_Eq2_a8'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || FALLBACK_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || FALLBACK_ANON_KEY

let directClient = null
function getDirectClient() {
  if (!directClient) {
    directClient = createClient(supabaseUrl, supabaseAnonKey)
  }
  return directClient
}

async function dbFetch(body) {
  try {
    const res = await fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    const json = await res.json().catch(() => null)
    if (res.ok && json?.success) {
      return json.data
    }
    if (json && !json.success) {
      const err = new Error(json.error || 'Database operation failed')
      err.code = json.code
      err.details = json.details
      err.hint = json.hint
      throw err
    }
  } catch (apiErr) {
    // If it's a known constraint error from /api/db, rethrow so callers (e.g. FK retry) handle it
    if (apiErr.code) throw apiErr
    console.warn('/api/db unavailable, falling back to direct Supabase client:', apiErr.message)
  }

  // Direct client fallback
  return executeDirect(body)
}

async function executeDirect(body) {
  const sb = getDirectClient()
  const { action, table, payload, match, id } = body

  if (action === 'insert') {
    const { data, error } = await sb.from(table).insert(payload).select().single()
    if (error) throw error
    return data
  }

  if (action === 'update') {
    let query = sb.from(table).update(payload)
    if (id) query = query.eq('id', id)
    else if (match) {
      Object.entries(match).forEach(([k, v]) => { query = query.eq(k, v) })
    }
    const { data, error } = await query.select()
    if (error) throw error
    return Array.isArray(data) ? (data[0] || null) : data
  }

  if (action === 'select') {
    let query = sb.from(table).select(payload?.select || '*')
    if (match) {
      Object.entries(match).forEach(([k, v]) => { query = query.eq(k, v) })
    }
    if (payload?.order) {
      query = query.order(payload.order.column, { ascending: payload.order.ascending ?? false })
    }
    if (payload?.limit) {
      query = query.limit(payload.limit)
    }
    if (payload?.single) {
      const { data, error } = await query.maybeSingle()
      if (error) throw error
      return data
    }
    const { data, error } = await query
    if (error) throw error
    return data
  }

  if (action === 'delete') {
    let query = sb.from(table).delete()
    if (id) query = query.eq('id', id)
    else if (match) {
      Object.entries(match).forEach(([k, v]) => { query = query.eq(k, v) })
    }
    const { data, error } = await query
    if (error) throw error
    return data
  }

  throw new Error(`Unsupported direct action: ${action}`)
}

export const db = {
  /** INSERT a row and return it */
  async insert(table, payload) {
    return dbFetch({ action: 'insert', table, payload })
  },

  /** UPDATE rows matching `match` or `id` */
  async update(table, payload, { id, match } = {}) {
    return dbFetch({ action: 'update', table, payload, id, match })
  },

  /** SELECT rows (returns array unless payload.single is true) */
  async select(table, { select = '*', match, order, limit, single } = {}) {
    return dbFetch({
      action: 'select',
      table,
      payload: { select, order, limit, single },
      match
    })
  },

  /** DELETE rows matching `match` or `id` */
  async remove(table, criteria = {}) {
    if (typeof criteria === 'string' || typeof criteria === 'number') {
      return dbFetch({ action: 'delete', table, id: criteria, match: { id: criteria } })
    }
    const id = criteria?.id
    const match = criteria?.match || (criteria && !criteria.match && !criteria.id ? criteria : (id ? { id } : undefined))
    return dbFetch({ action: 'delete', table, id, match })
  },

  /** DELETE rows matching `match` or `id` */
  async delete(table, criteria = {}) {
    if (typeof criteria === 'string' || typeof criteria === 'number') {
      return dbFetch({ action: 'delete', table, id: criteria, match: { id: criteria } })
    }
    const id = criteria?.id
    const match = criteria?.match || (criteria && !criteria.match && !criteria.id ? criteria : (id ? { id } : undefined))
    return dbFetch({ action: 'delete', table, id, match })
  },

  /** UPSERT a row */
  async upsert(table, row, onConflict) {
    return dbFetch({
      action: 'upsert',
      table,
      payload: onConflict ? { ...row, onConflict } : row
    })
  },

  /** Call an RPC function */
  async rpc(fn, args = {}) {
    try {
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'rpc', payload: { fn, args } })
      })
      if (res.ok) {
        const json = await res.json()
        if (json.success) return json.data
      }
    } catch (_) {}
    const sb = getDirectClient()
    const { data, error } = await sb.rpc(fn, args)
    if (error) throw error
    return data
  }
}
