import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

function isBcryptHash(str) {
  if (typeof str !== 'string') return false
  return /^\$2[abxy]?\$\d{1,2}\$[./A-Za-z0-9]{53}$/.test(str.trim())
}

function ensurePasswordHashed(val) {
  if (!val || typeof val !== 'string') return val
  const trimmed = val.trim()
  if (isBcryptHash(trimmed)) return trimmed
  return bcrypt.hashSync(trimmed, 10)
}

function sanitizeSingleObject(table, payload) {
  if (table !== 'users' && table !== 'parent_accounts') return payload
  if (!payload || typeof payload !== 'object') return payload

  const sanitized = { ...payload }

  // Check all possible field names that might carry a password
  const passFields = ['password_hash', 'password', 'portalPassword', 'portal_password', 'newPassword', 'new_password', 'rawPassword']
  for (const field of passFields) {
    if (sanitized[field] && typeof sanitized[field] === 'string' && sanitized[field].trim()) {
      sanitized.password_hash = ensurePasswordHashed(sanitized[field])
      if (field !== 'password_hash') {
        delete sanitized[field]
      }
    }
  }

  if (sanitized.row && typeof sanitized.row === 'object') {
    sanitized.row = sanitizeSingleObject(table, sanitized.row)
  }

  return sanitized
}

function sanitizeAuthPayload(table, payload) {
  if (Array.isArray(payload)) {
    return payload.map(item => sanitizeSingleObject(table, item))
  }
  return sanitizeSingleObject(table, payload)
}

// Server-side Supabase client uses SERVICE_KEY to bypass RLS, with robust fallbacks for Vercel
export const dynamic = 'force-dynamic'

const FALLBACK_SUPABASE_URL = 'https://midkfahpqowiwkajxeiz.supabase.co'
const FALLBACK_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pZGtmYWhwcW93aXdrYWp4ZWl6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQ5MTgzNCwiZXhwIjoyMTAxMDY3ODM0fQ.mQI6aZIU8ZnfbfmEda_JytrUAexuKqONCuqmyJ2rd60'
const FALLBACK_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pZGtmYWhwcW93aXdrYWp4ZWl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0OTE4MzQsImV4cCI6MjEwMTA2NzgzNH0.DO92sPo8k42VA987ZZDM13eXcIhISqu5bzA3_Eq2_a8'

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || FALLBACK_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY || FALLBACK_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_ANON_KEY
  return createClient(url, key)
}

