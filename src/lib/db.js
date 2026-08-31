/**
 * Database helper — routes all mutations through /api/db
 * which uses SUPABASE_SERVICE_KEY server-side (bypasses RLS).
 */

async function dbFetch(body) {
  const res = await fetch('/api/db', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })

  const json = await res.json()

  if (!json.success) {
    const err = new Error(json.error || 'Database operation failed')
    err.code = json.code
    err.details = json.details
    err.hint = json.hint
    throw err
  }

  return json.data
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
  async remove(table, { id, match } = {}) {
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
    return dbFetch({ action: 'rpc', payload: { fn, args } })
  }
}
