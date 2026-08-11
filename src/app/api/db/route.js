import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client uses SERVICE_KEY to bypass RLS
export const dynamic = 'force-dynamic'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

function getSupabaseAdmin() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing SUPABASE_SERVICE_KEY or SUPABASE_URL env vars')
  }
  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function POST(req) {
  try {
    const body = await req.json()
    const { action, table, payload, match, id } = body

    const supabase = getSupabaseAdmin()

    // ─── INSERT ───────────────────────────
    if (action === 'insert') {
      const { data, error } = await supabase
        .from(table)
        .insert(payload)
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
      let query = supabase.from(table).update(payload)

      if (id) {
        query = query.eq('id', id)
      } else if (match) {
        Object.entries(match).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }

      const { data, error } = await query.select().single()

      if (error) {
        console.error(`[db] UPDATE ${table} failed:`, error)
        return NextResponse.json(
          { success: false, error: error.message, code: error.code, details: error.details },
          { status: 400 }
        )
      }
      return NextResponse.json({ success: true, data })
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
      const { onConflict, row, ...rest } = payload || {}
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