export async function POST(req) {
  try {
    const body = await req.json()
    const { action, table, payload, match, id } = body

    const supabase = getSupabaseAdmin()
    const sanitizedPayload = sanitizeAuthPayload(table, payload)

    // ─── INSERT ───────────────────────────
    if (action === 'insert') {
      const { data, error } = await supabase
        .from(table)
        .insert(sanitizedPayload)
        .select()
        .single()

      if (error) {
        console.error(`[db] INSERT into ${table} failed:`, error)
        return NextResponse.json(
          { success: false, error: error.message, code: error.code, details: error.details, hint: error.hint },
          { status: 400 }
        )
      }
      return NextResponse.json({ success: true, data })
    }

    // ─── UPDATE ───────────────────────────
    if (action === 'update') {
      let query = supabase.from(table).update(sanitizedPayload)

      if (id) {
        query = query.eq('id', id)
      } else if (match) {
        Object.entries(match).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }

      const { data, error } = await query.select()

      if (error) {
        console.error(`[db] UPDATE ${table} failed:`, error)
        return NextResponse.json(
          { success: false, error: error.message, code: error.code, details: error.details },
          { status: 400 }
        )
      }
      const record = Array.isArray(data) ? (data.length > 0 ? data[0] : null) : data
      return NextResponse.json({ success: true, data: record })
    }

    // ─── SELECT ───────────────────────────
    if (action === 'select') {
      let query = supabase.from(table).select(payload?.select || '*')

      if (match) {
        Object.entries(match).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }
      if (payload?.order) {
        query = query.order(payload.order.column, { ascending: payload.order.ascending ?? false })
      }
      if (payload?.limit) {
        query = query.limit(payload.limit)
      }
      if (payload?.single) {
        const { data, error } = await query.maybeSingle()
        if (error) {
          console.error(`[db] SELECT ${table} failed:`, error)
          return NextResponse.json(
            { success: false, error: error.message, code: error.code },
            { status: 400 }
          )
        }
        return NextResponse.json({ success: true, data })
      }

      const { data, error } = await query
      if (error) {
        console.error(`[db] SELECT ${table} failed:`, error)
        return NextResponse.json(
          { success: false, error: error.message, code: error.code },
          { status: 400 }
        )
      }
      return NextResponse.json({ success: true, data })
    }

    // ─── DELETE ───────────────────────────
    if (action === 'delete') {
      if (table === 'users') {
        const targetUserId = id || (match && match.id)
        if (targetUserId) {
          // Disassociate/nullify any references to this user across tables so foreign keys don't block deletion
          await Promise.allSettled([
            supabase.from('appointments').update({ created_by: null }).eq('created_by', targetUserId),
            supabase.from('children').update({ registered_by: null }).eq('registered_by', targetUserId),
            supabase.from('parent_accounts').update({ created_by: null }).eq('created_by', targetUserId),
            supabase.from('reports').update({ prepared_by_id: null }).eq('prepared_by_id', targetUserId),
            supabase.from('reports').update({ published_by_id: null }).eq('published_by_id', targetUserId),
            supabase.from('assessment_special_school').update({ assessed_by: null }).eq('assessed_by', targetUserId),
            supabase.from('assessment_asd').update({ assessed_by: null }).eq('assessed_by', targetUserId),
            supabase.from('assessment_adhd').update({ assessed_by: null }).eq('assessed_by', targetUserId),
            supabase.from('assessment_developmental_delay').update({ assessed_by: null }).eq('assessed_by', targetUserId),
            supabase.from('assessment_learning_disability').update({ assessed_by: null }).eq('assessed_by', targetUserId),
          ])
        }
      }

      let query = supabase.from(table).delete()
      if (id) {
        query = query.eq('id', id)
      } else if (match) {
        Object.entries(match).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }
      const { error } = await query
      if (error) {
        console.error(`[db] DELETE ${table} failed:`, error)
        // If it's a foreign key constraint and table is users, fallback to deactivating
        if (table === 'users' && error.code === '23503') {
          const targetUserId = id || (match && match.id)
          if (targetUserId) {
            const { error: deactErr } = await supabase.from('users').update({ is_active: false }).eq('id', targetUserId)
            if (!deactErr) {
              return NextResponse.json({ success: true, softDeleted: true, message: 'User deactivated due to historical references.' })
            }
          }
        }
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        )
      }
      return NextResponse.json({ success: true })
    }

    // ─── UPSERT ───────────────────────────
    if (action === 'upsert') {
      // Extract onConflict so it doesn't get inserted as a column
      const { onConflict, row, ...rest } = sanitizedPayload || {}
      const rowData = row || rest
      const opts = onConflict ? { onConflict } : {}
      const { data, error } = await supabase
        .from(table)
        .upsert(rowData, opts)
        .select()
        .single()

      if (error) {
        console.error(`[db] UPSERT ${table} failed:`, error)
        return NextResponse.json(
          { success: false, error: error.message, code: error.code },
          { status: 400 }
        )
      }
      return NextResponse.json({ success: true, data })
    }

    // ─── RPC ──────────────────────────────
    if (action === 'rpc') {
      const { data, error } = await supabase.rpc(payload.fn, payload.args || {})
      if (error) {
        console.error(`[db] RPC ${payload.fn} failed:`, error)
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        )
      }
      return NextResponse.json({ success: true, data })
    }

    return NextResponse.json(
      { success: false, error: `Unknown action: ${action}` },
      { status: 400 }
    )
  } catch (err) {
    console.error('[db] Route error:', err)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    )
  }
}
